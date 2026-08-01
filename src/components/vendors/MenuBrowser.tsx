"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart, type CartVendor } from "@/components/cart/useCart";
import { money } from "@/lib/format";
import type { MenuCategory, MenuItem, MenuItemOption, Vendor } from "@/lib/types/database";

const UNCATEGORISED = "__other__";

export function MenuBrowser({
  vendor,
  categories,
  items,
  options,
}: {
  vendor: Vendor;
  categories: MenuCategory[];
  items: MenuItem[];
  options: MenuItemOption[];
}) {
  const [query, setQuery] = useState("");
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const cart = useCart();

  const cartVendor: CartVendor = {
    id: vendor.id,
    slug: vendor.slug,
    name: vendor.name,
    serviceFeeCents: vendor.service_fee_cents,
    minOrderCents: vendor.min_order_cents,
    prepTimeMins: vendor.prep_time_mins,
  };

  const optionsByItem = useMemo(() => {
    const map = new Map<string, MenuItemOption[]>();
    for (const option of options) {
      const list = map.get(option.menu_item_id) ?? [];
      list.push(option);
      map.set(option.menu_item_id, list);
    }
    return map;
  }, [options]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description ?? "").toLowerCase().includes(term)
    );
  }, [items, query]);

  /** Categories that still have visible items after filtering. */
  const sections = useMemo(() => {
    const groups: { id: string; name: string; items: MenuItem[] }[] = [];

    for (const category of categories) {
      const group = filtered.filter((item) => item.category_id === category.id);
      if (group.length) groups.push({ id: category.id, name: category.name, items: group });
    }

    const orphans = filtered.filter(
      (item) => !item.category_id || !categories.some((c) => c.id === item.category_id)
    );
    if (orphans.length) groups.push({ id: UNCATEGORISED, name: "More", items: orphans });

    return groups;
  }, [categories, filtered]);

  function addSimple(item: MenuItem) {
    const itemOptions = optionsByItem.get(item.id) ?? [];
    // Anything with modifiers opens the chooser instead of dropping straight in.
    if (itemOptions.length > 0) {
      setActiveItem(item);
      return;
    }
    commit(item, [], 1);
  }

  function commit(item: MenuItem, chosen: MenuItemOption[], quantity: number) {
    const label = chosen.length ? chosen.map((o) => o.name).join(", ") : null;
    const unitPrice =
      item.price_cents + chosen.reduce((sum, option) => sum + option.price_delta_cents, 0);

    const { replacedVendor } = cart.addItem(cartVendor, {
      menuItemId: item.id,
      name: item.name,
      unitPriceCents: unitPrice,
      quantity,
      options: label,
      imageUrl: item.image_url,
    });

    setActiveItem(null);
    setFlash(
      replacedVendor
        ? `Started a new bag at ${vendor.name} — your previous bag was from another restaurant.`
        : `${quantity} × ${item.name} added to your bag.`
    );
    window.setTimeout(() => setFlash(null), 4000);
  }

  const bagIsThisVendor = cart.vendor?.id === vendor.id;
  const belowMinimum = bagIsThisVendor && cart.subtotalCents < vendor.min_order_cents;

  return (
    <>
      {/* Sticky category nav */}
      <nav className="sticky top-20 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between gap-md">
          <div className="flex gap-lg overflow-x-auto no-scrollbar">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#cat-${section.id}`}
                className="py-md border-b-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-primary transition-all font-label-md text-label-md uppercase tracking-widest whitespace-nowrap"
              >
                {section.name}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-base shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <label className="sr-only" htmlFor="menu-search">
              Search this menu
            </label>
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="bg-transparent border-none focus:ring-0 outline-none text-body-sm text-on-surface placeholder:text-outline/50 w-48"
              placeholder="Search menu..."
            />
          </div>
        </div>
      </nav>

      {flash ? (
        <div
          role="status"
          className="fixed bottom-md left-1/2 -translate-x-1/2 z-50 bg-surface-container-high border border-primary/30 text-on-surface font-body-sm text-body-sm px-md py-sm rounded-lg shadow-2xl max-w-[90vw]"
        >
          {flash}
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl grid grid-cols-1 lg:grid-cols-10 gap-gutter relative">
        {/* Menu list */}
        <div className="lg:col-span-7 flex flex-col gap-xl">
          {sections.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant">
              {items.length === 0
                ? "This kitchen hasn't published its menu yet."
                : `Nothing on the menu matches “${query}”.`}
            </p>
          ) : (
            sections.map((section, index) => (
              <section key={section.id} id={`cat-${section.id}`} className="scroll-mt-48">
                <h2 className="font-headline-xl text-headline-xl text-on-surface uppercase mb-lg tracking-widest">
                  {section.name}
                  <span className="text-primary opacity-50 ml-2">
                    / {String(index + 1).padStart(2, "0")}
                  </span>
                </h2>

                <div className="grid grid-cols-1 gap-md">
                  {section.items.map((item) => (
                    <article
                      key={item.id}
                      className={`group flex flex-col md:flex-row gap-md p-md bg-surface-container rounded-xl transition-all hover:bg-surface-container-high shadow-sm ${
                        item.is_available ? "" : "opacity-50"
                      }`}
                    >
                      {item.image_url ? (
                        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt=""
                            src={item.image_url}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      ) : null}

                      <div className="flex flex-col justify-between grow">
                        <div>
                          <div className="flex justify-between items-start gap-md">
                            <h3 className="font-title-lg text-title-lg text-on-surface">
                              {item.name}
                            </h3>
                            <span className="font-headline-lg text-headline-lg text-primary whitespace-nowrap">
                              {money(item.price_cents)}
                            </span>
                          </div>
                          {item.description ? (
                            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between gap-md mt-md">
                          {item.is_signature ? (
                            <span className="font-label-md text-label-md text-primary bg-primary/10 px-sm py-1 rounded uppercase tracking-tighter">
                              Chef&apos;s Choice
                            </span>
                          ) : (
                            <span />
                          )}

                          <button
                            type="button"
                            disabled={!item.is_available}
                            onClick={() => addSimple(item)}
                            className="bg-primary text-on-primary px-lg py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            {item.is_available ? "Add" : "Sold out"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Bag sidebar */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-40 bg-surface-container rounded-xl border border-outline-variant/10 p-md flex flex-col gap-md">
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
              Your Bag
            </h2>

            {!cart.ready ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">Loading…</p>
            ) : !bagIsThisVendor || cart.lines.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {cart.lines.length > 0 && cart.vendor
                  ? `You have an open bag at ${cart.vendor.name}. Adding something here will start a new one.`
                  : "Nothing in your bag yet. Add something from the menu."}
              </p>
            ) : (
              <>
                <ul className="flex flex-col gap-sm">
                  {cart.lines.map((line) => (
                    <li key={line.key} className="flex items-start justify-between gap-sm">
                      <div className="flex flex-col min-w-0">
                        <span className="font-body-md text-body-md text-on-surface truncate">
                          {line.name}
                        </span>
                        {line.options ? (
                          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                            {line.options}
                          </span>
                        ) : null}
                        <div className="flex items-center gap-xs mt-xs">
                          <button
                            type="button"
                            aria-label={`Reduce ${line.name}`}
                            onClick={() => cart.setQuantity(line.key, line.quantity - 1)}
                            className="w-6 h-6 rounded bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="font-label-md text-label-md text-on-surface tabular-nums w-5 text-center">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Add another ${line.name}`}
                            onClick={() => cart.setQuantity(line.key, line.quantity + 1)}
                            className="w-6 h-6 rounded bg-surface-container-high text-on-surface-variant hover:text-primary flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      </div>
                      <span className="font-body-md text-body-md text-on-surface whitespace-nowrap">
                        {money(line.unitPriceCents * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center pt-md border-t border-outline-variant/10">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                    Subtotal
                  </span>
                  <span className="font-headline-lg text-headline-lg text-primary">
                    {money(cart.subtotalCents)}
                  </span>
                </div>

                {belowMinimum ? (
                  <p className="font-body-sm text-body-sm text-error">
                    {money(vendor.min_order_cents - cart.subtotalCents)} more to reach this
                    restaurant&apos;s {money(vendor.min_order_cents)} minimum.
                  </p>
                ) : null}

                <Link
                  href="/checkout"
                  aria-disabled={belowMinimum}
                  className={`w-full text-center py-md rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all ${
                    belowMinimum
                      ? "bg-surface-variant text-on-surface-variant pointer-events-none opacity-60"
                      : "bg-primary text-on-primary hover:brightness-110"
                  }`}
                >
                  Go to Checkout
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>

      {activeItem ? (
        <OptionPicker
          item={activeItem}
          options={optionsByItem.get(activeItem.id) ?? []}
          onCancel={() => setActiveItem(null)}
          onConfirm={(chosen, quantity) => commit(activeItem, chosen, quantity)}
        />
      ) : null}
    </>
  );
}

/**
 * Modal for items that carry modifiers. Groups behave as single-select
 * (a temperature) or multi-select (extras) depending on whether the group has
 * a default — matching how the seed data is shaped.
 */
function OptionPicker({
  item,
  options,
  onCancel,
  onConfirm,
}: {
  item: MenuItem;
  options: MenuItemOption[];
  onCancel: () => void;
  onConfirm: (chosen: MenuItemOption[], quantity: number) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, MenuItemOption[]>();
    for (const option of options) {
      const list = map.get(option.option_group) ?? [];
      list.push(option);
      map.set(option.option_group, list);
    }
    return Array.from(map.entries()).map(([name, groupOptions]) => ({
      name,
      options: groupOptions,
      single: groupOptions.some((option) => option.is_default),
    }));
  }, [options]);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(options.filter((option) => option.is_default).map((option) => option.id))
  );
  const [quantity, setQuantity] = useState(1);

  function toggle(option: MenuItemOption, single: boolean, groupOptions: MenuItemOption[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (single) {
        for (const sibling of groupOptions) next.delete(sibling.id);
        next.add(option.id);
      } else if (next.has(option.id)) {
        next.delete(option.id);
      } else {
        next.add(option.id);
      }
      return next;
    });
  }

  const chosen = options.filter((option) => selected.has(option.id));
  const unitPrice =
    item.price_cents + chosen.reduce((sum, option) => sum + option.price_delta_cents, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Customise ${item.name}`}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-margin-mobile"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[520px] bg-surface-container rounded-xl border border-outline-variant/20 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-md border-b border-outline-variant/10 flex items-start justify-between gap-md">
          <div>
            <h3 className="font-title-lg text-title-lg text-on-surface">{item.name}</h3>
            {item.description ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                {item.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-on-surface-variant hover:text-on-surface shrink-0"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-md flex flex-col gap-md">
          {groups.map((group) => (
            <fieldset key={group.name} className="flex flex-col gap-xs">
              <legend className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-xs">
                {group.name}
                {group.single ? "" : " (optional)"}
              </legend>
              {group.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between gap-md px-sm py-xs rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-sm">
                    <input
                      type={group.single ? "radio" : "checkbox"}
                      name={group.name}
                      checked={selected.has(option.id)}
                      onChange={() => toggle(option, group.single, group.options)}
                      className="accent-primary"
                    />
                    <span className="font-body-md text-body-md text-on-surface">{option.name}</span>
                  </span>
                  {option.price_delta_cents !== 0 ? (
                    <span className="font-body-sm text-body-sm text-primary">
                      +{money(option.price_delta_cents)}
                    </span>
                  ) : null}
                </label>
              ))}
            </fieldset>
          ))}
        </div>

        <div className="p-md border-t border-outline-variant/10 flex items-center gap-md">
          <div className="flex items-center gap-sm bg-surface-container-high rounded-lg px-sm py-xs">
            <button
              type="button"
              aria-label="Reduce quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <span className="font-label-md text-label-md text-on-surface tabular-nums w-6 text-center">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => q + 1)}
              className="text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onConfirm(chosen, quantity)}
            className="flex-1 bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all"
          >
            Add · {money(unitPrice * quantity)}
          </button>
        </div>
      </div>
    </div>
  );
}
