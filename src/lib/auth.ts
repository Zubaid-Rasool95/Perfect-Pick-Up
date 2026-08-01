import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types/database";

export interface SessionUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

/**
 * The signed-in user plus their profile row, or null.
 *
 * `cache()` dedupes this across a single render pass, so a layout, a page and
 * three components can all ask without three round-trips.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();

  // getUser() revalidates the JWT with Supabase. Don't swap this for
  // getSession(), which trusts whatever the cookie says.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    return { id: user.id, email: user.email ?? null, profile: profile as Profile };
  }

  // Read-repair. The handle_new_user trigger fills this in at signup, but an
  // account can still end up without a profile — one created before the
  // trigger existed, or a row deleted by hand. Without it the user has no
  // role (so every guarded page rejects them) and checkout dies on
  // orders_customer_id_fkey. Create it on the spot instead.
  //
  // Allowed under RLS by profiles_insert_self, and `role` is left at its
  // 'customer' default — this can never grant a privilege.
  const { data: repaired } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          user.email?.split("@")[0] ??
          null,
        phone: (user.user_metadata?.phone as string | undefined) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      },
      { onConflict: "id" }
    )
    .select()
    .maybeSingle();

  return { id: user.id, email: user.email ?? null, profile: repaired as Profile | null };
});

export async function getRole(): Promise<UserRole | null> {
  const user = await getSessionUser();
  return user?.profile?.role ?? null;
}

/** Redirects to login (preserving where they were headed) if signed out. */
export async function requireUser(returnTo = "/"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/**
 * Gate for staff areas. Admins pass every role check — an admin can always
 * stand in for a vendor.
 */
export async function requireRole(roles: UserRole[], returnTo = "/"): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  const role = user.profile?.role;

  if (!role || (!roles.includes(role) && role !== "admin")) {
    redirect("/?denied=1");
  }
  return user;
}

/** Vendor IDs this user may manage. Admins get every vendor. */
export async function getManageableVendorIds(): Promise<string[] | "all"> {
  const user = await getSessionUser();
  if (!user) return [];
  if (user.profile?.role === "admin") return "all";

  const supabase = await createClient();
  const { data } = await supabase.from("vendors").select("id").eq("owner_id", user.id);
  return (data ?? []).map((v) => v.id);
}
