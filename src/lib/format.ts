import type { OrderStatus } from "@/lib/types/database";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Money is stored as integer cents everywhere. Convert only at the edge. */
export function money(cents: number | null | undefined): string {
  return currency.format((cents ?? 0) / 100);
}

export function clockTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function minutesUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60000));
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for collection",
  courier_assigned: "Courier assigned",
  picked_up: "Collected",
  en_route: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Tailwind classes for the status pill, keyed off the design tokens. */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-surface-container-highest text-on-surface-variant",
  confirmed: "bg-tertiary/15 text-tertiary",
  preparing: "bg-tertiary/15 text-tertiary",
  ready: "bg-primary/15 text-primary",
  courier_assigned: "bg-primary/15 text-primary",
  picked_up: "bg-primary/15 text-primary",
  en_route: "bg-primary/20 text-primary",
  delivered: "bg-secondary-container text-on-surface",
  cancelled: "bg-error-container/40 text-error",
};

/** Statuses where the live map is worth showing. */
export const LIVE_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "courier_assigned",
  "picked_up",
  "en_route",
];

export function isLive(status: OrderStatus): boolean {
  return LIVE_STATUSES.includes(status);
}

export function priceLevel(level: number): string {
  return "$".repeat(Math.max(1, Math.min(4, level)));
}

export function initials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
