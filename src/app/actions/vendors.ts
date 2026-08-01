"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireRole, getSessionUser } from "@/lib/auth";

export interface VendorFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const vendorSchema = z.object({
  name: z.string().trim().min(2, "Give the restaurant a name."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug is required.")
    .regex(slugPattern, "Use lowercase letters, numbers and hyphens only."),
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  cuisine: z.string().trim().max(60).optional().or(z.literal("")),
  heroImageUrl: z.string().trim().url("Enter a valid image URL.").optional().or(z.literal("")),
  addressLine: z.string().trim().min(4, "Enter the street address."),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  postcode: z.string().trim().max(20).optional().or(z.literal("")),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().max(120).optional().or(z.literal("")),
  priceLevel: z.coerce.number().int().min(1).max(4),
  prepTimeMins: z.coerce.number().int().min(1).max(240),
  minOrderCents: z.coerce.number().int().min(0).max(1_000_000),
  serviceFeeCents: z.coerce.number().int().min(0).max(100_000),
  isActive: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
  ownerEmail: z.string().trim().optional().or(z.literal("")),
});

function toRow(data: z.infer<typeof vendorSchema>) {
  return {
    name: data.name,
    slug: data.slug,
    tagline: data.tagline || null,
    description: data.description || null,
    cuisine: data.cuisine || null,
    hero_image_url: data.heroImageUrl || null,
    address_line: data.addressLine,
    city: data.city || null,
    postcode: data.postcode || null,
    lat: data.lat,
    lng: data.lng,
    phone: data.phone || null,
    email: data.email || null,
    price_level: data.priceLevel,
    prep_time_mins: data.prepTimeMins,
    min_order_cents: data.minOrderCents,
    service_fee_cents: data.serviceFeeCents,
    is_active: data.isActive,
    is_featured: data.isFeatured,
  };
}

function parseForm(formData: FormData) {
  return vendorSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    cuisine: formData.get("cuisine"),
    heroImageUrl: formData.get("heroImageUrl"),
    addressLine: formData.get("addressLine"),
    city: formData.get("city"),
    postcode: formData.get("postcode"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    priceLevel: formData.get("priceLevel"),
    prepTimeMins: formData.get("prepTimeMins"),
    minOrderCents: formData.get("minOrderCents"),
    serviceFeeCents: formData.get("serviceFeeCents"),
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    ownerEmail: formData.get("ownerEmail"),
  });
}

/**
 * Resolves an owner email to a profile id, promoting that person to the
 * `vendor` role so they can reach their dashboard.
 *
 * Role changes are deliberately blocked by RLS, so this runs service-role —
 * the caller has already been checked as an admin.
 */
async function resolveOwner(email: string): Promise<{ id: string } | { error: string }> {
  const admin = createAdminClient();

  const { data: users, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) return { error: "Could not look up that user." };

  const match = users.users.find(
    (user) => user.email?.toLowerCase() === email.trim().toLowerCase()
  );
  if (!match) {
    return {
      error: `No account exists for ${email}. Ask them to sign up first, then assign them here.`,
    };
  }

  await admin.from("profiles").update({ role: "vendor" }).eq("id", match.id);
  return { id: match.id };
}

export async function createVendor(
  _prev: VendorFormState,
  formData: FormData
): Promise<VendorFormState> {
  await requireRole(["admin"], "/admin/vendors/new");

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let ownerId: string | null = null;
  if (parsed.data.ownerEmail) {
    const owner = await resolveOwner(parsed.data.ownerEmail);
    if ("error" in owner) return { error: owner.error };
    ownerId = owner.id;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("vendors")
    .insert({ ...toRow(parsed.data), owner_id: ownerId });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? `The slug "${parsed.data.slug}" is already taken.`
          : error.message,
    };
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/restaurants");
  redirect("/admin/vendors?created=1");
}

export async function updateVendor(
  _prev: VendorFormState,
  formData: FormData
): Promise<VendorFormState> {
  const vendorId = String(formData.get("vendorId") ?? "");
  if (!vendorId) return { error: "Missing vendor." };

  const user = await getSessionUser();
  const role = user?.profile?.role;
  if (!user || (role !== "admin" && role !== "vendor")) {
    redirect("/?denied=1");
  }

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const row = toRow(parsed.data);
  const supabase = await createClient();

  // A vendor owner may edit their own listing but not flip the platform-level
  // switches, so those are stripped unless an admin is driving.
  let payload: Partial<typeof row> = row;
  if (role !== "admin") {
    payload = { ...row };
    delete payload.is_active;
    delete payload.is_featured;
  }

  // RLS confines a vendor to rows they own.
  const { error } = await supabase.from("vendors").update(payload).eq("id", vendorId);
  if (error) {
    return {
      error:
        error.code === "23505"
          ? `The slug "${parsed.data.slug}" is already taken.`
          : error.message,
    };
  }

  if (role === "admin" && parsed.data.ownerEmail) {
    const owner = await resolveOwner(parsed.data.ownerEmail);
    if ("error" in owner) return { error: owner.error };
    await createAdminClient().from("vendors").update({ owner_id: owner.id }).eq("id", vendorId);
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/vendor/settings");
  revalidatePath(`/restaurants/${parsed.data.slug}`);
  revalidatePath("/restaurants");

  return {};
}

export async function setVendorActive(formData: FormData) {
  await requireRole(["admin"], "/admin/vendors");

  const vendorId = String(formData.get("vendorId") ?? "");
  const isActive = formData.get("isActive") === "true";
  if (!vendorId) return;

  const supabase = await createClient();
  await supabase.from("vendors").update({ is_active: isActive }).eq("id", vendorId);

  revalidatePath("/admin/vendors");
  revalidatePath("/restaurants");
}

export async function deleteVendor(formData: FormData) {
  await requireRole(["admin"], "/admin/vendors");

  const vendorId = String(formData.get("vendorId") ?? "");
  if (!vendorId) return;

  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", vendorId);

  // Orders reference vendors with ON DELETE RESTRICT, so a vendor with
  // history can't be removed — deactivate instead.
  if (error) {
    await supabase.from("vendors").update({ is_active: false }).eq("id", vendorId);
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/restaurants");
}
