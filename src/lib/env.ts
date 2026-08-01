/**
 * Environment access with a readable failure mode.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time, so they must be referenced
 * as full literal `process.env.NEXT_PUBLIC_X` expressions — destructuring or
 * dynamic lookup breaks the substitution.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill it in — ` +
        `see the "Supabase setup" section of the README.`
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  /** Server-only. Never import this from a client component. */
  get supabaseServiceRoleKey() {
    return required(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
};
