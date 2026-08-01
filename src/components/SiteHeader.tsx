import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { HeaderNav } from "@/components/HeaderNav";

/**
 * Server shell: resolves who is signed in, then hands the interactive parts
 * (active-route highlighting, account menu, cart badge) to HeaderNav.
 */
export async function SiteHeader({ active = "" }: { active?: string }) {
  const user = await getSessionUser();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
      <div className="h-20 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between gap-md">
        <Link href="/" className="flex items-center gap-base shrink-0">
          <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span
              className="material-symbols-outlined text-on-primary text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              restaurant
            </span>
          </span>
          <span className="font-headline-lg text-headline-lg text-primary uppercase tracking-wider whitespace-nowrap">
            Perfect Pick Up
          </span>
        </Link>

        <HeaderNav
          active={active}
          role={user?.profile?.role ?? null}
          displayName={user?.profile?.full_name ?? user?.email ?? null}
          avatarUrl={user?.profile?.avatar_url ?? null}
        />
      </div>
    </header>
  );
}
