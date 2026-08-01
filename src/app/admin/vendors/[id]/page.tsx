import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { VendorForm } from "@/components/admin/VendorForm";
import type { Vendor } from "@/lib/types/database";

export const metadata = { title: "Edit Restaurant" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const vendor = data as Vendor;

  // Resolve the owner's email for the form — profiles doesn't carry it.
  let ownerEmail: string | null = null;
  if (vendor.owner_id) {
    const { data: owner } = await createAdminClient().auth.admin.getUserById(vendor.owner_id);
    ownerEmail = owner?.user?.email ?? null;
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between gap-md flex-wrap">
        <Link
          href="/admin/vendors"
          className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
        >
          ← All restaurants
        </Link>
        <div className="flex gap-sm">
          <Link
            href={`/admin/vendors/${vendor.id}/menu`}
            className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
          >
            Edit Menu
          </Link>
          <Link
            href={`/restaurants/${vendor.slug}`}
            className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
          >
            View Public Page
          </Link>
        </div>
      </div>

      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">{vendor.name}</h2>

      <VendorForm vendor={vendor} ownerEmail={ownerEmail} canManagePlatformFlags />
    </div>
  );
}
