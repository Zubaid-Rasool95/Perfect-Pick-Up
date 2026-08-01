import { createClient } from "@/lib/supabase/server";
import { resolveActiveVendor } from "@/lib/data/vendor-scope";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { VendorSwitcher } from "@/components/dashboard/VendorSwitcher";
import type { MenuCategory, MenuItem } from "@/lib/types/database";

export const metadata = { title: "Menu" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string }>;
}) {
  const { vendor: vendorParam } = await searchParams;
  const { vendors, active } = await resolveActiveVendor(vendorParam);

  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("*").eq("vendor_id", active.id).order("position"),
    supabase.from("menu_items").select("*").eq("vendor_id", active.id).order("position"),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <VendorSwitcher vendors={vendors} activeId={active.id} />

      <MenuEditor
        vendor={active}
        categories={(categories ?? []) as MenuCategory[]}
        items={(items ?? []) as MenuItem[]}
      />
    </div>
  );
}
