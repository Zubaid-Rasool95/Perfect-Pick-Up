import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { setVendorActive, deleteVendor } from "@/app/actions/vendors";
import { money, priceLevel } from "@/lib/format";
import type { Vendor } from "@/lib/types/database";

export const metadata = { title: "Restaurants" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const { created } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("vendors")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name");

  const vendors = (data ?? []) as Vendor[];

  // How many menu items each vendor has, so an empty menu is obvious.
  const { data: itemRows } = await supabase.from("menu_items").select("vendor_id");
  const itemCounts = new Map<string, number>();
  for (const row of itemRows ?? []) {
    itemCounts.set(row.vendor_id, (itemCounts.get(row.vendor_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-lg">
      {created ? (
        <p className="bg-primary/10 border border-primary/30 text-primary font-body-sm text-body-sm px-md py-sm rounded-lg">
          Restaurant created. Add its menu next so customers have something to order.
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-md flex-wrap">
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
          {vendors.length} {vendors.length === 1 ? "Restaurant" : "Restaurants"}
        </h2>
        <Link
          href="/admin/vendors/new"
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          Add Restaurant
        </Link>
      </div>

      {vendors.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          No restaurants yet. Add your first one to open the marketplace.
        </p>
      ) : (
        <div className="flex flex-col gap-sm">
          {vendors.map((vendor) => {
            const itemCount = itemCounts.get(vendor.id) ?? 0;
            return (
              <div
                key={vendor.id}
                className="flex flex-col md:flex-row md:items-center gap-md p-md bg-surface-container rounded-xl border border-outline-variant/10"
              >
                <div className="w-full md:w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
                  {vendor.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" src={vendor.hero_image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline">restaurant</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-xs grow min-w-0">
                  <div className="flex items-center gap-sm flex-wrap">
                    <span className="font-title-lg text-title-lg text-on-surface">{vendor.name}</span>
                    {vendor.is_active ? (
                      <span className="font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded bg-primary/15 text-primary">
                        Live
                      </span>
                    ) : (
                      <span className="font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded bg-surface-container-highest text-on-surface-variant">
                        Hidden
                      </span>
                    )}
                    {vendor.is_featured ? (
                      <span className="font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded bg-tertiary/15 text-tertiary">
                        Featured
                      </span>
                    ) : null}
                    {itemCount === 0 ? (
                      <span className="font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded bg-error-container/40 text-error">
                        No menu
                      </span>
                    ) : null}
                  </div>

                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    /{vendor.slug} · {vendor.cuisine ?? "Mixed"} · {priceLevel(vendor.price_level)} ·{" "}
                    {itemCount} {itemCount === 1 ? "item" : "items"} · min {money(vendor.min_order_cents)}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {vendor.address_line}
                    {vendor.city ? `, ${vendor.city}` : ""} · {vendor.lat.toFixed(4)},{" "}
                    {vendor.lng.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center gap-sm shrink-0 flex-wrap">
                  <Link
                    href={`/admin/vendors/${vendor.id}`}
                    className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/vendors/${vendor.id}/menu`}
                    className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
                  >
                    Menu
                  </Link>

                  <form action={setVendorActive}>
                    <input type="hidden" name="vendorId" value={vendor.id} />
                    <input type="hidden" name="isActive" value={vendor.is_active ? "false" : "true"} />
                    <button
                      type="submit"
                      className="bg-surface-container-high text-on-surface-variant px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:text-on-surface transition-all"
                    >
                      {vendor.is_active ? "Hide" : "Publish"}
                    </button>
                  </form>

                  <form action={deleteVendor}>
                    <input type="hidden" name="vendorId" value={vendor.id} />
                    <button
                      type="submit"
                      className="text-error/80 px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:text-error transition-all"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
