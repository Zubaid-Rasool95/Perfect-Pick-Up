import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MenuBrowser } from "@/components/vendors/MenuBrowser";
import { getVendorBySlug } from "@/lib/data/vendors";
import { money, priceLevel } from "@/lib/format";

// Rendered per request rather than prerendered: the page reads the visitor's
// session for RLS, and a vendor editing their menu expects it live immediately.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getVendorBySlug(slug);
  if (!detail) return { title: "Restaurant not found" };

  return {
    title: detail.vendor.name,
    description: detail.vendor.tagline ?? detail.vendor.description ?? undefined,
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getVendorBySlug(slug);

  if (!detail || !detail.vendor.is_active) notFound();

  const { vendor, categories, items, options, hours } = detail;

  return (
    <>
      <SiteHeader active="restaurants" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Hero, bleeding under the fixed header */}
          <section className="relative w-full h-[420px] md:h-[560px] -mt-20 overflow-hidden flex items-end">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
            {vendor.hero_image_url ? (
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center"
                style={{ backgroundImage: `url('${vendor.hero_image_url}')` }}
              />
            ) : (
              <div className="absolute inset-0 bg-surface-container-high" />
            )}

            <div className="relative z-20 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop pb-xl w-full">
              <div className="flex flex-col gap-md max-w-3xl">
                <div className="flex flex-wrap gap-sm items-center">
                  {vendor.is_featured ? (
                    <span className="bg-primary text-on-primary font-label-md text-label-md px-md py-1 rounded-full uppercase tracking-tighter">
                      Premier Partner
                    </span>
                  ) : null}
                  <div className="flex items-center gap-xs text-primary">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="font-title-lg text-title-lg">{vendor.rating}</span>
                    <span className="text-on-surface-variant font-body-sm text-body-sm ml-1">
                      ({vendor.rating_count.toLocaleString()} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-md">
                  {vendor.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      src={vendor.logo_url}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover bg-surface-container border border-outline-variant/20 shrink-0"
                    />
                  ) : null}
                  <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase leading-none">
                    {vendor.name}
                  </h1>
                </div>

                {vendor.tagline ? (
                  <p className="font-body-lg text-body-lg text-on-surface-variant">{vendor.tagline}</p>
                ) : null}

                <div className="flex flex-wrap gap-lg items-center">
                  <span className="flex items-center gap-base font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary-fixed-dim">schedule</span>
                    {vendor.prep_time_mins}–{vendor.prep_time_mins + 10} MINS
                  </span>
                  {vendor.min_order_cents > 0 ? (
                    <span className="flex items-center gap-base font-body-md text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary-fixed-dim">shopping_bag</span>
                      MIN ORDER {money(vendor.min_order_cents)}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-base font-body-md text-body-md text-on-surface-variant uppercase">
                    <span className="material-symbols-outlined text-primary-fixed-dim">restaurant_menu</span>
                    {vendor.cuisine ?? "Mixed"} · {priceLevel(vendor.price_level)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <MenuBrowser
            vendor={vendor}
            categories={categories}
            items={items}
            options={options}
          />

          {/* About & hours */}
          <section className="px-margin-mobile md:px-margin-desktop pb-xl">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              <div className="lg:col-span-2 bg-surface-container rounded-xl p-md border border-outline-variant/10">
                <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">
                  About {vendor.name}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {vendor.description ?? vendor.tagline ?? "No description yet."}
                </p>
                <div className="flex flex-col gap-xs mt-md pt-md border-t border-outline-variant/10 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {vendor.address_line}
                    {vendor.city ? `, ${vendor.city}` : ""}
                    {vendor.postcode ? ` ${vendor.postcode}` : ""}
                  </span>
                  {vendor.phone ? (
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <a className="hover:text-primary transition-colors" href={`tel:${vendor.phone}`}>
                        {vendor.phone}
                      </a>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="bg-surface-container rounded-xl p-md border border-outline-variant/10">
                <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">
                  Opening Hours
                </h2>
                {hours.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Hours haven&apos;t been published yet.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-xs">
                    {hours.map((row) => (
                      <li
                        key={row.id}
                        className="flex justify-between font-body-sm text-body-sm text-on-surface-variant"
                      >
                        <span>{DAY_NAMES[row.day_of_week]}</span>
                        <span className="text-on-surface tabular-nums">
                          {row.opens_at.slice(0, 5)} – {row.closes_at.slice(0, 5)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/restaurants"
                  className="mt-md inline-flex items-center gap-xs font-label-md text-label-md text-primary uppercase tracking-widest hover:brightness-125 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  All Restaurants
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
