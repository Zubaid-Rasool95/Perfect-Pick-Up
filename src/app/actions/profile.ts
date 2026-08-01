"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface ProfileFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Tell us your name.").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  avatarUrl: z.string().trim().url("Enter a valid image URL.").optional().or(z.literal("")),
});

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser("/profile");

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    avatarUrl: formData.get("avatarUrl"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true };
}

const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a label.").max(60),
  line1: z.string().trim().min(4, "Enter the street address.").max(200),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  postcode: z.string().trim().max(20).optional().or(z.literal("")),
  lat: z.string().trim().optional().or(z.literal("")),
  lng: z.string().trim().optional().or(z.literal("")),
  isDefault: z.coerce.boolean(),
});

/** Blank or unparseable coordinates just mean "no pin on the map". */
function toCoord(value: string | undefined, min: number, max: number): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export async function addAddress(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser("/profile");

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    line1: formData.get("line1"),
    city: formData.get("city"),
    postcode: formData.get("postcode"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();

  // Only one default at a time.
  if (parsed.data.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: parsed.data.label,
    line1: parsed.data.line1,
    city: parsed.data.city || null,
    postcode: parsed.data.postcode || null,
    lat: toCoord(parsed.data.lat, -90, 90),
    lng: toCoord(parsed.data.lng, -180, 180),
    is_default: parsed.data.isDefault,
  });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function deleteAddress(formData: FormData) {
  const user = await requireUser("/profile");
  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return;

  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);

  revalidatePath("/profile");
  revalidatePath("/checkout");
}

export async function makeAddressDefault(formData: FormData) {
  const user = await requireUser("/profile");
  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return;

  const supabase = await createClient();
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  revalidatePath("/profile");
  revalidatePath("/checkout");
}
