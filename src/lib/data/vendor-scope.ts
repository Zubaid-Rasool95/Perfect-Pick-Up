import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { Vendor } from "@/lib/types/database";

/**
 * The restaurants the signed-in user runs.
 *
 * Vendors see the ones they own; admins see everything so they can stand in
 * for a vendor without switching accounts.
 */
export async function getMyVendors(): Promise<Vendor[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const supabase = await createClient();
  const role = user.profile?.role;

  const query = supabase.from("vendors").select("*").order("name");
  const { data } = role === "admin" ? await query : await query.eq("owner_id", user.id);

  return (data ?? []) as Vendor[];
}

/**
 * Resolves which vendor a dashboard page is acting for.
 *
 * `?vendor=<id>` picks one explicitly (for owners of several restaurants and
 * for admins); otherwise we fall back to the first.
 */
export async function resolveActiveVendor(vendorId?: string): Promise<{
  vendors: Vendor[];
  active: Vendor;
}> {
  const vendors = await getMyVendors();

  if (vendors.length === 0) {
    redirect("/vendor/no-restaurant");
  }

  const active = (vendorId && vendors.find((v) => v.id === vendorId)) || vendors[0];
  return { vendors, active };
}
