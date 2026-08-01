import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MenuEditor } from "@/components/admin/MenuEditor";
import type { MenuCategory, MenuItem, Vendor } from "@/lib/types/database";

export const metadata = { title: "Edit Menu" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vendor } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
  if (!vendor) notFound();

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from("menu_categories").select("*").eq("vendor_id", id).order("position"),
    supabase.from("menu_items").select("*").eq("vendor_id", id).order("position"),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <Link
        href={`/admin/vendors/${id}`}
        className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
      >
        ← {(vendor as Vendor).name}
      </Link>

      <MenuEditor
        vendor={vendor as Vendor}
        categories={(categories ?? []) as MenuCategory[]}
        items={(items ?? []) as MenuItem[]}
      />
    </div>
  );
}
