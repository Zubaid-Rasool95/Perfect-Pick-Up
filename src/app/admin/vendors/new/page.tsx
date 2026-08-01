import Link from "next/link";
import { VendorForm } from "@/components/admin/VendorForm";

export const metadata = { title: "Add Restaurant" };

export default function Page() {
  return (
    <div className="flex flex-col gap-lg">
      <Link
        href="/admin/vendors"
        className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
      >
        ← All restaurants
      </Link>

      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
        Add a Restaurant
      </h2>

      <VendorForm canManagePlatformFlags />
    </div>
  );
}
