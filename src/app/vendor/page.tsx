import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveVendor } from "@/lib/data/vendor-scope";
import { listVendorOrders } from "@/lib/data/orders";
import { OrderQueue } from "@/components/admin/OrderQueue";
import { VendorSwitcher } from "@/components/dashboard/VendorSwitcher";
import { money } from "@/lib/format";
import type { Courier } from "@/lib/types/database";

export const metadata = { title: "Orders" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string; filter?: string }>;
}) {
  const { vendor: vendorParam, filter } = await searchParams;
  const { vendors, active } = await resolveActiveVendor(vendorParam);

  const showAll = filter === "all";
  const orders = await listVendorOrders(active.id, { liveOnly: !showAll });

  const supabase = await createClient();
  // Platform-wide couriers plus any dedicated to this restaurant.
  const { data: couriers } = await supabase
    .from("couriers")
    .select("*")
    .eq("is_active", true)
    .or(`vendor_id.is.null,vendor_id.eq.${active.id}`)
    .order("full_name");

  const todayCents = orders
    .filter(
      (order) =>
        order.status !== "cancelled" &&
        new Date(order.placed_at).toDateString() === new Date().toDateString()
    )
    .reduce((sum, order) => sum + order.total_cents, 0);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
            {active.name}
          </h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {active.is_active ? "Live and accepting orders" : "Hidden from customers"} ·{" "}
            {money(todayCents)} today
          </span>
        </div>

        <div className="flex items-center gap-md flex-wrap">
          <VendorSwitcher vendors={vendors} activeId={active.id} />
          <Link
            href={`/restaurants/${active.slug}`}
            className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
          >
            View Public Page
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-sm">
        <Link
          href={`/vendor?vendor=${active.id}`}
          className={`px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all ${
            showAll
              ? "bg-surface-container-high text-on-surface-variant"
              : "bg-primary text-on-primary"
          }`}
        >
          In Flight
        </Link>
        <Link
          href={`/vendor?vendor=${active.id}&filter=all`}
          className={`px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all ${
            showAll
              ? "bg-primary text-on-primary"
              : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          All Orders
        </Link>
      </div>

      <OrderQueue
        orders={orders}
        couriers={(couriers ?? []) as Courier[]}
        emptyMessage={
          showAll
            ? "No orders yet. Once customers order from your menu they'll land here."
            : "Nothing cooking right now."
        }
      />
    </div>
  );
}
