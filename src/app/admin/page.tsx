import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LIVE_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_TONE, dateTime, money } from "@/lib/format";
import type { Order } from "@/lib/types/database";

export const metadata = { title: "Overview" };

async function loadStats() {
  const supabase = await createClient();

  const [vendors, activeVendors, couriers, customers, liveOrders, allOrders] = await Promise.all([
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase.from("vendors").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("couriers").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", LIVE_STATUSES),
    supabase.from("orders").select("total_cents, status"),
  ]);

  const settled = (allOrders.data ?? []).filter((o) => o.status !== "cancelled");
  const revenueCents = settled.reduce((sum, o) => sum + (o.total_cents ?? 0), 0);

  return {
    vendors: vendors.count ?? 0,
    activeVendors: activeVendors.count ?? 0,
    couriers: couriers.count ?? 0,
    customers: customers.count ?? 0,
    liveOrders: liveOrders.count ?? 0,
    totalOrders: settled.length,
    revenueCents,
  };
}

export default async function Page() {
  const supabase = await createClient();
  const stats = await loadStats();

  const { data: recent } = await supabase
    .from("orders")
    .select("*, vendors ( name )")
    .order("placed_at", { ascending: false })
    .limit(8);

  const recentOrders = (recent ?? []) as (Order & { vendors: { name: string } | null })[];

  return (
    <div className="flex flex-col gap-lg">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <Stat label="Restaurants" value={String(stats.vendors)} hint={`${stats.activeVendors} live`} />
        <Stat label="Active Couriers" value={String(stats.couriers)} />
        <Stat label="Orders in Flight" value={String(stats.liveOrders)} accent />
        <Stat label="Gross Volume" value={money(stats.revenueCents)} hint={`${stats.totalOrders} orders`} />
      </section>

      <section className="flex flex-wrap gap-md">
        <Link
          href="/admin/vendors/new"
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          Add Restaurant
        </Link>
        <Link
          href="/admin/couriers"
          className="bg-surface-container-high text-on-surface px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
          Manage Couriers
        </Link>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
          Recent Orders
        </h2>

        {recentOrders.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">
            No orders yet. Once customers start ordering they will show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-sm">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/track/${order.code}`}
                className="flex items-center justify-between gap-md p-md bg-surface-container rounded-lg border border-outline-variant/10 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-body-md text-on-surface truncate">
                    {order.code} · {order.vendors?.name ?? order.pickup_name}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {dateTime(order.placed_at)}
                  </span>
                </div>
                <div className="flex items-center gap-md shrink-0">
                  <span
                    className={`font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded ${
                      ORDER_STATUS_TONE[order.status]
                    }`}
                  >
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                  <span className="font-body-md text-body-md text-primary whitespace-nowrap">
                    {money(order.total_cents)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-md rounded-xl border flex flex-col gap-xs ${
        accent
          ? "bg-primary/10 border-primary/30"
          : "bg-surface-container border-outline-variant/10"
      }`}
    >
      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
        {label}
      </span>
      <span className={`font-headline-xl text-headline-xl ${accent ? "text-primary" : "text-on-surface"}`}>
        {value}
      </span>
      {hint ? (
        <span className="font-body-sm text-body-sm text-on-surface-variant">{hint}</span>
      ) : null}
    </div>
  );
}
