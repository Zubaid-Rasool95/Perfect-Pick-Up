import "server-only";

import { createClient } from "@/lib/supabase/server";
import { LIVE_STATUSES } from "@/lib/format";
import type { CourierLocation, Order, OrderWithDetail } from "@/lib/types/database";

const DETAIL_SELECT = `
  *,
  vendors ( id, name, slug, hero_image_url, phone ),
  couriers ( id, full_name, avatar_url, phone, rating, trips_count, vehicle ),
  order_items ( * ),
  order_events ( * )
`;

/** RLS decides visibility: customers see their own, vendors see theirs. */
export async function getOrderByCode(code: string): Promise<OrderWithDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(DETAIL_SELECT)
    .eq("code", code)
    .maybeSingle();

  return (data as OrderWithDetail | null) ?? null;
}

export async function listMyOrders(limit = 25): Promise<OrderWithDetail[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select(DETAIL_SELECT)
    .eq("customer_id", user.id)
    .order("placed_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as OrderWithDetail[];
}

/** The order the "Track Order" nav item should jump to. */
export async function getActiveOrder(): Promise<Order | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .in("status", LIVE_STATUSES)
    .order("placed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as Order | null) ?? null;
}

/** Seed position for the map before the first realtime frame arrives. */
export async function getLatestCourierLocation(
  orderId: string
): Promise<CourierLocation | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courier_locations")
    .select("*")
    .eq("order_id", orderId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as CourierLocation | null) ?? null;
}

/** Orders queue for a vendor dashboard. */
export async function listVendorOrders(
  vendorId: string,
  { liveOnly = false, limit = 50 } = {}
): Promise<OrderWithDetail[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(DETAIL_SELECT)
    .eq("vendor_id", vendorId)
    .order("placed_at", { ascending: false })
    .limit(limit);

  if (liveOnly) query = query.in("status", LIVE_STATUSES);

  const { data } = await query;
  return (data ?? []) as OrderWithDetail[];
}
