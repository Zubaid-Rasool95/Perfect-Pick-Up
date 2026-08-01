import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { DashboardNav, type DashboardLink } from "@/components/dashboard/DashboardNav";

/**
 * Shared chrome for the admin console and the vendor dashboard: fixed sidebar
 * on desktop, horizontal scroller on mobile.
 */
export function DashboardShell({
  title,
  subtitle,
  links,
  who,
  children,
}: {
  title: string;
  subtitle: string;
  links: DashboardLink[];
  who: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:shrink-0 lg:min-h-screen bg-surface-container-low border-b lg:border-b-0 lg:border-r border-outline-variant/10 flex flex-col">
        <div className="p-md flex flex-col gap-xs">
          <Link href="/" className="flex items-center gap-base">
            <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-on-primary text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                restaurant
              </span>
            </span>
            <span className="font-headline-lg text-headline-lg text-primary uppercase tracking-wider">
              Perfect Pick Up
            </span>
          </Link>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.2em] pl-1">
            {subtitle}
          </span>
        </div>

        <DashboardNav links={links} />

        <div className="mt-auto p-md border-t border-outline-variant/10 flex flex-col gap-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{who}</span>
          <Link
            href="/"
            className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
          >
            ← Back to site
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="font-label-md text-label-md text-error uppercase tracking-widest hover:brightness-125 transition-all"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-margin-mobile md:p-md lg:p-lg">
        <h1 className="font-display-lg text-display-lg-mobile text-on-surface uppercase mb-lg">
          {title}
        </h1>
        {children}
      </main>
    </div>
  );
}
