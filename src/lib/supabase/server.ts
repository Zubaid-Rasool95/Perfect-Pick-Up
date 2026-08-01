import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Request-scoped Supabase client that reads the caller's session from cookies,
 * so every query runs under that user's RLS policies.
 *
 * `cookies()` is async in Next 16, hence the await.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't set cookies. proxy.ts refreshes the session
          // on every request, so it is safe to swallow this.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS entirely — only reach for it where a
 * policy genuinely cannot express the rule, and always gate the caller first.
 *
 * Used for: admin role changes, admin-wide reads, and courier GPS ingestion
 * (which arrives with no session at all, authenticated by tracking token).
 */
export function createAdminClient() {
  return createSupabaseClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
