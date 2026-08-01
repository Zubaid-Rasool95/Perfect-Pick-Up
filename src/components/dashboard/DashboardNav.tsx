"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface DashboardLink {
  href: string;
  label: string;
  symbol: string;
  /** When true, only an exact path match counts as active. */
  exact?: boolean;
}

export function DashboardNav({ links }: { links: DashboardLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-xs px-md pb-md lg:pb-0 overflow-x-auto no-scrollbar">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-sm px-md py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest whitespace-nowrap transition-all ${
              active
                ? "bg-primary/15 text-primary"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{link.symbol}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
