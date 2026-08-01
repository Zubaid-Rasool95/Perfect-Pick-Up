import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardLink } from "@/components/dashboard/DashboardNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Perfect Pick Up" },
  robots: { index: false, follow: false },
};

const LINKS: DashboardLink[] = [
  { href: "/admin", label: "Overview", symbol: "dashboard", exact: true },
  { href: "/admin/vendors", label: "Restaurants", symbol: "storefront" },
  { href: "/admin/couriers", label: "Couriers", symbol: "two_wheeler" },
  { href: "/admin/orders", label: "Orders", symbol: "receipt_long" },
  { href: "/admin/users", label: "People", symbol: "group" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Belt and braces: proxy.ts already bounces signed-out users, this enforces
  // the role. Every child page inherits the guard.
  const user = await requireRole(["admin"], "/admin");

  return (
    <DashboardShell
      title="Admin Console"
      subtitle="Platform"
      links={LINKS}
      who={user.profile?.full_name ?? user.email ?? "Administrator"}
    >
      {children}
    </DashboardShell>
  );
}
