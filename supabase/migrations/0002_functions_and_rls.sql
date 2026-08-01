-- =============================================================================
-- Perfect Pick Up — helper functions, triggers, RLS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Role helpers.
-- These are SECURITY DEFINER so that a policy on `profiles` can read a role
-- without re-entering `profiles` policies and recursing forever.
-- -----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- True when the current user owns the given vendor (or is an admin).
create or replace function public.can_manage_vendor(target_vendor uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (
        select 1 from public.vendors v
        where v.id = target_vendor and v.owner_id = auth.uid()
      );
$$;

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch   on public.profiles;
drop trigger if exists vendors_touch    on public.vendors;
drop trigger if exists menu_items_touch on public.menu_items;
drop trigger if exists orders_touch     on public.orders;

create trigger profiles_touch   before update on public.profiles   for each row execute function public.touch_updated_at();
create trigger vendors_touch    before update on public.vendors    for each row execute function public.touch_updated_at();
create trigger menu_items_touch before update on public.menu_items for each row execute function public.touch_updated_at();
create trigger orders_touch     before update on public.orders     for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create a profile whenever someone signs up.
-- full_name / phone come through from the signup metadata.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Order codes: PP-#####
-- -----------------------------------------------------------------------------
create sequence if not exists public.order_code_seq start 88291;

create or replace function public.next_order_code()
returns text
language sql
volatile
as $$
  select 'PP-' || nextval('public.order_code_seq')::text;
$$;

-- Stamp the milestone column matching the new status, so the tracker never
-- has to infer timings. Must be BEFORE, to modify the row being written.
create or replace function public.stamp_order_milestone()
returns trigger
language plpgsql
as $$
declare
  v_changed boolean;
begin
  -- Note the explicit branch: SQL's OR does not short-circuit, and OLD is
  -- unassigned during INSERT, so a combined condition would error.
  if tg_op = 'INSERT' then
    v_changed := true;
  else
    v_changed := new.status is distinct from old.status;
  end if;

  if v_changed then
    new.confirmed_at := case when new.status = 'confirmed' then coalesce(new.confirmed_at, now()) else new.confirmed_at end;
    new.preparing_at := case when new.status = 'preparing' then coalesce(new.preparing_at, now()) else new.preparing_at end;
    new.picked_up_at := case when new.status = 'picked_up' then coalesce(new.picked_up_at, now()) else new.picked_up_at end;
    new.delivered_at := case when new.status = 'delivered' then coalesce(new.delivered_at, now()) else new.delivered_at end;
    new.cancelled_at := case when new.status = 'cancelled' then coalesce(new.cancelled_at, now()) else new.cancelled_at end;
  end if;

  return new;
end;
$$;

-- Append to the timeline.
--
-- AFTER, because order_events.order_id references orders and during BEFORE
-- INSERT the orders row does not exist yet.
--
-- SECURITY DEFINER, because order_events has RLS enabled with no INSERT
-- policy (the timeline is written by this trigger alone, never by a client).
-- Without it, a vendor advancing an order status would run this trigger as
-- `authenticated` and the insert would be rejected by RLS.
create or replace function public.log_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_changed boolean;
begin
  if tg_op = 'INSERT' then
    v_changed := true;
  else
    v_changed := new.status is distinct from old.status;
  end if;

  if v_changed then
    insert into public.order_events (order_id, status) values (new.id, new.status);
  end if;

  return null;
end;
$$;

drop trigger if exists orders_log_status       on public.orders;
drop trigger if exists orders_stamp_milestone  on public.orders;

create trigger orders_stamp_milestone
  before insert or update of status on public.orders
  for each row execute function public.stamp_order_milestone();

create trigger orders_log_status
  after insert or update of status on public.orders
  for each row execute function public.log_order_status();

-- -----------------------------------------------------------------------------
-- place_order — authoritative order creation.
-- Prices are re-read from menu_items here; the client never gets to name a
-- price. Returns the new order's code.
--
-- items shape: [{ "menu_item_id": uuid, "quantity": int, "options": text }]
-- -----------------------------------------------------------------------------
create or replace function public.place_order(
  p_vendor_id       uuid,
  p_items           jsonb,
  p_dropoff_address text,
  p_dropoff_label   text default 'Delivery address',
  p_dropoff_lat     double precision default null,
  p_dropoff_lng     double precision default null,
  p_tip_cents       integer default 0,
  p_notes           text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_vendor    public.vendors%rowtype;
  v_order_id  uuid;
  v_code      text;
  v_subtotal  integer := 0;
  v_tax       integer;
  v_item      jsonb;
  v_menu_item public.menu_items%rowtype;
  v_qty       integer;
  v_line      integer;
begin
  if v_user is null then
    raise exception 'You must be signed in to place an order.' using errcode = '42501';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty.';
  end if;

  select * into v_vendor from public.vendors where id = p_vendor_id and is_active;
  if not found then
    raise exception 'That restaurant is not currently accepting orders.';
  end if;

  v_code := public.next_order_code();

  insert into public.orders (
    code, customer_id, vendor_id, status,
    pickup_name, pickup_address, pickup_lat, pickup_lng,
    dropoff_label, dropoff_address, dropoff_lat, dropoff_lng,
    service_fee_cents, tip_cents, notes,
    eta_at
  ) values (
    v_code, v_user, v_vendor.id, 'pending',
    v_vendor.name, v_vendor.address_line, v_vendor.lat, v_vendor.lng,
    coalesce(p_dropoff_label, 'Delivery address'), p_dropoff_address, p_dropoff_lat, p_dropoff_lng,
    v_vendor.service_fee_cents, greatest(coalesce(p_tip_cents, 0), 0), p_notes,
    now() + make_interval(mins => v_vendor.prep_time_mins + 15)
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_menu_item
    from public.menu_items
    where id = (v_item->>'menu_item_id')::uuid
      and vendor_id = v_vendor.id
      and is_available;

    if not found then
      raise exception 'One of the items in your bag is no longer available.';
    end if;

    v_qty  := greatest(coalesce((v_item->>'quantity')::integer, 1), 1);
    v_line := v_menu_item.price_cents * v_qty;

    insert into public.order_items (
      order_id, menu_item_id, name_snapshot, options_snapshot,
      unit_price_cents, quantity, line_total_cents
    ) values (
      v_order_id, v_menu_item.id, v_menu_item.name, nullif(v_item->>'options', ''),
      v_menu_item.price_cents, v_qty, v_line
    );

    v_subtotal := v_subtotal + v_line;
  end loop;

  if v_subtotal < v_vendor.min_order_cents then
    raise exception 'This restaurant has a minimum order of %.',
      to_char(v_vendor.min_order_cents / 100.0, 'FM999,999.00');
  end if;

  v_tax := round(v_subtotal * 0.0875);  -- 8.75% sales tax

  update public.orders
     set subtotal_cents = v_subtotal,
         tax_cents      = v_tax,
         total_cents    = v_subtotal + v_tax + service_fee_cents + tip_cents
   where id = v_order_id;

  return v_code;
end;
$$;

grant execute on function public.place_order(uuid, jsonb, text, text, double precision, double precision, integer, text) to authenticated;

-- -----------------------------------------------------------------------------
-- record_courier_ping — called from the courier's phone via a token, so it
-- runs unauthenticated. The token is the credential; it must match an active
-- courier. Returns the order code being tracked, if any.
-- -----------------------------------------------------------------------------
create or replace function public.record_courier_ping(
  p_token    uuid,
  p_lat      double precision,
  p_lng      double precision,
  p_heading  double precision default null,
  p_speed    double precision default null,
  p_accuracy double precision default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_courier public.couriers%rowtype;
  v_order   public.orders%rowtype;
begin
  select * into v_courier from public.couriers where tracking_token = p_token and is_active;
  if not found then
    raise exception 'Unknown or deactivated courier link.' using errcode = '42501';
  end if;

  -- The courier's current job, if they have one.
  select * into v_order
  from public.orders
  where courier_id = v_courier.id
    and status in ('courier_assigned', 'picked_up', 'en_route')
  order by placed_at desc
  limit 1;

  insert into public.courier_locations (courier_id, order_id, lat, lng, heading, speed, accuracy)
  values (v_courier.id, v_order.id, p_lat, p_lng, p_heading, p_speed, p_accuracy);

  update public.couriers
     set last_lat = p_lat, last_lng = p_lng, last_seen_at = now(),
         status = case when v_order.id is not null then 'on_trip' else 'available' end
   where id = v_courier.id;

  return jsonb_build_object(
    'courier', v_courier.full_name,
    'order_code', v_order.code,
    'order_status', v_order.status
  );
end;
$$;

grant execute on function public.record_courier_ping(uuid, double precision, double precision, double precision, double precision, double precision) to anon, authenticated;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles          enable row level security;
alter table public.vendors           enable row level security;
alter table public.vendor_hours      enable row level security;
alter table public.menu_categories   enable row level security;
alter table public.menu_items        enable row level security;
alter table public.menu_item_options enable row level security;
alter table public.couriers          enable row level security;
alter table public.addresses         enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.order_events      enable row level security;
alter table public.courier_locations enable row level security;

-- --- profiles ----------------------------------------------------------------
drop policy if exists profiles_select_self  on public.profiles;
drop policy if exists profiles_update_self  on public.profiles;
drop policy if exists profiles_insert_self  on public.profiles;
drop policy if exists profiles_admin_all    on public.profiles;

create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Note: role is deliberately not writable here. Elevating someone to vendor or
-- admin goes through the service-role client in the admin dashboard.
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = public.current_user_role());

create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- --- vendors -----------------------------------------------------------------
drop policy if exists vendors_public_read on public.vendors;
drop policy if exists vendors_owner_write on public.vendors;
drop policy if exists vendors_admin_all   on public.vendors;

create policy vendors_public_read on public.vendors
  for select using (is_active or owner_id = auth.uid() or public.is_admin());

create policy vendors_owner_write on public.vendors
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy vendors_admin_all on public.vendors
  for all using (public.is_admin()) with check (public.is_admin());

-- --- vendor_hours / menu tables ----------------------------------------------
-- Same shape for each: world-readable, writable by the owning vendor or admin.
drop policy if exists vendor_hours_read  on public.vendor_hours;
drop policy if exists vendor_hours_write on public.vendor_hours;
create policy vendor_hours_read  on public.vendor_hours for select using (true);
create policy vendor_hours_write on public.vendor_hours for all
  using (public.can_manage_vendor(vendor_id)) with check (public.can_manage_vendor(vendor_id));

drop policy if exists menu_categories_read  on public.menu_categories;
drop policy if exists menu_categories_write on public.menu_categories;
create policy menu_categories_read  on public.menu_categories for select using (true);
create policy menu_categories_write on public.menu_categories for all
  using (public.can_manage_vendor(vendor_id)) with check (public.can_manage_vendor(vendor_id));

drop policy if exists menu_items_read  on public.menu_items;
drop policy if exists menu_items_write on public.menu_items;
create policy menu_items_read  on public.menu_items for select using (true);
create policy menu_items_write on public.menu_items for all
  using (public.can_manage_vendor(vendor_id)) with check (public.can_manage_vendor(vendor_id));

drop policy if exists menu_item_options_read  on public.menu_item_options;
drop policy if exists menu_item_options_write on public.menu_item_options;
create policy menu_item_options_read on public.menu_item_options for select using (true);
create policy menu_item_options_write on public.menu_item_options for all
  using (exists (select 1 from public.menu_items mi
                 where mi.id = menu_item_id and public.can_manage_vendor(mi.vendor_id)))
  with check (exists (select 1 from public.menu_items mi
                 where mi.id = menu_item_id and public.can_manage_vendor(mi.vendor_id)));

-- --- couriers ----------------------------------------------------------------
-- tracking_token lives on this table, so reads are restricted to staff.
drop policy if exists couriers_staff_read on public.couriers;
drop policy if exists couriers_admin_all  on public.couriers;
create policy couriers_staff_read on public.couriers
  for select using (public.is_admin() or (vendor_id is not null and public.can_manage_vendor(vendor_id)));
create policy couriers_admin_all on public.couriers
  for all using (public.is_admin()) with check (public.is_admin());

-- --- addresses ---------------------------------------------------------------
drop policy if exists addresses_own on public.addresses;
create policy addresses_own on public.addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --- orders ------------------------------------------------------------------
drop policy if exists orders_customer_read on public.orders;
drop policy if exists orders_vendor_rw     on public.orders;
drop policy if exists orders_admin_all     on public.orders;

create policy orders_customer_read on public.orders
  for select using (customer_id = auth.uid() or public.can_manage_vendor(vendor_id));

-- Vendors advance the status of their own orders.
create policy orders_vendor_rw on public.orders
  for update using (public.can_manage_vendor(vendor_id)) with check (public.can_manage_vendor(vendor_id));

create policy orders_admin_all on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- --- order_items / order_events ----------------------------------------------
drop policy if exists order_items_read  on public.order_items;
drop policy if exists order_events_read on public.order_events;

create policy order_items_read on public.order_items
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or public.can_manage_vendor(o.vendor_id))
  ));

create policy order_events_read on public.order_events
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or public.can_manage_vendor(o.vendor_id))
  ));

-- --- courier_locations -------------------------------------------------------
-- Readable only by the customer waiting on that order, the vendor, or an admin.
-- Writes only ever happen through record_courier_ping().
drop policy if exists courier_locations_read on public.courier_locations;
create policy courier_locations_read on public.courier_locations
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or public.can_manage_vendor(o.vendor_id))
  ) or public.is_admin());

-- =============================================================================
-- Realtime — the tracker subscribes to these two tables.
-- =============================================================================
-- Guarded so this migration still succeeds on a database where the default
-- Supabase publication is absent or the tables are already members.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.courier_locations;
    exception when duplicate_object then null; end;

    begin
      alter publication supabase_realtime add table public.orders;
    exception when duplicate_object then null; end;
  else
    raise notice 'Publication supabase_realtime not found — enable Realtime for courier_locations and orders in the dashboard.';
  end if;
end $$;
