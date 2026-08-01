import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LiveTracker } from "@/components/tracking/LiveTracker";
import { getLatestCourierLocation, getOrderByCode } from "@/lib/data/orders";
import { requireUser } from "@/lib/auth";
import {
  ORDER_STATUS_LABEL,
  clockTime,
  isLive,
  minutesUntil,
  money,
} from "@/lib/format";
import { initials } from "@/lib/format";
import type { OrderStatus } from "@/lib/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return { title: `Order ${code}` };
}

/** The four milestones the stepper shows, and which statuses satisfy each. */
const STEPS: { key: string; label: string; symbol: string; satisfiedBy: OrderStatus[] }[] = [
  {
    key: "confirmed",
    label: "Confirmed",
    symbol: "check",
    satisfiedBy: ["confirmed", "preparing", "ready", "courier_assigned", "picked_up", "en_route", "delivered"],
  },
  {
    key: "preparing",
    label: "Preparing",
    symbol: "skillet",
    satisfiedBy: ["preparing", "ready", "courier_assigned", "picked_up", "en_route", "delivered"],
  },
  {
    key: "courier",
    label: "Courier Assigned",
    symbol: "local_shipping",
    satisfiedBy: ["courier_assigned", "picked_up", "en_route", "delivered"],
  },
  { key: "delivered", label: "Delivered", symbol: "done_all", satisfiedBy: ["delivered"] },
];

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  await requireUser(`/track/${code}`);

  const order = await getOrderByCode(code);
  if (!order) notFound();

  const initialLocation = await getLatestCourierLocation(order.id);

  const eventTimes = new Map<OrderStatus, string>();
  for (const event of order.order_events ?? []) {
    if (!eventTimes.has(event.status)) eventTimes.set(event.status, event.created_at);
  }

  const completedCount = STEPS.filter((step) => step.satisfiedBy.includes(order.status)).length;
  const activeIndex = Math.min(completedCount, STEPS.length - 1);
  const progressPercent =
    STEPS.length > 1 ? (Math.max(0, completedCount - 1) / (STEPS.length - 1)) * 100 : 0;

  const etaMins = minutesUntil(order.eta_at);
  const courier = order.couriers;

  return (
    <>
      <SiteHeader />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {query.new ? (
            <div className="px-margin-mobile md:px-margin-desktop pt-lg">
              <div className="max-w-7xl mx-auto bg-primary/10 border border-primary/30 rounded-lg px-md py-sm font-body-md text-body-md text-primary">
                Order placed. {order.pickup_name} has it now — you can watch it from here.
              </div>
            </div>
          ) : null}

          {/* Header */}
          <section className="w-full px-margin-mobile md:px-margin-desktop py-lg">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
              <div className="flex flex-col gap-xs">
                <span className="font-label-md text-label-md text-primary uppercase tracking-[0.2em]">
                  {isLive(order.status) ? "Live Tracking" : "Order Record"}
                </span>
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase">
                  Order {order.code}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  {order.status === "delivered"
                    ? `Delivered at ${clockTime(order.delivered_at)}`
                    : order.status === "cancelled"
                      ? `Cancelled at ${clockTime(order.cancelled_at)}`
                      : `Estimated arrival: ${clockTime(order.eta_at)}${
                          etaMins !== null ? ` (${etaMins} mins)` : ""
                        }`}
                </p>
              </div>

              <div className="flex items-center gap-sm bg-surface-container px-md py-sm rounded-lg border border-outline-variant/20">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLive(order.status) ? "bg-primary animate-pulse" : "bg-outline"
                  }`}
                />
                <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
            </div>
          </section>

          {/* Map + sidebar */}
          <section className="w-full px-margin-mobile md:px-margin-desktop pb-xl">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              <div className="lg:col-span-8">
                <LiveTracker
                  orderId={order.id}
                  orderCode={order.code}
                  initialStatus={order.status}
                  pickup={{
                    lat: order.pickup_lat,
                    lng: order.pickup_lng,
                    label: order.pickup_name,
                    sublabel: order.pickup_address,
                  }}
                  dropoff={
                    order.dropoff_lat != null && order.dropoff_lng != null
                      ? {
                          lat: order.dropoff_lat,
                          lng: order.dropoff_lng,
                          label: order.dropoff_label,
                          sublabel: order.dropoff_address,
                        }
                      : null
                  }
                  courierName={courier?.full_name ?? null}
                  initialLocation={initialLocation}
                />

                {order.dropoff_lat == null ? (
                  <p className="mt-sm font-body-sm text-body-sm text-on-surface-variant">
                    No coordinates were saved for this delivery address, so the map only shows the
                    restaurant and the courier. Add a location to a saved address in{" "}
                    <Link href="/profile" className="text-primary hover:underline">
                      your profile
                    </Link>{" "}
                    to see the full route.
                  </p>
                ) : null}
              </div>

              <div className="lg:col-span-4 flex flex-col gap-gutter">
                {/* Progress stepper */}
                <div className="bg-surface-container p-md rounded-xl border border-outline-variant/10">
                  <div className="flex flex-col gap-lg relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-outline-variant/30" />
                    <div
                      className="absolute left-[15px] top-4 w-[2px] bg-primary transition-all duration-1000 ease-out"
                      style={{ height: `${progressPercent}%` }}
                    />

                    {STEPS.map((step, index) => {
                      const done = step.satisfiedBy.includes(order.status);
                      const active = index === activeIndex && !done;
                      const timestamp = eventTimes.get(step.satisfiedBy[0]);

                      return (
                        <div
                          key={step.key}
                          className={`flex gap-md relative z-10 ${
                            done || active ? "" : "opacity-40"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              done
                                ? "bg-primary text-on-primary"
                                : active
                                  ? "bg-primary text-on-primary shadow-[0_0_15px_rgba(255,185,93,0.4)]"
                                  : "bg-surface-variant text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {done ? "check" : step.symbol}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`font-title-lg text-body-md ${
                                active ? "text-primary" : "text-on-surface"
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {timestamp
                                ? clockTime(timestamp)
                                : step.key === "delivered"
                                  ? `Estimated ${clockTime(order.eta_at)}`
                                  : "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Courier card */}
                {courier ? (
                  <div className="bg-surface-container-high p-md rounded-xl border border-outline-variant/20 shadow-md">
                    <div className="flex items-center gap-md mb-md">
                      {courier.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          src={courier.avatar_url}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <span className="w-16 h-16 rounded-full border-2 border-primary/20 bg-surface-container flex items-center justify-center font-headline-lg text-headline-lg text-primary">
                          {initials(courier.full_name)}
                        </span>
                      )}
                      <div className="flex flex-col">
                        <h3 className="font-title-lg text-title-lg text-on-surface">
                          {courier.full_name}
                        </h3>
                        <div className="flex items-center gap-xs">
                          <span
                            className="material-symbols-outlined text-primary text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface">
                            {courier.rating}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant ml-xs">
                            • {courier.trips_count.toLocaleString()}+ Pick Ups
                          </span>
                        </div>
                        {courier.vehicle ? (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {courier.vehicle}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {courier.phone ? (
                      <a
                        href={`tel:${courier.phone}`}
                        className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                        Call Courier
                      </a>
                    ) : null}
                  </div>
                ) : (
                  <div className="bg-surface-container-high p-md rounded-xl border border-outline-variant/20 flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      person_search
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      No courier assigned yet. {order.pickup_name} will assign one as your order
                      gets close to ready.
                    </p>
                  </div>
                )}

                {/* Order summary */}
                <div className="bg-surface-container p-md rounded-xl border border-outline-variant/10">
                  <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">
                    Order Summary
                  </h2>
                  <div className="flex flex-col gap-sm">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-md">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md text-on-surface">
                            {item.quantity > 1 ? `${item.quantity} × ` : ""}
                            {item.name_snapshot}
                          </span>
                          {item.options_snapshot ? (
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {item.options_snapshot}
                            </span>
                          ) : null}
                        </div>
                        <span className="font-body-md text-body-md text-on-surface whitespace-nowrap">
                          {money(item.line_total_cents)}
                        </span>
                      </div>
                    ))}

                    <SummaryRow label="Subtotal" value={money(order.subtotal_cents)} divider />
                    <SummaryRow label="Concierge Fee" value={money(order.service_fee_cents)} />
                    <SummaryRow label="Tax" value={money(order.tax_cents)} />
                    {order.tip_cents > 0 ? (
                      <SummaryRow label="Courier Tip" value={money(order.tip_cents)} />
                    ) : null}

                    <div className="flex justify-between items-center pt-md mt-sm border-t border-primary/20">
                      <span className="font-title-lg text-title-lg text-primary uppercase">Total</span>
                      <span className="font-headline-lg text-headline-lg text-primary">
                        {money(order.total_cents)}
                      </span>
                    </div>
                  </div>

                  {order.notes ? (
                    <p className="mt-md pt-md border-t border-outline-variant/10 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="text-on-surface">Your note:</span> {order.notes}
                    </p>
                  ) : null}
                </div>

                <Link
                  href="/orders"
                  className="text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
                >
                  All my orders
                </Link>
              </div>
            </div>
          </section>

          <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px]" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function SummaryRow({
  label,
  value,
  divider = false,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center ${
        divider ? "py-sm mt-sm border-t border-outline-variant/10" : ""
      }`}
    >
      <span className="font-label-md text-label-md text-on-surface-variant uppercase">{label}</span>
      <span className="font-body-md text-body-md text-on-surface">{value}</span>
    </div>
  );
}
