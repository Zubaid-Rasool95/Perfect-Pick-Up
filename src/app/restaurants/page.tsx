import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorFilters } from "@/components/vendors/VendorFilters";
import { listCuisines, listVendors, type VendorSort } from "@/lib/data/vendors";

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Every kitchen on Perfect Pick Up, searchable by name, cuisine, or dish.",
};

const SORTS: VendorSort[] = ["recommended", "fastest", "rating", "min_order"];

function toSort(value: string | undefined): VendorSort {
  return SORTS.includes(value as VendorSort) ? (value as VendorSort) : "recommended";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cuisine?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q ?? "";
  const cuisine = params.cuisine ?? "All";
  const sort = toSort(params.sort);

  const [{ vendors, total, pageCount }, cuisines] = await Promise.all([
    listVendors({ search, cuisine, sort, page }),
    listCuisines(),
  ]);

  /** Preserve the current filters when only the page number changes. */
  function pageHref(target: number): string {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (cuisine && cuisine !== "All") query.set("cuisine", cuisine);
    if (sort !== "recommended") query.set("sort", sort);
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `/restaurants?${qs}` : "/restaurants";
  }

  return (
    <>
      <SiteHeader active="restaurants" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Header / Search Section */}
          <section className="relative px-margin-mobile md:px-margin-desktop py-xl bg-surface-container-low overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg mb-lg">
                <div className="flex flex-col gap-sm">
                  <span className="font-label-md text-label-md text-primary uppercase tracking-[0.3em]">
                    Curated Selection
                  </span>
                  <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase">
                    Elite Establishments
                  </h1>
                </div>
                <div className="flex items-center gap-md font-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-xs">
                    <span className="text-primary font-bold">{total}</span>
                    {total === 1 ? "Restaurant" : "Restaurants"} Near You
                  </span>
                  <div className="h-4 w-px bg-outline-variant/30" />
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    Manhattan, NY
                  </span>
                </div>
              </div>

              <VendorFilters cuisines={cuisines} search={search} cuisine={cuisine} sort={sort} />
            </div>
          </section>

          {/* Results */}
          <section className="px-margin-mobile md:px-margin-desktop py-xl">
            <div className="max-w-7xl mx-auto">
              {vendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-xl gap-md">
                  <span className="material-symbols-outlined text-outline text-[48px]">
                    search_off
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
                    Nothing matches that
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
                    Try a different cuisine, or clear your filters to see everything we have.
                  </p>
                  <Link
                    href="/restaurants"
                    className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all"
                  >
                    Clear Filters
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {vendors.map((vendor) => (
                    <VendorCard key={vendor.id} vendor={vendor} />
                  ))}
                </div>
              )}

              {pageCount > 1 ? (
                <nav
                  aria-label="Pagination"
                  className="flex items-center justify-center gap-xs mt-xl"
                >
                  {page > 1 ? (
                    <Link
                      href={pageHref(page - 1)}
                      className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:text-primary transition-all"
                      aria-label="Previous page"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </Link>
                  ) : null}

                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((target) => (
                    <Link
                      key={target}
                      href={pageHref(target)}
                      aria-current={target === page ? "page" : undefined}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-label-md text-label-md transition-all ${
                        target === page
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      {target}
                    </Link>
                  ))}

                  {page < pageCount ? (
                    <Link
                      href={pageHref(page + 1)}
                      className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:text-primary transition-all"
                      aria-label="Next page"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
