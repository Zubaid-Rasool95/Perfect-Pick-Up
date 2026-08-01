"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Vendor } from "@/lib/types/database";

/**
 * Only rendered when the user runs more than one restaurant (or is an admin
 * standing in). Keeps the selection in the query string so it survives
 * navigation between dashboard tabs.
 */
export function VendorSwitcher({ vendors, activeId }: { vendors: Vendor[]; activeId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  if (vendors.length < 2) return null;

  return (
    <div className="flex items-center gap-sm">
      <label
        htmlFor="vendor-switcher"
        className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest"
      >
        Restaurant
      </label>
      <select
        id="vendor-switcher"
        value={activeId}
        disabled={pending}
        onChange={(event) =>
          startTransition(() => router.push(`${pathname}?vendor=${event.target.value}`))
        }
        className="bg-surface-dim text-on-surface px-md py-xs rounded-lg border border-outline-variant/20 font-body-sm text-body-sm"
      >
        {vendors.map((vendor) => (
          <option key={vendor.id} value={vendor.id}>
            {vendor.name}
            {vendor.is_active ? "" : " (hidden)"}
          </option>
        ))}
      </select>
    </div>
  );
}
