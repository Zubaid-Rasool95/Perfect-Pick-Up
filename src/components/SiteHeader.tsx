"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOGO =
  "https://lh3.googleusercontent.com/aida/AP1WRLsLWx9kBRj1M29diOdsznZ1AwLRisG98zfnDzE1ogFAmxstTPvO8NKqpMNEgZ3QVHXvy-xSchVxTJ2Yf0MMfnLo77Y0lX7m7VhacsW0QtqBMwwC4-HUUjqDItLAhvkBlpYQGNBHIlpB2zdXnUoEJt1VzecMyT3pSG_G_z27l5S2xJ7Vs98m2nblpvMvuc-VznDXlxKm0Fmx3nTk0-7tAbhadVmscAT8NHmxJLUAyszpOCw-OMGR_St7BorNiYpaXLQJ2AsLGYXQXbw";

const nav = [
  { href: "/", label: "Home", key: "home" },
  { href: "/restaurants", label: "Restaurants", key: "restaurants" },
  { href: "/#how-it-works", label: "How It Works", key: "how-it-works" },
  { href: "/#contact", label: "Contact", key: "contact" },
];

export function SiteHeader({ active = "" }: { active?: string }) {
  const pathname = usePathname();
  const current =
    active ||
    (pathname === "/"
      ? "home"
      : pathname?.startsWith("/restaurants") || pathname?.startsWith("/menu")
        ? "restaurants"
        : "");

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
      <div className="h-20 max-w-7xl mx-auto px-margin-desktop flex items-center justify-between">
        <Link href="/" className="flex items-center gap-base">
          <img alt="Perfect Pickup Logo" className="w-10 h-10 rounded-full object-cover" src={LOGO} />
          <span className="font-headline-lg text-headline-lg text-primary uppercase tracking-wider">Perfect Pickup</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-lg">
          {nav.map((item) => {
            const isActive = current === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "transition-colors text-primary font-bold"
                    : "font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-md">
          <Link href="/restaurants" className="bg-primary-container text-on-primary-container px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all">
            Order Now
          </Link>
          <Link href="/profile">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-outline-variant" src={LOGO} />
          </Link>
        </div>
      </div>
    </header>
  );
}
