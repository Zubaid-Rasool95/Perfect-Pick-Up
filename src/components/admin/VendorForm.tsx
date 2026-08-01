"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createVendor, updateVendor, type VendorFormState } from "@/app/actions/vendors";
import type { Vendor } from "@/lib/types/database";

const FIELD =
  "w-full bg-surface-dim text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20";
const LABEL = "font-label-md text-label-md text-on-surface-variant uppercase ml-1";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function Field({
  name,
  label,
  errors,
  children,
  span = 1,
}: {
  name: string;
  label: string;
  errors?: Record<string, string[]>;
  children: React.ReactNode;
  span?: 1 | 2 | 3;
}) {
  const spanClass = span === 3 ? "md:col-span-3" : span === 2 ? "md:col-span-2" : "";
  return (
    <div className={`space-y-xs ${spanClass}`}>
      <label className={LABEL} htmlFor={`vendor-${name}`}>
        {label}
      </label>
      {children}
      {errors?.[name] ? (
        <p className="font-body-sm text-body-sm text-error">{errors[name][0]}</p>
      ) : null}
    </div>
  );
}

export function VendorForm({
  vendor,
  ownerEmail,
  canManagePlatformFlags,
}: {
  vendor?: Vendor;
  ownerEmail?: string | null;
  /** Only admins get the active/featured switches and owner assignment. */
  canManagePlatformFlags: boolean;
}) {
  const isEdit = !!vendor;
  const [state, formAction] = useActionState<VendorFormState, FormData>(
    isEdit ? updateVendor : createVendor,
    {}
  );

  const [name, setName] = useState(vendor?.name ?? "");
  const [slug, setSlug] = useState(vendor?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saved, setSaved] = useState(false);

  const errors = state.fieldErrors;

  return (
    <form
      action={async (formData) => {
        setSaved(false);
        await formAction(formData);
        if (isEdit) setSaved(true);
      }}
      className="flex flex-col gap-lg max-w-4xl"
    >
      {vendor ? <input type="hidden" name="vendorId" value={vendor.id} /> : null}

      {state.error ? (
        <p className="bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
          {state.error}
        </p>
      ) : null}
      {saved && !state.error && !errors ? (
        <p className="bg-primary/10 border border-primary/30 text-primary font-body-sm text-body-sm px-md py-sm rounded-lg">
          Changes saved.
        </p>
      ) : null}

      <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <legend className="font-headline-lg text-headline-lg text-on-surface uppercase mb-md">
          Identity
        </legend>

        <Field name="name" label="Restaurant Name" errors={errors} span={2}>
          <input
            id="vendor-name"
            name="name"
            className={FIELD}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            placeholder="L'Artisan Brasserie"
            required
          />
        </Field>

        <Field name="slug" label="URL Slug" errors={errors}>
          <input
            id="vendor-slug"
            name="slug"
            className={FIELD}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            placeholder="lartisan-brasserie"
            required
          />
        </Field>

        <Field name="tagline" label="Tagline" errors={errors} span={2}>
          <input
            id="vendor-tagline"
            name="tagline"
            className={FIELD}
            defaultValue={vendor?.tagline ?? ""}
            placeholder="Modern French, wood-fired"
          />
        </Field>

        <Field name="cuisine" label="Cuisine" errors={errors}>
          <input
            id="vendor-cuisine"
            name="cuisine"
            className={FIELD}
            defaultValue={vendor?.cuisine ?? ""}
            placeholder="French"
          />
        </Field>

        <Field name="description" label="Description" errors={errors} span={3}>
          <textarea
            id="vendor-description"
            name="description"
            rows={3}
            className={`${FIELD} resize-none`}
            defaultValue={vendor?.description ?? ""}
            placeholder="What makes this kitchen worth the trip."
          />
        </Field>

        <Field name="heroImageUrl" label="Hero Image URL" errors={errors} span={3}>
          <input
            id="vendor-heroImageUrl"
            name="heroImageUrl"
            type="url"
            className={FIELD}
            defaultValue={vendor?.hero_image_url ?? ""}
            placeholder="https://…"
          />
        </Field>
      </fieldset>

      <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <legend className="font-headline-lg text-headline-lg text-on-surface uppercase mb-md">
          Location
        </legend>

        <Field name="addressLine" label="Street Address" errors={errors} span={3}>
          <input
            id="vendor-addressLine"
            name="addressLine"
            className={FIELD}
            defaultValue={vendor?.address_line ?? ""}
            placeholder="882 West Adams Blvd"
            required
          />
        </Field>

        <Field name="city" label="City" errors={errors}>
          <input id="vendor-city" name="city" className={FIELD} defaultValue={vendor?.city ?? ""} placeholder="New York" />
        </Field>

        <Field name="postcode" label="Postcode" errors={errors}>
          <input id="vendor-postcode" name="postcode" className={FIELD} defaultValue={vendor?.postcode ?? ""} placeholder="10014" />
        </Field>

        <Field name="phone" label="Phone" errors={errors}>
          <input id="vendor-phone" name="phone" className={FIELD} defaultValue={vendor?.phone ?? ""} placeholder="+1 (212) 555-0182" />
        </Field>

        <Field name="lat" label="Latitude" errors={errors}>
          <input
            id="vendor-lat"
            name="lat"
            type="number"
            step="any"
            className={FIELD}
            defaultValue={vendor?.lat ?? ""}
            placeholder="40.7359"
            required
          />
        </Field>

        <Field name="lng" label="Longitude" errors={errors}>
          <input
            id="vendor-lng"
            name="lng"
            type="number"
            step="any"
            className={FIELD}
            defaultValue={vendor?.lng ?? ""}
            placeholder="-74.0036"
            required
          />
        </Field>

        <p className="md:col-span-1 self-end font-body-sm text-body-sm text-on-surface-variant">
          Coordinates place the pick up pin on the courier map. Right-click a spot on
          openstreetmap.org to read them off.
        </p>
      </fieldset>

      <fieldset className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <legend className="font-headline-lg text-headline-lg text-on-surface uppercase mb-md">
          Commerce
        </legend>

        <Field name="priceLevel" label="Price Level" errors={errors}>
          <select
            id="vendor-priceLevel"
            name="priceLevel"
            className={FIELD}
            defaultValue={vendor?.price_level ?? 2}
          >
            <option value={1}>$</option>
            <option value={2}>$$</option>
            <option value={3}>$$$</option>
            <option value={4}>$$$$</option>
          </select>
        </Field>

        <Field name="prepTimeMins" label="Prep Time (mins)" errors={errors}>
          <input
            id="vendor-prepTimeMins"
            name="prepTimeMins"
            type="number"
            min={1}
            className={FIELD}
            defaultValue={vendor?.prep_time_mins ?? 20}
          />
        </Field>

        <Field name="minOrderCents" label="Minimum Order (cents)" errors={errors}>
          <input
            id="vendor-minOrderCents"
            name="minOrderCents"
            type="number"
            min={0}
            className={FIELD}
            defaultValue={vendor?.min_order_cents ?? 0}
          />
        </Field>

        <Field name="serviceFeeCents" label="Concierge Fee (cents)" errors={errors}>
          <input
            id="vendor-serviceFeeCents"
            name="serviceFeeCents"
            type="number"
            min={0}
            className={FIELD}
            defaultValue={vendor?.service_fee_cents ?? 850}
          />
        </Field>
      </fieldset>

      {canManagePlatformFlags ? (
        <fieldset className="flex flex-col gap-md">
          <legend className="font-headline-lg text-headline-lg text-on-surface uppercase mb-md">
            Platform
          </legend>

          <Field name="ownerEmail" label="Owner Email (grants vendor dashboard access)" errors={errors}>
            <input
              id="vendor-ownerEmail"
              name="ownerEmail"
              type="email"
              className={FIELD}
              defaultValue={ownerEmail ?? ""}
              placeholder="owner@restaurant.com"
            />
          </Field>
          <p className="font-body-sm text-body-sm text-on-surface-variant -mt-sm">
            The person must already have a Perfect Pick Up account. Assigning them here promotes
            them to the vendor role.
          </p>

          <label className="flex items-center gap-sm cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              className="accent-primary"
              defaultChecked={vendor?.is_active ?? true}
            />
            <span className="font-body-md text-body-md text-on-surface">
              Live — visible to customers and accepting orders
            </span>
          </label>

          <label className="flex items-center gap-sm cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              className="accent-primary"
              defaultChecked={vendor?.is_featured ?? false}
            />
            <span className="font-body-md text-body-md text-on-surface">
              Featured — pinned to the top of the directory and the home page
            </span>
          </label>
        </fieldset>
      ) : (
        <>
          {/* Preserve the current values so a vendor's save doesn't clear them. */}
          <input type="hidden" name="isActive" value={vendor?.is_active ? "on" : ""} />
          <input type="hidden" name="isFeatured" value={vendor?.is_featured ? "on" : ""} />
        </>
      )}

      <div className="flex gap-md">
        <SaveButton label={isEdit ? "Save Changes" : "Create Restaurant"} />
      </div>
    </form>
  );
}
