import Link from "next/link";
import { advanceOrderStatus, assignCourier } from "@/app/actions/orders";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, dateTime, money } from "@/lib/format";
import type { Courier, OrderStatus, OrderWithDetail } from "@/lib/types/database";

/** What a vendor can move an order to from where it is now. */
const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }[]>> = {
  pending: [
    { status: "confirmed", label: "Accept" },
    { status: "cancelled", label: "Reject" },
  ],
  confirmed: [{ status: "preparing", label: "Start Preparing" }],
  preparing: [{ status: "ready", label: "Mark Ready" }],
  ready: [{ status: "courier_assigned", label: "Courier Collected" }],
  courier_assigned: [{ status: "picked_up", label: "Bag Handed Over" }],
  picked_up: [{ status: "en_route", label: "On the Way" }],
  en_route: [{ status: "delivered", label: "Delivered" }],
};

export function OrderQueue({
  orders,
  couriers,
  emptyMessage,
}: {
  orders: OrderWithDetail[];
  couriers: Courier[];
  emptyMessage: string;
}) {
  if (orders.length === 0) {
    return <p className="font-body-md text-body-md text-on-surface-variant">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-md">
      {orders.map((order) => {
        const transitions = NEXT_STATUS[order.status] ?? [];

        return (
          <div
            key={order.id}
            className="flex flex-col gap-md p-md bg-surface-container rounded-xl border border-outline-variant/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div className="flex flex-col gap-xs min-w-0">
                <div className="flex items-center gap-sm flex-wrap">
                  <Link
                    href={`/track/${order.code}`}
                    className="font-title-lg text-title-lg text-on-surface hover:text-primary transition-colors"
                  >
                    {order.code}
                  </Link>
                  <span
                    className={`font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded ${
                      ORDER_STATUS_TONE[order.status]
                    }`}
                  >
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {order.vendors?.name ?? order.pickup_name} · placed {dateTime(order.placed_at)}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  To: {order.dropoff_label} — {order.dropoff_address}
                </span>
              </div>

              <span className="font-headline-lg text-headline-lg text-primary">
                {money(order.total_cents)}
              </span>
            </div>

            <ul className="flex flex-col gap-xs pt-md border-t border-outline-variant/10">
              {order.order_items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-md font-body-sm text-body-sm text-on-surface-variant"
                >
                  <span>
                    <span className="text-on-surface">
                      {item.quantity} × {item.name_snapshot}
                    </span>
                    {item.options_snapshot ? ` — ${item.options_snapshot}` : ""}
                  </span>
                  <span className="whitespace-nowrap">{money(item.line_total_cents)}</span>
                </li>
              ))}
            </ul>

            {order.notes ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-high rounded-lg px-md py-sm">
                <span className="text-on-surface">Customer note:</span> {order.notes}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-sm pt-md border-t border-outline-variant/10">
              {transitions.map((transition) => (
                <form key={transition.status} action={advanceOrderStatus}>
                  <input type="hidden" name="code" value={order.code} />
                  <input type="hidden" name="status" value={transition.status} />
                  <button
                    type="submit"
                    className={`px-lg py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all ${
                      transition.status === "cancelled"
                        ? "bg-surface-container-high text-error/80 hover:text-error"
                        : "bg-primary text-on-primary hover:brightness-110"
                    }`}
                  >
                    {transition.label}
                  </button>
                </form>
              ))}

              {order.status !== "delivered" && order.status !== "cancelled" ? (
                <form action={assignCourier} className="flex items-center gap-sm ml-auto">
                  <input type="hidden" name="code" value={order.code} />
                  <label
                    className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest"
                    htmlFor={`courier-${order.id}`}
                  >
                    Courier
                  </label>
                  <select
                    id={`courier-${order.id}`}
                    name="courierId"
                    defaultValue={order.courier_id ?? ""}
                    className="bg-surface-dim text-on-surface px-md py-xs rounded-lg border border-outline-variant/20 font-body-sm text-body-sm"
                  >
                    <option value="">Unassigned</option>
                    {couriers.map((courier) => (
                      <option key={courier.id} value={courier.id}>
                        {courier.full_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
                  >
                    Assign
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
