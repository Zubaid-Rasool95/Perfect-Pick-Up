"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createCategory,
  deleteCategory,
  deleteMenuItem,
  saveMenuItem,
  toggleMenuItemAvailability,
  type MenuFormState,
} from "@/app/actions/menu";
import { ImageUploader } from "@/components/media/ImageUploader";
import { money } from "@/lib/format";
import type { MenuCategory, MenuItem, Vendor } from "@/lib/types/database";

const FIELD =
  "w-full bg-surface-dim text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20";
const LABEL = "font-label-md text-label-md text-on-surface-variant uppercase ml-1";

function Submit({ label, compact = false }: { label: string; compact?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`bg-primary text-on-primary rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60 ${
        compact ? "px-md py-xs" : "px-lg py-sm"
      }`}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function MenuEditor({
  vendor,
  categories,
  items,
}: {
  vendor: Vendor;
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const grouped = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      removable: true,
      items: items.filter((item) => item.category_id === category.id),
    })),
    {
      id: "__none__",
      name: "Uncategorised",
      removable: false,
      items: items.filter(
        (item) => !item.category_id || !categories.some((c) => c.id === item.category_id)
      ),
    },
  ].filter((group) => group.items.length > 0 || group.id !== "__none__");

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between gap-md flex-wrap">
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
          Menu · {items.length} {items.length === 1 ? "item" : "items"}
        </h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Dish
        </button>
      </div>

      {creating || editing ? (
        <ItemForm
          vendor={vendor}
          categories={categories}
          item={editing}
          onDone={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      ) : null}

      <CategoryForm vendor={vendor} />

      {grouped.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          No menu yet. Add a section, then start adding dishes.
        </p>
      ) : (
        grouped.map((group) => (
          <section key={group.id} className="flex flex-col gap-sm">
            <div className="flex items-center justify-between gap-md">
              <h3 className="font-title-lg text-title-lg text-on-surface">{group.name}</h3>
              {group.removable ? (
                <form action={deleteCategory}>
                  <input type="hidden" name="categoryId" value={group.id} />
                  <input type="hidden" name="vendorSlug" value={vendor.slug} />
                  <button
                    type="submit"
                    className="font-label-md text-label-md text-error/80 uppercase tracking-widest hover:text-error transition-colors"
                  >
                    Delete section
                  </button>
                </form>
              ) : null}
            </div>

            {group.items.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Nothing in this section yet.
              </p>
            ) : (
              group.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col md:flex-row md:items-center gap-md p-md bg-surface-container rounded-lg border border-outline-variant/10 ${
                    item.is_available ? "" : "opacity-60"
                  }`}
                >
                  {item.image_url ? (
                    <div className="w-full md:w-16 h-16 rounded overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" src={item.image_url} className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <div className="flex flex-col grow min-w-0">
                    <span className="font-body-md text-body-md text-on-surface flex items-center gap-sm flex-wrap">
                      {item.name}
                      {item.is_signature ? (
                        <span className="font-label-md text-label-md uppercase px-sm py-0.5 rounded bg-primary/15 text-primary">
                          Signature
                        </span>
                      ) : null}
                      {!item.is_available ? (
                        <span className="font-label-md text-label-md uppercase px-sm py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                          Sold out
                        </span>
                      ) : null}
                    </span>
                    {item.description ? (
                      <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                        {item.description}
                      </span>
                    ) : null}
                  </div>

                  <span className="font-title-lg text-title-lg text-primary shrink-0">
                    {money(item.price_cents)}
                  </span>

                  <div className="flex items-center gap-sm shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setEditing(item);
                      }}
                      className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
                    >
                      Edit
                    </button>

                    <form action={toggleMenuItemAvailability}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="isAvailable" value={item.is_available ? "false" : "true"} />
                      <input type="hidden" name="vendorSlug" value={vendor.slug} />
                      <button
                        type="submit"
                        className="bg-surface-container-high text-on-surface-variant px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:text-on-surface transition-all"
                      >
                        {item.is_available ? "Mark sold out" : "Restock"}
                      </button>
                    </form>

                    <form action={deleteMenuItem}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="vendorSlug" value={vendor.slug} />
                      <button
                        type="submit"
                        className="text-error/80 px-sm py-xs font-label-md text-label-md uppercase tracking-widest hover:text-error transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </section>
        ))
      )}
    </div>
  );
}

function CategoryForm({ vendor }: { vendor: Vendor }) {
  const [state, action] = useActionState<MenuFormState, FormData>(createCategory, {});

  return (
    <form
      action={action}
      className="flex flex-col sm:flex-row gap-sm items-start sm:items-end bg-surface-container rounded-xl border border-outline-variant/10 p-md"
    >
      <input type="hidden" name="vendorId" value={vendor.id} />
      <input type="hidden" name="vendorSlug" value={vendor.slug} />

      <div className="space-y-xs grow w-full">
        <label className={LABEL} htmlFor="new-category">
          New menu section
        </label>
        <input id="new-category" name="name" className={FIELD} placeholder="Starters" required />
        {state.fieldErrors?.name ? (
          <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.name[0]}</p>
        ) : null}
        {state.error ? (
          <p className="font-body-sm text-body-sm text-error">{state.error}</p>
        ) : null}
      </div>

      <div className="space-y-xs w-full sm:w-32">
        <label className={LABEL} htmlFor="new-category-position">
          Order
        </label>
        <input
          id="new-category-position"
          name="position"
          type="number"
          min={0}
          defaultValue={0}
          className={FIELD}
        />
      </div>

      <Submit label="Add Section" />
    </form>
  );
}

function ItemForm({
  vendor,
  categories,
  item,
  onDone,
}: {
  vendor: Vendor;
  categories: MenuCategory[];
  item: MenuItem | null;
  onDone: () => void;
}) {
  const [state, action] = useActionState<MenuFormState, FormData>(saveMenuItem, {});

  return (
    <form
      action={async (formData) => {
        await action(formData);
        onDone();
      }}
      // Remount on item switch so defaultValues refresh.
      key={item?.id ?? "new"}
      className="bg-surface-container-high rounded-xl border border-primary/20 p-md flex flex-col gap-md"
    >
      <input type="hidden" name="vendorId" value={vendor.id} />
      <input type="hidden" name="vendorSlug" value={vendor.slug} />
      {item ? <input type="hidden" name="itemId" value={item.id} /> : null}

      <div className="flex items-center justify-between gap-md">
        <h3 className="font-title-lg text-title-lg text-on-surface">
          {item ? `Edit ${item.name}` : "New dish"}
        </h3>
        <button
          type="button"
          onClick={onDone}
          className="text-on-surface-variant hover:text-on-surface"
          aria-label="Cancel"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {state.error ? (
        <p className="bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
          {state.error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="space-y-xs md:col-span-2">
          <label className={LABEL} htmlFor="item-name">
            Dish Name
          </label>
          <input id="item-name" name="name" className={FIELD} defaultValue={item?.name ?? ""} required />
          {state.fieldErrors?.name ? (
            <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div className="space-y-xs">
          <label className={LABEL} htmlFor="item-price">
            Price (cents)
          </label>
          <input
            id="item-price"
            name="priceCents"
            type="number"
            min={0}
            className={FIELD}
            defaultValue={item?.price_cents ?? 0}
            required
          />
          {state.fieldErrors?.priceCents ? (
            <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.priceCents[0]}</p>
          ) : null}
        </div>

        <div className="space-y-xs">
          <label className={LABEL} htmlFor="item-category">
            Section
          </label>
          <select
            id="item-category"
            name="categoryId"
            className={FIELD}
            defaultValue={item?.category_id ?? ""}
          >
            <option value="">Uncategorised</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-xs md:col-span-4">
          <label className={LABEL} htmlFor="item-description">
            Description
          </label>
          <textarea
            id="item-description"
            name="description"
            rows={2}
            className={`${FIELD} resize-none`}
            defaultValue={item?.description ?? ""}
          />
        </div>

        <div className="md:col-span-3">
          <ImageUploader
            name="imageUrl"
            label="Dish Photo"
            folder="menu"
            defaultValue={item?.image_url}
            hint="Optional. Dishes with a photo get a larger card on the menu."
          />
          {state.fieldErrors?.imageUrl ? (
            <p className="font-body-sm text-body-sm text-error mt-xs">
              {state.fieldErrors.imageUrl[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-xs">
          <label className={LABEL} htmlFor="item-position">
            Order
          </label>
          <input
            id="item-position"
            name="position"
            type="number"
            min={0}
            className={FIELD}
            defaultValue={item?.position ?? 0}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-lg">
        <label className="flex items-center gap-sm cursor-pointer">
          <input
            type="checkbox"
            name="isAvailable"
            className="accent-primary"
            defaultChecked={item?.is_available ?? true}
          />
          <span className="font-body-md text-body-md text-on-surface">Available to order</span>
        </label>

        <label className="flex items-center gap-sm cursor-pointer">
          <input
            type="checkbox"
            name="isSignature"
            className="accent-primary"
            defaultChecked={item?.is_signature ?? false}
          />
          <span className="font-body-md text-body-md text-on-surface">Chef&apos;s choice</span>
        </label>

        <div className="ml-auto">
          <Submit label={item ? "Save Dish" : "Add Dish"} />
        </div>
      </div>
    </form>
  );
}
