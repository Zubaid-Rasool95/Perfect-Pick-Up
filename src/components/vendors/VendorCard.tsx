import Link from "next/link";
import { money, priceLevel } from "@/lib/format";
import type { Vendor } from "@/lib/types/database";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link
      href={`/restaurants/${vendor.slug}`}
      className="group flex flex-col bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative h-48 overflow-hidden bg-surface-container-high">
        {vendor.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            src={vendor.hero_image_url}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-outline text-[40px]">restaurant</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />

        {vendor.is_featured ? (
          <span className="absolute top-sm left-sm bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-sm py-xs rounded">
            Featured
          </span>
        ) : null}

        <div className="absolute top-sm right-sm bg-surface/85 backdrop-blur-md px-sm py-xs rounded flex items-center gap-xs">
          <span
            className="material-symbols-outlined text-primary text-[14px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-label-md text-label-md text-on-surface">{vendor.rating}</span>
        </div>
      </div>

      <div className="flex flex-col gap-sm p-md flex-1">
        <div className="flex items-start justify-between gap-sm">
          <h3 className="font-title-lg text-title-lg text-on-surface group-hover:text-primary transition-colors">
            {vendor.name}
          </h3>
          <span className="font-label-md text-label-md text-on-surface-variant shrink-0 mt-1">
            {priceLevel(vendor.price_level)}
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 flex-1">
          {vendor.tagline ?? vendor.description ?? vendor.cuisine}
        </p>

        <div className="flex items-center gap-md pt-sm mt-auto border-t border-outline-variant/10 font-body-sm text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {vendor.prep_time_mins} min
          </span>
          <span className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">local_dining</span>
            {vendor.cuisine ?? "Mixed"}
          </span>
          {vendor.min_order_cents > 0 ? (
            <span className="ml-auto font-label-md text-label-md text-primary uppercase">
              {money(vendor.min_order_cents)} min
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
