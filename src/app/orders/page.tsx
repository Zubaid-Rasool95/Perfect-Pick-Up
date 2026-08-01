import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { requireUser } from "@/lib/auth";
import { listMyOrders } from "@/lib/data/orders";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  dateTime,
  isLive,
  money,
} from "@/lib/format";

export const metadata: Metadata = { title: "My Orders" };

export default async function Page() {
  await requireUser("/orders");
  const orders = await listMyOrders();

  return (
    <>
      <SiteHeader />
      <main className="w-full pt-20 bg-surface min-h-screen">
        <section className="px-margin-mobile md:px-margin-desktop py-lg">
          <div className="max-w-7xl mx-auto flex flex-col gap-xs">
            <span className="font-label-md text-label-md text-primary uppercase tracking-[0.3em]">
              History
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase">
              My Orders
            </h1>
          </div>
        </section>

        <section className="px-margin-mobile md:px-margin-desktop pb-xl">
          <div className="max-w-7xl mx-auto flex flex-col gap-md">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-md py-xl">
                <span className="material-symbols-outlined text-outline text-[48px]">receipt_long</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
                  No orders yet
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
                  When you place your first order it will appear here, along with a live map of
                  your courier.
                </p>
                <Link
                  href="/restaurants"
                  className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Browse Restaurants
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/track/${order.code}`}
                  className="group flex flex-col md:flex-row md:items-center gap-md p-md bg-surface-container rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col gap-xs grow min-w-0">
                    <div className="flex items-center gap-sm flex-wrap">
                      <span className="font-title-lg text-title-lg text-on-surface group-hover:text-primary transition-colors">
                        {order.vendors?.name ?? order.pickup_name}
                      </span>
                      <span
                        className={`font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded ${
                          ORDER_STATUS_TONE[order.status]
                        }`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                      {isLive(order.status) ? (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      ) : null}
                    </div>

                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {order.code} · {dateTime(order.placed_at)}
                    </span>

                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {order.order_items
                        .map((item) => `${item.quantity} × ${item.name_snapshot}`)
                        .join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-md shrink-0">
                    <span className="font-headline-lg text-headline-lg text-primary">
                      {money(order.total_cents)}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
