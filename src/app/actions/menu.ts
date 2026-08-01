"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export interface MenuFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
}

/**
 * Vendors and admins both reach these. The database has the final word — the
 * `menu_*` RLS policies call `can_manage_vendor()` — so this only screens out
 * obviously wrong callers before we hit the network.
 */
async function assertStaff() {
  const user = await getSessionUser();
  const role = user?.profile?.role;
  if (!user || (role !== "admin" && role !== "vendor")) {
    redirect("/?denied=1");
  }
}

function refresh(vendorSlug: string | null) {
  revalidatePath("/vendor/menu");
  revalidatePath("/admin/vendors", "layout");
  if (vendorSlug) revalidatePath(`/restaurants/${vendorSlug}`);
}

const categorySchema = z.object({
  vendorId: z.uuid(),
  name: z.string().trim().min(1, "Name the section.").max(60),
  position: z.coerce.number().int().min(0).max(999).default(0),
});

export async function createCategory(
  _prev: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  await assertStaff();

  const parsed = categorySchema.safeParse({
    vendorId: formData.get("vendorId"),
    name: formData.get("name"),
    position: formData.get("position") || 0,
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("menu_categories").insert({
    vendor_id: parsed.data.vendorId,
    name: parsed.data.name,
    position: parsed.data.position,
  });
  if (error) return { error: error.message };

  refresh(String(formData.get("vendorSlug") ?? "") || null);
  return { ok: true };
}

export async function deleteCategory(formData: FormData) {
  await assertStaff();
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!categoryId) return;

  const supabase = await createClient();
  // menu_items.category_id is ON DELETE SET NULL, so dishes survive as
  // uncategorised rather than vanishing with the section.
  await supabase.from("menu_categories").delete().eq("id", categoryId);

  refresh(String(formData.get("vendorSlug") ?? "") || null);
}

const itemSchema = z.object({
  vendorId: z.uuid(),
  itemId: z.uuid().optional().or(z.literal("")),
  categoryId: z.uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Name the dish.").max(120),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  imageUrl: z.string().trim().url("Enter a valid image URL.").optional().or(z.literal("")),
  priceCents: z.coerce.number().int().min(0, "Price can't be negative.").max(1_000_000),
  isAvailable: z.coerce.boolean(),
  isSignature: z.coerce.boolean(),
  position: z.coerce.number().int().min(0).max(999).default(0),
});

export async function saveMenuItem(
  _prev: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  await assertStaff();

  const parsed = itemSchema.safeParse({
    vendorId: formData.get("vendorId"),
    itemId: formData.get("itemId") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    priceCents: formData.get("priceCents"),
    isAvailable: formData.get("isAvailable") === "on",
    isSignature: formData.get("isSignature") === "on",
    position: formData.get("position") || 0,
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const row = {
    vendor_id: parsed.data.vendorId,
    category_id: parsed.data.categoryId || null,
    name: parsed.data.name,
    description: parsed.data.description || null,
    image_url: parsed.data.imageUrl || null,
    price_cents: parsed.data.priceCents,
    is_available: parsed.data.isAvailable,
    is_signature: parsed.data.isSignature,
    position: parsed.data.position,
  };

  const supabase = await createClient();
  const { error } = parsed.data.itemId
    ? await supabase.from("menu_items").update(row).eq("id", parsed.data.itemId)
    : await supabase.from("menu_items").insert(row);

  if (error) return { error: error.message };

  refresh(String(formData.get("vendorSlug") ?? "") || null);
  return { ok: true };
}

export async function deleteMenuItem(formData: FormData) {
  await assertStaff();
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  const supabase = await createClient();
  await supabase.from("menu_items").delete().eq("id", itemId);

  refresh(String(formData.get("vendorSlug") ?? "") || null);
}

export async function toggleMenuItemAvailability(formData: FormData) {
  await assertStaff();
  const itemId = String(formData.get("itemId") ?? "");
  const isAvailable = formData.get("isAvailable") === "true";
  if (!itemId) return;

  const supabase = await createClient();
  await supabase.from("menu_items").update({ is_available: isAvailable }).eq("id", itemId);

  refresh(String(formData.get("vendorSlug") ?? "") || null);
}
