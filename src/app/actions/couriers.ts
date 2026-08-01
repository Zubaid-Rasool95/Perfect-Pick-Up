"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export interface CourierFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  createdName?: string;
}

const courierSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the courier's name."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  vehicle: z.string().trim().max(60).optional().or(z.literal("")),
  vendorId: z.string().trim().optional().or(z.literal("")),
});

export async function createCourier(
  _prev: CourierFormState,
  formData: FormData
): Promise<CourierFormState> {
  await requireRole(["admin"], "/admin/couriers");

  const parsed = courierSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    vehicle: formData.get("vehicle"),
    vendorId: formData.get("vendorId"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("couriers").insert({
    full_name: parsed.data.fullName,
    phone: parsed.data.phone || null,
    vehicle: parsed.data.vehicle || "Car",
    // Blank means platform-wide rather than tied to one restaurant.
    vendor_id: parsed.data.vendorId || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/couriers");
  return { createdName: parsed.data.fullName };
}

export async function setCourierActive(formData: FormData) {
  await requireRole(["admin"], "/admin/couriers");

  const courierId = String(formData.get("courierId") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!courierId) return;

  const supabase = await createClient();
  await supabase.from("couriers").update({ is_active: isActive }).eq("id", courierId);

  revalidatePath("/admin/couriers");
}

/**
 * Issues a fresh tracking token, which immediately invalidates the courier's
 * old device link. Use when a phone is lost or a courier leaves.
 */
export async function rotateCourierToken(formData: FormData) {
  await requireRole(["admin"], "/admin/couriers");

  const courierId = String(formData.get("courierId") ?? "");
  if (!courierId) return;

  const supabase = await createClient();
  await supabase
    .from("couriers")
    .update({ tracking_token: crypto.randomUUID() })
    .eq("id", courierId);

  revalidatePath("/admin/couriers");
}
