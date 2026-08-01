import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getActiveOrder } from "@/lib/data/orders";

/**
 * Legacy entry point. Jumps to whatever order is currently in flight, or to
 * the order history if there isn't one.
 */
export default async function Page() {
  await requireUser("/track-order");

  const active = await getActiveOrder();
  redirect(active ? `/track/${active.code}` : "/orders");
}
