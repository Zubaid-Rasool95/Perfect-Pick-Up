-- =============================================================================
-- Perfect Pick Up — complete database setup
--
-- Generated from supabase/migrations/*.sql. Paste the whole file into
-- Supabase dashboard > SQL Editor and press Run. Safe to re-run.
-- =============================================================================


-- >>> 0001_schema.sql >>>

-- =============================================================================
-- Perfect Pick Up — core schema
-- Multivendor marketplace + courier GPS tracking
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('customer', 'vendor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'pending',           -- placed, awaiting vendor acceptance
    'confirmed',         -- vendor accepted
    'preparing',         -- kitchen working
    'ready',             -- waiting for courier at the counter
    'courier_assigned',  -- courier claimed it
    'picked_up',         -- courier has the bag
    'en_route',          -- moving toward the customer
    'delivered',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.courier_status as enum ('offline', 'available', 'on_trip');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- profiles — 1:1 with auth.users
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  avatar_url   text,
  role         public.user_role not null default 'customer',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Public profile + platform role for each auth user.';

-- -----------------------------------------------------------------------------
-- vendors — the restaurants. Admin creates these; an owner can self-serve.
-- -----------------------------------------------------------------------------
create table if not exists public.vendors (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  tagline           text,
  description       text,
  cuisine           text,
  hero_image_url    text,
  logo_url          text,
  address_line      text not null,
  city              text,
  postcode          text,
  lat               double precision not null,
  lng               double precision not null,
  phone             text,
  email             text,
  rating            numeric(2,1) not null default 5.0,
  rating_count      integer not null default 0,
  price_level       smallint not null default 2 check (price_level between 1 and 4),
  prep_time_mins    integer not null default 20,
  min_order_cents   integer not null default 0,
  service_fee_cents integer not null default 850,
  is_active         boolean not null default true,
  is_featured       boolean not null default false,
  owner_id          uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists vendors_active_idx   on public.vendors (is_active);
create index if not exists vendors_owner_idx    on public.vendors (owner_id);
create index if not exists vendors_featured_idx on public.vendors (is_featured) where is_featured;

-- Opening hours, one row per day the vendor trades.
create table if not exists public.vendor_hours (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  opens_at    time not null,
  closes_at   time not null,
  unique (vendor_id, day_of_week)
);

-- -----------------------------------------------------------------------------
-- Menu
-- -----------------------------------------------------------------------------
create table if not exists public.menu_categories (
  id        uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name      text not null,
  position  integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists menu_categories_vendor_idx on public.menu_categories (vendor_id, position);

create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  vendor_id    uuid not null references public.vendors(id) on delete cascade,
  category_id  uuid references public.menu_categories(id) on delete set null,
  name         text not null,
  description  text,
  image_url    text,
  price_cents  integer not null check (price_cents >= 0),
  is_available boolean not null default true,
  is_signature boolean not null default false,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists menu_items_vendor_idx   on public.menu_items (vendor_id, position);
create index if not exists menu_items_category_idx on public.menu_items (category_id);

-- Modifiers ("Medium Rare", "Extra Aioli", ...) grouped by option_group.
create table if not exists public.menu_item_options (
  id               uuid primary key default gen_random_uuid(),
  menu_item_id     uuid not null references public.menu_items(id) on delete cascade,
  option_group     text not null default 'Options',
  name             text not null,
  price_delta_cents integer not null default 0,
  is_default       boolean not null default false,
  position         integer not null default 0
);

create index if not exists menu_item_options_item_idx on public.menu_item_options (menu_item_id, position);

-- -----------------------------------------------------------------------------
-- Couriers
-- Couriers do not have platform logins. Each carries an unguessable
-- tracking_token that unlocks their GPS broadcast page on their phone.
-- -----------------------------------------------------------------------------
create table if not exists public.couriers (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  phone          text,
  avatar_url     text,
  vehicle        text default 'Car',
  rating         numeric(2,1) not null default 5.0,
  trips_count    integer not null default 0,
  status         public.courier_status not null default 'offline',
  vendor_id      uuid references public.vendors(id) on delete set null, -- null = platform-wide
  tracking_token uuid not null unique default gen_random_uuid(),
  last_lat       double precision,
  last_lng       double precision,
  last_seen_at   timestamptz,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists couriers_vendor_idx on public.couriers (vendor_id);
create index if not exists couriers_token_idx  on public.couriers (tracking_token);

-- -----------------------------------------------------------------------------
-- Customer saved addresses
-- -----------------------------------------------------------------------------
create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text not null default 'Home',
  line1      text not null,
  city       text,
  postcode   text,
  lat        double precision,
  lng        double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- -----------------------------------------------------------------------------
-- Orders
-- Vendor/courier detail is snapshotted so a historical order still renders
-- correctly after a vendor renames itself or a menu item is deleted.
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,
  customer_id        uuid not null references public.profiles(id) on delete cascade,
  vendor_id          uuid not null references public.vendors(id) on delete restrict,
  courier_id         uuid references public.couriers(id) on delete set null,
  status             public.order_status not null default 'pending',

  subtotal_cents     integer not null default 0,
  service_fee_cents  integer not null default 0,
  tax_cents          integer not null default 0,
  tip_cents          integer not null default 0,
  total_cents        integer not null default 0,

  pickup_name        text not null,
  pickup_address     text not null,
  pickup_lat         double precision not null,
  pickup_lng         double precision not null,

  dropoff_label      text not null default 'Delivery address',
  dropoff_address    text not null,
  dropoff_lat        double precision,
  dropoff_lng        double precision,

  notes              text,
  eta_at             timestamptz,
  placed_at          timestamptz not null default now(),
  confirmed_at       timestamptz,
  preparing_at       timestamptz,
  picked_up_at       timestamptz,
  delivered_at       timestamptz,
  cancelled_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders (customer_id, placed_at desc);
create index if not exists orders_vendor_idx   on public.orders (vendor_id, placed_at desc);
create index if not exists orders_courier_idx  on public.orders (courier_id);
create index if not exists orders_status_idx   on public.orders (status);

create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  menu_item_id      uuid references public.menu_items(id) on delete set null,
  name_snapshot     text not null,
  options_snapshot  text,
  unit_price_cents  integer not null,
  quantity          integer not null check (quantity > 0),
  line_total_cents  integer not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- Append-only timeline that drives the tracking stepper.
create table if not exists public.order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     public.order_status not null,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- -----------------------------------------------------------------------------
-- courier_locations — the GPS breadcrumb trail. This is the realtime table.
-- -----------------------------------------------------------------------------
create table if not exists public.courier_locations (
  id          bigserial primary key,
  courier_id  uuid not null references public.couriers(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete cascade,
  lat         double precision not null,
  lng         double precision not null,
  heading     double precision,
  speed       double precision,
  accuracy    double precision,
  recorded_at timestamptz not null default now()
);

create index if not exists courier_locations_order_idx
  on public.courier_locations (order_id, recorded_at desc);
create index if not exists courier_locations_courier_idx
  on public.courier_locations (courier_id, recorded_at desc);


-- >>> 0002_functions_and_rls.sql >>>

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


-- >>> 0003_seed.sql >>>

-- =============================================================================
-- Perfect Pick Up — demo seed data
-- Safe to re-run: everything keys off the vendor slug.
-- =============================================================================

insert into public.vendors
  (slug, name, tagline, cuisine, description, hero_image_url, address_line, city, postcode,
   lat, lng, phone, rating, rating_count, price_level, prep_time_mins, min_order_cents,
   service_fee_cents, is_active, is_featured)
values
  ('lartisan-brasserie', 'L''Artisan Brasserie', 'Modern French, wood-fired',
   'French',
   'A candlelit room off West Adams where the grill never cools. Dry-aged beef, hand-rolled pasta, and a wine list with opinions.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAHif4AVCZKJ3BeAF1s_0OXzZgltCNW3CAgowOe-C_cPjXZ1C7DUF8LKrdT1W04u4i0ggEGjNyDUeRWOogCZ2lkrxAHygict3wB5PlUjUFzP0gYgEk0c0Rm8z2asmMWvMJ3adN_w4a25o01TgeLiupWhPzmLXuKEbPtKisJMsohVVD715nSO7hOer1M-_r3ntTpkQvqqgwhH1SE5ZCDmc9TNEwOg-PVshDLGcUdETZNVctL7fk9xRJgIssvZ_MlD9f_i8-BKzcnPOAP',
   '882 West Adams Blvd', 'New York', '10014',
   40.7359, -74.0036, '+1 (212) 555-0182', 4.9, 1284, 4, 25, 2500, 850, true, true),

  ('kaito-omakase', 'Kaito Omakase', 'Twelve seats, one menu',
   'Japanese',
   'Edomae sushi counter hidden behind an unmarked door. Fish flown in four mornings a week.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAYX3vvTaLW4RAK5Ho9jhZdTqO9paxjCK2yiecfGubQwZTXHkd2YCG0N6cxjwl2iH_kMsew4PIjgdvRjhXPtW-S-RDteFTJ8JRYbkyJwBvBpfk7Ng0Nl03tngHWbLTbGNW4EaV0tQElthz9Y7C5fKQ5YuSKFV0kvKD-GS0y38nIwKhqkEqnrG7yMPHTtEkXNeJcB-wNwUyCawTUDUZa22R2Z9pbcl31GMro4O0sznZh3zShSYHCbNbLW92sYfZ5Gb9lTE5TWzQ9UPBl',
   '17 Cornelia Street', 'New York', '10014',
   40.7318, -74.0029, '+1 (212) 555-0110', 4.8, 642, 4, 35, 4000, 1200, true, true),

  ('roselle-trattoria', 'Roselle Trattoria', 'Pasta, made at 6am',
   'Italian',
   'Family-run since 1974. Everything rolled, cut, and sauced the morning you eat it.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAcPcUg0kvLKjrBT-BQePGn5PaMsfcWRkdNaVXxAdPpD5_w0fGevFlrbJblEcRxMIto9K8iUEEpR3giiNssfG4ePf7Qc5xyDJ95ZoBm-jJ0Y4ZILNVqmO6byyAhe23dEhQhVX540jPx4yr61amTTMqWjzY2k0wtlom-HB--lmE9JXE_sFOysygtrJjSQvuMjLAUS7Gz7txjxyHM93Ywb4NvQXk9EWK5lr2O5IWQZSAhSDbBTJXe__UXRvTWV8njLFVrG5VydNppMaqB',
   '204 Mulberry Street', 'New York', '10012',
   40.7215, -73.9963, '+1 (212) 555-0147', 4.7, 2130, 3, 20, 1500, 650, true, true),

  ('ember-and-ash', 'Ember & Ash', 'Live fire, nothing else',
   'Steakhouse',
   'Whole-animal butchery over Basque-style coals. The chops are the reason to come.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuArV1bYOlrEZbCNuFarwR4LXyZmbaFDEWI1O3NqhDAhl6bQDgF1tPzByus4Z-iyM3qfD2KC0Ut49Z33xWMqW5qtD-jqEu7Zd3fCIk9JdujU2s35VmqiQkVU0E2dCDTvfWAf0LDCEwj-K7042YHDdVGV5RnnrUaN9gXR7N6g8uDoljiM0A9hBj4vGu0XQkNJxLNryCzeT6dNKF2MA44FX0qNRWzH_JS2Ik-MWag9HGYZpaOO-DBBTb06dCYPtyxZKl4yV6gdOSi16ikA',
   '55 Gansevoort Street', 'New York', '10014',
   40.7395, -74.0079, '+1 (212) 555-0166', 4.9, 878, 4, 30, 3000, 950, true, false),

  ('the-golden-hour', 'The Golden Hour', 'Coastal Mediterranean',
   'Mediterranean',
   'Rooftop dining room with a citrus-heavy menu and a very serious martini programme.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuB5QtsdMgiOpNu73En_JXYHQ6MOI8bY8o8KyTE2jbq1zQ_1W6jWHxJBczj6XM0K0GLfKRWa8XWwaylyChTkonsvO5BBYHP66C7cSmF-r64xMNdY_oR-P7Nanl3oEr31ItwSBRas3fK58at_J5oprOPZiTF5xlSitTNEvrcswFdE1DOKN7jh-v0vUawgN9aRUWwmhlW5Eybl8LIt1Zvl6s1NVPwE8y9r-MnH040M6x3tQKIBAQZnXY_-8lf8QsfwDoy-63IQYrl2OY5-',
   '410 Bowery', 'New York', '10012',
   40.7256, -73.9919, '+1 (212) 555-0193', 4.6, 1547, 3, 22, 2000, 750, true, false),

  ('saffron-house', 'Saffron House', 'North Indian, charcoal tandoor',
   'Indian',
   'Clay-oven breads and slow-simmered curries from a kitchen that has not changed its spice grinder in thirty years.',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuB90N-9U9Xo-5a6Iz2iWS58mKlhGC2_3dgiFdFmbrtHHgJjYmirFnmbWG8dnvziBATyvwRCPW7tcwzmlHA4-9dbJ6hTQ3KuyRAF1paaRY3Hblqpvk-Id9aLTzIKisRBoC9CnkXeSs-tWxPzfSv1_TLMWyZZB2FF28yh5ekPjN9sJzZkpeG8VT8wq08SKZ6TE1j1I9WqIaOb1jzO7H3OCXTqrJIlcn6IXkr1OPaF0YPcbR5GLLGLf7dupuPj3ozPtgUCdeJKCQfEVIRt',
   '128 Lexington Avenue', 'New York', '10016',
   40.7443, -73.9821, '+1 (212) 555-0128', 4.8, 3012, 2, 18, 1200, 550, true, false)
on conflict (slug) do nothing;

-- Trading hours: open Tue–Sun, 11:00–23:00.
insert into public.vendor_hours (vendor_id, day_of_week, opens_at, closes_at)
select v.id, d, time '11:00', time '23:00'
from public.vendors v
cross join generate_series(0, 6) as d
where d <> 1
on conflict (vendor_id, day_of_week) do nothing;

-- -----------------------------------------------------------------------------
-- Menus
-- -----------------------------------------------------------------------------
do $$
declare
  v_vendor  uuid;
  v_starters uuid;
  v_mains    uuid;
  v_sides    uuid;
  v_desserts uuid;
begin
  -- ---- L'Artisan Brasserie -------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'lartisan-brasserie';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Starters', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Mains', 1) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Sides', 2) returning id into v_sides;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Desserts', 3) returning id into v_desserts;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, image_url, is_signature, position) values
      (v_vendor, v_starters, 'Steak Tartare', 'Hand-cut sirloin, cured yolk, sourdough crisps.', 2200,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuBFzR8BycyiWE9mPSHrR-cBsNXfI4Qcp6tcp3NaD3s2K1ILDBvKMzUleOwZSJIvlGQxPH18pEOyCh8Ltojn5msAJDypx-6KRfqp_ahK_ECBGU06xxC-vl0i9MKOYOAx5V7sz1nq_gnlEtpyb9vkSq7IQRBKQmXQspr-V2fdCWW_UZn7_BNucrDf2XhNcSOYwrD9QQXdvH4GlvOraSS2qfmR0E0hPoEk5ms-aoSWXGlaaRYHn7DNVgXmwuiDP3lHkB9ZuMRl8QZVREew', false, 0),
      (v_vendor, v_starters, 'Escargots de Bourgogne', 'Garlic-parsley butter, warm baguette.', 1900, null, false, 1),
      (v_vendor, v_mains, 'Truffle Wagyu Burger', 'A5 wagyu, black truffle aioli, aged comté, brioche.', 3400,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuBTnC054VcQ5Vfu8QBsEeeCASDpkmGEbHhVWmsVev_SvksIc9dtxTCkFTFy-0SThWpw0_Egc0OrRHItEMBfd10yM09WdC0v5NC7BhY-tsPvB9umBuAvstr8x8OSIqRV-tbB-wBKzS6u-DOqE6HdR0ZGvpqaC_hV_F8aR-wooT9FwLY4zkv7cDHEnT3z6Fu9kYjgOxcoL_1ec_TX7zLjAScUY_qy6lkPQTQ113P3o1PQ9aqcsfWThnazCQWip684dgUHv0hrJrBdtGhF', true, 0),
      (v_vendor, v_mains, 'Duck à l''Orange', 'Whole roasted leg, bitter orange, pommes purée.', 4200,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuBuHNFwVW3i47S434b1VmBd6dYOZUTnj1-F-JOOxZDvtxHNyFP0txAx0wTJfxIgCl7Lkg8hXZPYHGKo8RpxQlLVIfax4s8zURkGCI8XEWXI-VuhgxqPUrwEasGK8_tp2FnLftD5ETvHdN6dmcgQQuhojovWh7K8B9St1MfJZXfDadZwVpymSgMXAakYNSty6SFQ1Kdc34BAL35lDuMJzkvrQpbSKcwrQfDCiut_Vktn_ue16zhnsyFc6XJw6t3DoIc4jWhbSrvkk8i6', false, 1),
      (v_vendor, v_mains, 'Dover Sole Meunière', 'Filleted tableside-style, brown butter, capers.', 5600, null, false, 2),
      (v_vendor, v_sides, 'Parmesan Truffle Fries', 'Triple-cooked, 24-month parmesan, truffle aioli.', 1200,
       'https://lh3.googleusercontent.com/aida-public/AB6AXuByJyleCqS7G-vA5n6B3o-ksYIHnBQ5UwlEGYnVeqCVKqvCsDZ99RmMbIWOt__WPkU-rJgeH1dtzbz7KC9OhX73q2yj_HgXGEKkshw3ZL6jBGZaRy_psWBtKopdh_dCvxHbIMAafcaiyydU6sVjeDoR6eEtrsYGDiUOAPFj19dgJ7TKG41V1pP-ohicCurnYZ52SPBWP2unLxQ5PJMXxTZQWyCurapRKYYoflMeuE0XICem5TxI1Q73OliqUNp761cM82R1nG21KhRS', true, 0),
      (v_vendor, v_sides, 'Haricots Verts', 'Almond, shallot, brown butter.', 900, null, false, 1),
      (v_vendor, v_desserts, 'Crème Brûlée', 'Tahitian vanilla, torched to order.', 1400, null, false, 0);

    -- Every column is table-qualified: both menu_items and the VALUES alias
    -- expose a `name`, so a bare reference would be ambiguous.
    insert into public.menu_item_options (menu_item_id, option_group, name, price_delta_cents, is_default, position)
    select mi.id, 'Temperature', t.name, 0, t.name = 'Medium Rare', t.pos
    from public.menu_items mi,
         (values ('Rare', 0), ('Medium Rare', 1), ('Medium', 2), ('Well Done', 3)) as t(name, pos)
    where mi.vendor_id = v_vendor and mi.name = 'Truffle Wagyu Burger';

    insert into public.menu_item_options (menu_item_id, option_group, name, price_delta_cents, is_default, position)
    select mi.id, 'Extras', t.name, t.delta, false, t.pos
    from public.menu_items mi,
         (values ('No Onions', 0, 0), ('Extra Aioli', 150, 1), ('Add Foie Gras', 1800, 2)) as t(name, delta, pos)
    where mi.vendor_id = v_vendor and mi.name = 'Truffle Wagyu Burger';
  end if;

  -- ---- Kaito Omakase -------------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'kaito-omakase';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Counter Menu', 0) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'À la Carte', 1) returning id into v_sides;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_mains, 'Omakase — 16 Course', 'Chef''s selection, seasonal. Two hours.', 19500, true, 0),
      (v_vendor, v_mains, 'Omakase — 10 Course', 'The abbreviated counter experience.', 12500, false, 1),
      (v_vendor, v_sides, 'Otoro Nigiri', 'Fatty bluefin, two pieces.', 3200, false, 0),
      (v_vendor, v_sides, 'Uni Toast', 'Hokkaido uni, milk bread, wasabi butter.', 2800, true, 1),
      (v_vendor, v_sides, 'Chawanmushi', 'Savoury egg custard, dashi, snow crab.', 1600, false, 2);
  end if;

  -- ---- Roselle Trattoria ---------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'roselle-trattoria';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Antipasti', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Pasta', 1) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Dolci', 2) returning id into v_desserts;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_starters, 'Burrata & Peach', 'Puglian burrata, grilled peach, basil oil.', 1800, false, 0),
      (v_vendor, v_starters, 'Fritto Misto', 'Calamari, artichoke, lemon.', 2100, false, 1),
      (v_vendor, v_mains, 'Cacio e Pepe', 'Tonnarelli, pecorino romano, black pepper.', 2400, true, 0),
      (v_vendor, v_mains, 'Rigatoni all''Amatriciana', 'Guanciale, San Marzano, chilli.', 2600, false, 1),
      (v_vendor, v_mains, 'Lasagne della Nonna', 'Twelve layers. Sunday only, until it runs out.', 2900, true, 2),
      (v_vendor, v_desserts, 'Tiramisù', 'Made at 6am, served at 6pm.', 1300, false, 0);
  end if;

  -- ---- Ember & Ash ---------------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'ember-and-ash';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'From the Coals', 0) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Sides', 1) returning id into v_sides;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_mains, 'Dry-Aged Ribeye, 45 Day', '600g bone-in, salt, fire, nothing else.', 8800, true, 0),
      (v_vendor, v_mains, 'Iberico Presa', 'Acorn-fed pork shoulder, pickled mustard seed.', 4600, false, 1),
      (v_vendor, v_mains, 'Whole Turbot', 'For two. Bay leaf, lemon, olive oil.', 9500, false, 2),
      (v_vendor, v_sides, 'Charred Hispi Cabbage', 'Anchovy butter, breadcrumb.', 1400, false, 0),
      (v_vendor, v_sides, 'Beef Fat Potatoes', 'Rosemary, sea salt.', 1200, true, 1);
  end if;

  -- ---- The Golden Hour -----------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'the-golden-hour';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Small Plates', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Large Plates', 1) returning id into v_mains;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_starters, 'Whipped Feta', 'Hot honey, urfa chilli, sesame flatbread.', 1600, true, 0),
      (v_vendor, v_starters, 'Octopus a la Plancha', 'Smoked paprika, confit potato.', 2400, false, 1),
      (v_vendor, v_starters, 'Marinated Olives', 'Castelvetrano, orange peel, fennel.', 800, false, 2),
      (v_vendor, v_mains, 'Lamb Shoulder', 'Slow-roasted six hours, pomegranate, mint.', 5200, true, 0),
      (v_vendor, v_mains, 'Branzino', 'Whole grilled, salsa verde, charred lemon.', 3800, false, 1);
  end if;

  -- ---- Saffron House -------------------------------------------------------
  select id into v_vendor from public.vendors where slug = 'saffron-house';
  if v_vendor is not null
     and not exists (select 1 from public.menu_items where vendor_id = v_vendor) then

    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'From the Tandoor', 0) returning id into v_starters;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Curries', 1) returning id into v_mains;
    insert into public.menu_categories (vendor_id, name, position)
    values (v_vendor, 'Breads & Rice', 2) returning id into v_sides;

    insert into public.menu_items (vendor_id, category_id, name, description, price_cents, is_signature, position) values
      (v_vendor, v_starters, 'Malai Tikka', 'Cream-marinated chicken, green chilli, cardamom.', 1900, false, 0),
      (v_vendor, v_starters, 'Tandoori Prawns', 'Ajwain, lime, kachumber.', 2400, false, 1),
      (v_vendor, v_mains, 'Butter Chicken', 'Thirty-year-old recipe. Fenugreek, tomato, cream.', 2200, true, 0),
      (v_vendor, v_mains, 'Lamb Rogan Josh', 'Kashmiri chilli, slow-cooked shoulder.', 2600, false, 1),
      (v_vendor, v_mains, 'Dal Makhani', 'Black lentils, twenty-four hours on the stove.', 1800, true, 2),
      (v_vendor, v_sides, 'Garlic Naan', 'Charred in the clay oven.', 600, false, 0),
      (v_vendor, v_sides, 'Saffron Pilau', 'Basmati, whole spice, fried onion.', 800, false, 1);

    insert into public.menu_item_options (menu_item_id, option_group, name, price_delta_cents, is_default, position)
    select mi.id, 'Heat', t.name, 0, t.name = 'Medium', t.pos
    from public.menu_items mi,
         (values ('Mild', 0), ('Medium', 1), ('Hot', 2), ('Chef''s Heat', 3)) as t(name, pos)
    where mi.vendor_id = v_vendor and mi.name in ('Butter Chicken', 'Lamb Rogan Josh');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Couriers. Each tracking_token is the credential for that courier's phone
-- page at /courier/<token> — regenerate them before going anywhere near
-- production.
-- -----------------------------------------------------------------------------
insert into public.couriers (full_name, phone, vehicle, rating, trips_count, status, avatar_url)
select * from (values
  ('Marcus Vance',  '+1 (212) 555-0301', 'Electric Scooter', 4.9, 1204, 'available'::public.courier_status,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuBJzay_YzY4kT5RVmImFvD2Ah98ES4DfxakCdQhcVVuo1ydCbYcFd6e2bn3ooO2UMa73ZJJwOyGcEYDzkIYIkDo0P499fa5bP8VR1okSsvDRBZjOfFH2BAze-tV0K7CuXeWiRPwGec8j1pGph3txKRPLgn617Lm-Mv_1hufm4vOlJ4SeV04q2zR5c-D8iCV1eLVwUB_JsxI8-pqRnJfhEXFQpqbKh6rTNHdMVnJLzLrBiRBOsehqyuZdTpXf5nCo8N1G_qZkZlMI78o'),
  ('Priya Raman',   '+1 (212) 555-0344', 'Cargo Bike',       4.8,  867, 'available'::public.courier_status, null),
  ('Diego Salazar', '+1 (212) 555-0377', 'Car',              5.0,  432, 'offline'::public.courier_status,   null)
) as c(full_name, phone, vehicle, rating, trips_count, status, avatar_url)
where not exists (select 1 from public.couriers);

