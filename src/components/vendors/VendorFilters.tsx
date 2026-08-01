"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const SORT_LABELS: Record<string, string> = {
  recommended: "Sort by: Recommended",
  fastest: "Fastest Preparation",
  rating: "Highest Rated",
  min_order: "Minimum Order: Low to High",
};

export function VendorFilters({
  cuisines,
  search,
  cuisine,
  sort,
}: {
  cuisines: string[];
  search: string;
  cuisine: string;
  sort: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [term, setTerm] = useState(search);
  const firstRender = useRef(true);

  function buildHref(changes: Record<string, string | null>): string {
    const query = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || value === "All" || value === "recommended") {
        query.delete(key);
      } else {
        query.set(key, value);
      }
    }
    // Any filter change invalidates the current page number.
    query.delete("page");
    const qs = query.toString();
    return qs ? `/restaurants?${qs}` : "/restaurants";
  }

  function apply(changes: Record<string, string | null>) {
    startTransition(() => router.push(buildHref(changes), { scroll: false }));
  }

  // Debounce the search box so we aren't navigating on every keystroke.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (term !== search) apply({ q: term });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const chips = ["All", ...cuisines];

  return (
    <div
      className={`bg-surface-container p-md rounded-xl shadow-xl flex flex-col gap-md transition-opacity ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-center">
        <div className="lg:col-span-9 relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            search
          </span>
          <label className="sr-only" htmlFor="vendor-search">
            Search restaurants
          </label>
          <input
            id="vendor-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by name, cuisine, or dish..."
            className="w-full bg-surface-dim border-none rounded-lg py-md pl-xl pr-md text-on-surface font-body-md focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50"
          />
        </div>

        <div className="lg:col-span-3 relative">
          <label className="sr-only" htmlFor="vendor-sort">
            Sort restaurants
          </label>
          <select
            id="vendor-sort"
            value={sort}
            onChange={(event) => apply({ sort: event.target.value })}
            className="w-full appearance-none bg-surface-dim border-none rounded-lg py-md px-md text-on-surface font-body-md focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      <div className="flex gap-sm overflow-x-auto no-scrollbar pb-1">
        {chips.map((label) => {
          const isActive = cuisine === label || (label === "All" && !cuisine);
          return (
            <button
              key={label}
              type="button"
              onClick={() => apply({ cuisine: label })}
              aria-pressed={isActive}
              className={`shrink-0 px-md py-xs rounded-full font-label-md text-label-md uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
