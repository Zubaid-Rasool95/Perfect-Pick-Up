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
