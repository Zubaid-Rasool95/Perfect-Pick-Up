# Perfect Pick Up

A multivendor food marketplace with live courier GPS tracking, built on Next.js 16 (App Router) and Supabase.

Admins onboard restaurants; each restaurant gets its own dashboard to run its menu and order queue; customers order and then watch their courier move across a live map.

---

## Setup

### 1. Environment

```bash
cp .env.local.example .env.local
```

Fill in from **Supabase dashboard → Project Settings → API**:

| Variable | Where to find it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Already filled in |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key | Safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | **Server only.** Bypasses RLS — never commit it |
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` | Used for auth redirects and courier links |

### 2. Database

Run the migrations in order, either through **Supabase dashboard → SQL Editor** or the CLI:

```
supabase/migrations/0001_schema.sql             tables, enums, indexes
supabase/migrations/0002_functions_and_rls.sql  triggers, RPCs, row-level security, realtime
supabase/migrations/0003_seed.sql               6 demo restaurants, menus, 3 couriers
```

`0003_seed.sql` is optional and safe to re-run — it keys off vendor slugs.

### 3. Make yourself an admin

Sign up through `/login`, then run this once:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

`/admin` is now reachable.

### 4. Run

```bash
npm install
npm run dev
```

---

## Roles

| Role | Gets | Guarded by |
|---|---|---|
| `customer` | Ordering, order history, live tracking, saved addresses | Default on signup |
| `vendor` | `/vendor` — order queue, menu editor, restaurant settings | `requireRole(["vendor"])` + RLS on `owner_id` |
| `admin` | `/admin` — restaurants, couriers, all orders, role management | `requireRole(["admin"])` + RLS `is_admin()` |

Admins pass every role check, so they can stand in for any vendor without switching accounts.

**Couriers have no login.** Each carries an unguessable `tracking_token`; `/courier/<token>` opens a GPS broadcaster on their phone. Copy or rotate that link from **Admin → Couriers**. Treat it like a password.

---

## How GPS tracking works

```
Courier phone                     Supabase                    Customer browser
─────────────                     ────────                    ────────────────
watchPosition()
  → POST /api/courier/:token/ping
      → record_courier_ping()  ──→  insert courier_locations
                                         │
                                    realtime broadcast
                                         │
                                         └───────────────→  LiveTracker subscribes
                                                            → marker moves on Leaflet map
                                                            → distance + ETA recompute
```

- **Map**: Leaflet on CARTO dark tiles. No API key, no billing, no usage cap.
- **Ingest**: `POST /api/courier/[token]/ping`, throttled client-side to one write per 5s. The token is the credential — `record_courier_ping` validates it against an active courier before writing anything.
- **Delivery**: Supabase Realtime on `courier_locations` and `orders`, filtered to a single order. RLS means only that order's customer, its vendor, and admins can subscribe.
- **ETA**: straight-line distance inflated 30% to approximate street routing, over an assumed 22 km/h. Good enough for a badge; swap in a routing API if you need it accurate.

Dropoff pins and distance-based ETAs need coordinates on the delivery address — add them under **Profile → Addresses**.

---

## Architecture

```
src/
  proxy.ts                  Session refresh + signed-in guard (this was `middleware` before Next 16)
  lib/
    supabase/server.ts      Request-scoped client (runs under RLS) + service-role client
    supabase/client.ts      Browser client, used for realtime
    auth.ts                 getSessionUser / requireUser / requireRole
    data/                   Server-only query modules
    geo.ts, format.ts       Distance and ETA maths; money and status formatting
  app/
    actions/                Server Actions: auth, orders, vendors, menu, couriers, users, profile
    admin/                  Admin console (role-guarded layout)
    vendor/                 Vendor dashboard (role-guarded layout)
    track/[code]/           Live tracking
    courier/[token]/        Courier GPS broadcaster
    api/courier/[token]/ping   GPS ingest
  components/
    cart/                   Module-level store read via useSyncExternalStore
    map/LiveMap.tsx         Leaflet, dynamically imported (it touches `window`)
    tracking/               LiveTracker, CourierBeacon
```

### Security posture

- **Prices are never trusted from the client.** Checkout posts item IDs and quantities only; the `place_order` SQL function re-reads every price from `menu_items`, enforces the vendor minimum, and computes tax and totals server-side.
- **Row-level security on every table.** Customers see their own orders, vendors see theirs, menus are world-readable but writable only by the owning vendor or an admin.
- **Roles aren't self-assignable.** The `profiles` update policy pins `role`; promotion runs service-role through the admin console only.
- **`couriers` rows are staff-only**, because `tracking_token` lives there.

---

## Routes

| Route | Who |
|---|---|
| `/` | Public — hero search, featured restaurants |
| `/restaurants` | Public — search, cuisine filter, sort, pagination |
| `/restaurants/[slug]` | Public — menu, modifiers, bag |
| `/login` | Public — sign in / sign up / Google |
| `/checkout` | Customer |
| `/orders`, `/track/[code]` | Customer — history and live map |
| `/profile` | Customer — details and address book |
| `/vendor`, `/vendor/menu`, `/vendor/settings` | Vendor |
| `/admin`, `/admin/vendors`, `/admin/couriers`, `/admin/orders`, `/admin/users` | Admin |
| `/courier/[token]` | Courier device, link-only |

`/menu` and `/track-order` are kept as redirects so old links still resolve.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Realtime, RLS) · Leaflet + OpenStreetMap/CARTO · Zod
