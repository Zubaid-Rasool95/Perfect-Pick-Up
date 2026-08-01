"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  addAddress,
  deleteAddress,
  makeAddressDefault,
  type ProfileFormState,
} from "@/app/actions/profile";
import type { Address } from "@/lib/types/database";

const FIELD =
  "w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20";
const LABEL = "font-label-md text-label-md text-on-surface-variant uppercase ml-1";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60 self-start"
    >
      {pending ? "Saving…" : "Add Address"}
    </button>
  );
}

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [state, action] = useActionState<ProfileFormState, FormData>(addAddress, {});

  return (
    <section className="flex flex-col gap-md">
      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">Addresses</h2>

      {addresses.length > 0 ? (
        <div className="flex flex-col gap-sm">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col sm:flex-row sm:items-center gap-md p-md bg-surface-container rounded-lg border border-outline-variant/10"
            >
              <div className="flex flex-col gap-xs grow min-w-0">
                <span className="font-body-md text-body-md text-on-surface flex items-center gap-sm flex-wrap">
                  {address.label}
                  {address.is_default ? (
                    <span className="font-label-md text-label-md uppercase tracking-widest px-sm py-0.5 rounded bg-primary/15 text-primary">
                      Default
                    </span>
                  ) : null}
                  {address.lat == null ? (
                    <span className="font-label-md text-label-md uppercase tracking-widest px-sm py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                      No map pin
                    </span>
                  ) : null}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {[address.line1, address.city, address.postcode].filter(Boolean).join(", ")}
                </span>
              </div>

              <div className="flex items-center gap-sm shrink-0">
                {!address.is_default ? (
                  <form action={makeAddressDefault}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <button
                      type="submit"
                      className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
                    >
                      Make default
                    </button>
                  </form>
                ) : null}
                <form action={deleteAddress}>
                  <input type="hidden" name="addressId" value={address.id} />
                  <button
                    type="submit"
                    className="px-md py-xs font-label-md text-label-md uppercase tracking-widest text-error/80 hover:text-error transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No saved addresses yet. Adding one with coordinates lets the tracking map draw the full
          route to your door.
        </p>
      )}

      <form
        action={action}
        className="bg-surface-container rounded-xl border border-outline-variant/10 p-md flex flex-col gap-md"
      >
        {state.error ? (
          <p className="bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="bg-primary/10 border border-primary/30 text-primary font-body-sm text-body-sm px-md py-sm rounded-lg">
            Address saved.
          </p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <div className="space-y-xs">
            <label className={LABEL} htmlFor="address-label">
              Label
            </label>
            <input id="address-label" name="label" className={FIELD} placeholder="Home" required />
            {state.fieldErrors?.label ? (
              <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.label[0]}</p>
            ) : null}
          </div>

          <div className="space-y-xs md:col-span-3">
            <label className={LABEL} htmlFor="address-line1">
              Street Address
            </label>
            <input
              id="address-line1"
              name="line1"
              className={FIELD}
              placeholder="412 Oakwood Ave, Apt 4B"
              required
            />
            {state.fieldErrors?.line1 ? (
              <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.line1[0]}</p>
            ) : null}
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="address-city">
              City
            </label>
            <input id="address-city" name="city" className={FIELD} placeholder="New York" />
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="address-postcode">
              Postcode
            </label>
            <input id="address-postcode" name="postcode" className={FIELD} placeholder="10014" />
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="address-lat">
              Latitude
            </label>
            <input
              id="address-lat"
              name="lat"
              type="number"
              step="any"
              className={FIELD}
              placeholder="40.7359"
            />
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="address-lng">
              Longitude
            </label>
            <input
              id="address-lng"
              name="lng"
              type="number"
              step="any"
              className={FIELD}
              placeholder="-74.0036"
            />
          </div>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Coordinates are optional but recommended — without them the tracking map can&apos;t show
          the dropoff pin or a distance-based ETA. Right-click your building on openstreetmap.org
          and choose &ldquo;Show address&rdquo; to read them off.
        </p>

        <label className="flex items-center gap-sm cursor-pointer">
          <input type="checkbox" name="isDefault" className="accent-primary" />
          <span className="font-body-md text-body-md text-on-surface">
            Use this as my default delivery address
          </span>
        </label>

        <Save />
      </form>
    </section>
  );
}
