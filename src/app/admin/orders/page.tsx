import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderQueue } from "@/components/admin/OrderQueue";
import { LIVE_STATUSES } from "@/lib/format";
import type { Courier, OrderWithDetail } from "@/lib/types/database";

export const metadata = { title: "Orders" };

const SELECT = `
  *,
  vendors ( id, name, slug, hero_image_url, phone ),
  couriers ( id, full_name, avatar_url, phone, rating, trips_count, vehicle ),
  order_items ( * ),
  order_events ( * )
`;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const showAll = filter === "all";

  const supabase = await createClient();

  let query = supabase.from("orders").select(SELECT).order("placed_at", { ascending: false });
  if (!showAll) query = query.in("status", LIVE_STATUSES);

  const [{ data: orders }, { data: couriers }] = await Promise.all([
    query.limit(60),
    supabase.from("couriers").select("*").eq("is_active", true).order("full_name"),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center gap-sm">
        <Link
          href="/admin/orders"
          className={`px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all ${
            showAll
              ? "bg-surface-container-high text-on-surface-variant"
              : "bg-primary text-on-primary"
          }`}
        >
          In Flight
        </Link>
        <Link
          href="/admin/orders?filter=all"
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
        orders={(orders ?? []) as OrderWithDetail[]}
        couriers={(couriers ?? []) as Courier[]}
        emptyMessage={
          showAll ? "No orders have been placed yet." : "Nothing in flight right now."
        }
      />
    </div>
  );
}
