"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

const roleSchema = z.enum(["customer", "vendor", "admin"]);

/**
 * Role changes bypass RLS by design: the `profiles` update policy pins `role`
 * so nobody can promote themselves. This is the only sanctioned path, and it
 * runs only after the caller is confirmed to be an admin.
 */
export async function setUserRole(formData: FormData) {
  const admin = await requireRole(["admin"], "/admin/users");

  const userId = String(formData.get("userId") ?? "");
  const parsedRole = roleSchema.safeParse(formData.get("role"));
  if (!userId || !parsedRole.success) return;

  // Don't let the last admin demote themselves out of the console.
  if (userId === admin.id && parsedRole.data !== "admin") return;

  await createAdminClient().from("profiles").update({ role: parsedRole.data }).eq("id", userId);

  revalidatePath("/admin/users");
}
