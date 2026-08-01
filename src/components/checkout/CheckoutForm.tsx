"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useCart } from "@/components/cart/useCart";
import { placeOrder, type CheckoutState } from "@/app/actions/orders";
import { money } from "@/lib/format";
import type { Address } from "@/lib/types/database";

const TAX_RATE = 0.0875; // mirrors place_order()
const TIP_PRESETS = [0, 0.1, 0.15, 0.2];

const FIELD =
  "w-full bg-surface-dim text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20";
const LABEL = "font-label-md text-label-md text-on-surface-variant uppercase ml-1";

function PlaceOrderButton({ disabled, total }: { disabled: boolean; total: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Placing order…
        </>
      ) : (
        <>Place Order · {money(total)}</>
      )}
    </button>
  );
}

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const cart = useCart();
  const [state, formAction] = useActionState<CheckoutState, FormData>(placeOrder, {});

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null;
  const [addressId, setAddressId] = useState<string>(defaultAddress?.id ?? "new");
  const [manualAddress, setManualAddress] = useState("");
  const [manualLabel, setManualLabel] = useState("Home");
  const [tipRate, setTipRate] = useState(0.15);
  const [notes, setNotes] = useState("");

  const selected = addresses.find((a) => a.id === addressId) ?? null;
  const usingNew = addressId === "new" || !selected;

  const totals = useMemo(() => {
    const subtotal = cart.subtotalCents;
    const serviceFee = cart.vendor?.serviceFeeCents ?? 0;
    const tax = Math.round(subtotal * TAX_RATE);
    const tip = Math.round(subtotal * tipRate);
    return { subtotal, serviceFee, tax, tip, total: subtotal + serviceFee + tax + tip };
  }, [cart.subtotalCents, cart.vendor, tipRate]);

  const itemsPayload = JSON.stringify(
    cart.lines.map((line) => ({
      menu_item_id: line.menuItemId,
      quantity: line.quantity,
      options: line.options,
    }))
  );

  const belowMinimum = !!cart.vendor && totals.subtotal < cart.vendor.minOrderCents;
  const addressValue = usingNew ? manualAddress : [selected?.line1, selected?.city, selected?.postcode].filter(Boolean).join(", ");
  const ready = cart.ready && cart.lines.length > 0 && !!cart.vendor;

  if (cart.ready && cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-md py-xl">
        <span className="material-symbols-outlined text-outline text-[48px]">shopping_bag</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
          Your bag is empty
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-[420px]">
          Pick a restaurant and add a few things — we&apos;ll keep your bag here.
        </p>
        <Link
          href="/restaurants"
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Hidden payload — the server re-prices everything from the menu. */}
      <input type="hidden" name="vendorId" value={cart.vendor?.id ?? ""} />
      <input type="hidden" name="items" value={itemsPayload} />
      <input type="hidden" name="tipCents" value={totals.tip} />
      <input type="hidden" name="address" value={addressValue} />
      <input type="hidden" name="addressLabel" value={usingNew ? manualLabel : selected?.label ?? "Home"} />
      {selected?.lat != null ? <input type="hidden" name="lat" value={selected.lat} /> : null}
      {selected?.lng != null ? <input type="hidden" name="lng" value={selected.lng} /> : null}
      <input type="hidden" name="notes" value={notes} />

      {/* Left: delivery details */}
      <div className="lg:col-span-7 flex flex-col gap-gutter">
        {state.error ? (
          <p className="bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
            {state.error}
          </p>
        ) : null}

        <section className="bg-surface-container rounded-xl border border-outline-variant/10 p-md flex flex-col gap-md">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
            Where are we bringing it?
          </h2>

          {addresses.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex items-start gap-sm p-sm rounded-lg border cursor-pointer transition-all ${
                    addressId === address.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-outline-variant/20 hover:border-outline-variant/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="addressChoice"
                    className="mt-1 accent-primary"
                    checked={addressId === address.id}
                    onChange={() => setAddressId(address.id)}
                  />
                  <span className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface">{address.label}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {[address.line1, address.city, address.postcode].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </label>
              ))}

              <label
                className={`flex items-center gap-sm p-sm rounded-lg border cursor-pointer transition-all ${
                  usingNew ? "border-primary/50 bg-primary/5" : "border-outline-variant/20"
                }`}
              >
                <input
                  type="radio"
                  name="addressChoice"
                  className="accent-primary"
                  checked={usingNew}
                  onChange={() => setAddressId("new")}
                />
                <span className="font-body-md text-body-md text-on-surface">
                  Somewhere else
                </span>
              </label>
            </div>
          ) : null}

          {usingNew ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="space-y-xs">
                <label className={LABEL} htmlFor="checkout-label">
                  Label
                </label>
                <input
                  id="checkout-label"
                  className={FIELD}
                  value={manualLabel}
                  onChange={(event) => setManualLabel(event.target.value)}
                  placeholder="Home"
                />
              </div>
              <div className="md:col-span-2 space-y-xs">
                <label className={LABEL} htmlFor="checkout-address">
                  Full Address
                </label>
                <input
                  id="checkout-address"
                  className={FIELD}
                  value={manualAddress}
                  onChange={(event) => setManualAddress(event.target.value)}
                  placeholder="412 Oakwood Ave, Apt 4B, New York"
                  required
                />
              </div>
            </div>
          ) : null}

          {state.fieldErrors?.address ? (
            <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.address[0]}</p>
          ) : null}

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="checkout-notes">
              Notes for the kitchen or courier
            </label>
            <textarea
              id="checkout-notes"
              rows={3}
              className={`${FIELD} resize-none`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Buzzer is broken — call on arrival."
            />
          </div>
        </section>

        <section className="bg-surface-container rounded-xl border border-outline-variant/10 p-md flex flex-col gap-md">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
            Courier Tip
          </h2>
          <div className="flex gap-sm flex-wrap">
            {TIP_PRESETS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setTipRate(rate)}
                aria-pressed={tipRate === rate}
                className={`px-md py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all ${
                  tipRate === rate
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {rate === 0 ? "No tip" : `${Math.round(rate * 100)}%`}
              </button>
            ))}
            <span className="ml-auto self-center font-body-md text-body-md text-on-surface">
              {money(totals.tip)}
            </span>
          </div>
        </section>
      </div>

      {/* Right: summary */}
      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-28 bg-surface-container-high rounded-xl border border-outline-variant/20 p-md flex flex-col gap-md shadow-xl">
          <div className="flex items-center justify-between gap-md pb-md border-b border-outline-variant/10">
            <h2 className="font-title-lg text-title-lg text-on-surface">
              {cart.vendor?.name ?? "Your order"}
            </h2>
            {cart.vendor ? (
              <Link
                href={`/restaurants/${cart.vendor.slug}`}
                className="font-label-md text-label-md text-primary uppercase tracking-widest hover:brightness-125 whitespace-nowrap"
              >
                Edit
              </Link>
            ) : null}
          </div>

          <ul className="flex flex-col gap-sm">
            {cart.lines.map((line) => (
              <li key={line.key} className="flex items-start justify-between gap-md">
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-body-md text-on-surface">
                    {line.quantity} × {line.name}
                  </span>
                  {line.options ? (
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {line.options}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => cart.removeItem(line.key)}
                    className="self-start font-body-sm text-body-sm text-error/80 hover:text-error transition-colors mt-xs"
                  >
                    Remove
                  </button>
                </div>
                <span className="font-body-md text-body-md text-on-surface whitespace-nowrap">
                  {money(line.unitPriceCents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-xs pt-md border-t border-outline-variant/10">
            <Row label="Subtotal" value={money(totals.subtotal)} />
            <Row label="Concierge Fee" value={money(totals.serviceFee)} />
            <Row label="Tax" value={money(totals.tax)} />
            <Row label="Courier Tip" value={money(totals.tip)} />
          </div>

          <div className="flex justify-between items-center pt-md border-t border-primary/20">
            <span className="font-title-lg text-title-lg text-primary uppercase">Total</span>
            <span className="font-headline-lg text-headline-lg text-primary">
              {money(totals.total)}
            </span>
          </div>

          {belowMinimum && cart.vendor ? (
            <p className="font-body-sm text-body-sm text-error">
              {money(cart.vendor.minOrderCents - totals.subtotal)} more to reach the{" "}
              {money(cart.vendor.minOrderCents)} minimum at {cart.vendor.name}.
            </p>
          ) : null}

          <PlaceOrderButton
            disabled={!ready || belowMinimum || (usingNew && manualAddress.trim().length < 6)}
            total={totals.total}
          />

          <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
            Estimated ready in {cart.vendor?.prepTimeMins ?? 20} minutes. You&apos;ll be able to
            watch your courier the whole way.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-label-md text-label-md text-on-surface-variant uppercase">{label}</span>
      <span className="font-body-md text-body-md text-on-surface">{value}</span>
    </div>
  );
}
