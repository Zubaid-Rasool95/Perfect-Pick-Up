"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/useCart";
import { signOut } from "@/app/actions/auth";
import { initials } from "@/lib/format";
import type { UserRole } from "@/lib/types/database";

const NAV = [
  { href: "/", label: "Home", key: "home" },
  { href: "/restaurants", label: "Restaurants", key: "restaurants" },
  { href: "/#how-it-works", label: "How It Works", key: "how-it-works" },
  { href: "/#contact", label: "Contact", key: "contact" },
];

/** Extra destinations that only appear for staff. */
const STAFF_LINKS: Record<Exclude<UserRole, "customer">, { href: string; label: string }> = {
  admin: { href: "/admin", label: "Admin Console" },
  vendor: { href: "/vendor", label: "Vendor Dashboard" },
};

export function HeaderNav({
  active,
  role,
  displayName,
  avatarUrl,
}: {
  active: string;
  role: UserRole | null;
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();
  const { itemCount, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account menu whenever we land somewhere new. Adjusting state
  // during render (rather than in an effect) avoids a second paint with the
  // menu still open.
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const current =
    active ||
    (pathname === "/"
      ? "home"
      : pathname?.startsWith("/restaurants")
        ? "restaurants"
        : "");

  const staffLink = role && role !== "customer" ? STAFF_LINKS[role] : null;

  return (
    <>
      <nav className="hidden lg:flex items-center gap-lg">
        {NAV.map((item) => {
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
        {staffLink ? (
          <Link
            href={staffLink.href}
            className="font-label-md text-label-md uppercase tracking-widest text-tertiary hover:brightness-125 transition-all"
          >
            {staffLink.label}
          </Link>
        ) : null}
      </nav>

      <div className="flex items-center gap-sm md:gap-md shrink-0">
        <Link
          href="/checkout"
          aria-label={`Your bag${ready && itemCount ? `, ${itemCount} items` : ", empty"}`}
          className="relative w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          {ready && itemCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-primary text-on-primary font-label-md text-[11px] flex items-center justify-center tabular-nums">
              {itemCount}
            </span>
          ) : null}
        </Link>

        <Link
          href="/restaurants"
          className="hidden sm:inline-block bg-primary-container text-on-primary-container px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all"
        >
          Order Now
        </Link>

        {role ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors bg-surface-container-high flex items-center justify-center"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="w-full h-full object-cover" src={avatarUrl} />
              ) : (
                <span className="font-label-md text-label-md text-primary">
                  {initials(displayName)}
                </span>
              )}
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-sm w-56 bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-2xl overflow-hidden py-xs z-50"
              >
                <p className="px-md py-sm font-body-sm text-body-sm text-on-surface-variant truncate border-b border-outline-variant/10">
                  {displayName ?? "Signed in"}
                </p>
                <Link href="/profile" role="menuitem" className="block px-md py-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-bright transition-colors">
                  My Profile
                </Link>
                <Link href="/orders" role="menuitem" className="block px-md py-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-bright transition-colors">
                  My Orders
                </Link>
                {staffLink ? (
                  <Link href={staffLink.href} role="menuitem" className="block px-md py-sm font-body-sm text-body-sm text-tertiary hover:bg-surface-bright transition-colors">
                    {staffLink.label}
                  </Link>
                ) : null}
                <form action={signOut} className="border-t border-outline-variant/10 mt-xs pt-xs">
                  <button
                    type="submit"
                    role="menuitem"
                    className="w-full text-left px-md py-sm font-body-sm text-body-sm text-error hover:bg-surface-bright transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            href="/login"
            className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap"
          >
            Sign In
          </Link>
        )}
      </div>
    </>
  );
}
