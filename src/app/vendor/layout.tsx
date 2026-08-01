import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardLink } from "@/components/dashboard/DashboardNav";

export const metadata: Metadata = {
  title: { default: "Vendor", template: "%s · Vendor · Perfect Pick Up" },
  robots: { index: false, follow: false },
};

const LINKS: DashboardLink[] = [
  { href: "/vendor", label: "Orders", symbol: "receipt_long", exact: true },
  { href: "/vendor/menu", label: "Menu", symbol: "restaurant_menu" },
  { href: "/vendor/settings", label: "Settings", symbol: "settings" },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  // `requireRole` lets admins through as well, so they can act for any vendor.
  const user = await requireRole(["vendor"], "/vendor");

  return (
    <DashboardShell
      title="Vendor Dashboard"
      subtitle="Restaurant"
      links={LINKS}
      who={user.profile?.full_name ?? user.email ?? "Vendor"}
    >
      {children}
    </DashboardShell>
  );
}
