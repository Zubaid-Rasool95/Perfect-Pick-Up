"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { OrderStatus } from "@/lib/types/database";

export interface CheckoutState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const lineSchema = z.object({
  menu_item_id: z.uuid(),
  quantity: z.number().int().min(1).max(50),
  options: z.string().nullable().optional(),
});

const checkoutSchema = z.object({
  vendorId: z.uuid("Your bag is missing its restaurant. Add an item again."),
  items: z.array(lineSchema).min(1, "Your bag is empty."),
  addressLabel: z.string().trim().min(1).max(60).default("Delivery address"),
  address: z.string().trim().min(6, "Enter the full delivery address."),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  tipCents: z.number().int().min(0).max(100_000).default(0),
  notes: z.string().trim().max(500).nullable().optional(),
});

/**
 * Hands the bag to the `place_order` SQL function, which re-prices every line
 * from the menu — the numbers the browser sends are never trusted.
 */
export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Your bag couldn't be read. Try adding the items again." };
  }

  const parsed = checkoutSchema.safeParse({
    vendorId: formData.get("vendorId"),
    items: rawItems,
    addressLabel: formData.get("addressLabel") || "Delivery address",
    address: formData.get("address"),
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    tipCents: Number(formData.get("tipCents") ?? 0),
    notes: (formData.get("notes") as string) || null,
  });

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return { fieldErrors: flat.fieldErrors, error: flat.formErrors[0] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_vendor_id: parsed.data.vendorId,
    p_items: parsed.data.items,
    p_dropoff_address: parsed.data.address,
    p_dropoff_label: parsed.data.addressLabel,
    p_dropoff_lat: parsed.data.lat ?? null,
    p_dropoff_lng: parsed.data.lng ?? null,
    p_tip_cents: parsed.data.tipCents,
    p_notes: parsed.data.notes ?? null,
  });

  if (error) {
    // place_order raises readable messages for the cases users can fix
    // (empty bag, below minimum, item withdrawn).
    return { error: error.message };
  }

  revalidatePath("/orders");
  redirect(`/track/${data as string}?new=1`);
}

/** Vendor/admin action to move an order along. */
export async function advanceOrderStatus(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  const allowed: OrderStatus[] = [
    "confirmed",
    "preparing",
    "ready",
    "courier_assigned",
    "picked_up",
    "en_route",
    "delivered",
    "cancelled",
  ];
  if (!code || !allowed.includes(status)) return;

  const supabase = await createClient();
  // RLS restricts this to the vendor that owns the order (or an admin).
  await supabase.from("orders").update({ status }).eq("code", code);

  revalidatePath(`/track/${code}`);
  revalidatePath("/vendor");
  revalidatePath("/admin/orders");
}

/** Assign (or clear) the courier on an order. */
export async function assignCourier(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const courierId = String(formData.get("courierId") ?? "");
  if (!code) return;

  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({
      courier_id: courierId || null,
      ...(courierId ? { status: "courier_assigned" as OrderStatus } : {}),
    })
    .eq("code", code);

  revalidatePath(`/track/${code}`);
  revalidatePath("/vendor");
  revalidatePath("/admin/orders");
}
