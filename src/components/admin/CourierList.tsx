"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createCourier,
  rotateCourierToken,
  setCourierActive,
  type CourierFormState,
} from "@/app/actions/couriers";
import { dateTime, initials } from "@/lib/format";
import type { Courier, Vendor } from "@/lib/types/database";

const FIELD =
  "w-full bg-surface-dim text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20";
const LABEL = "font-label-md text-label-md text-on-surface-variant uppercase ml-1";

const STATUS_TONE: Record<Courier["status"], string> = {
  offline: "bg-surface-container-highest text-on-surface-variant",
  available: "bg-tertiary/15 text-tertiary",
  on_trip: "bg-primary/15 text-primary",
};

function Submit({ label }: { label: string }) {
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

export function CourierList({
  couriers,
  vendors,
  siteUrl,
}: {
  couriers: Courier[];
  vendors: Vendor[];
  siteUrl: string;
}) {
  const [state, action] = useActionState<CourierFormState, FormData>(createCourier, {});
  const [copied, setCopied] = useState<string | null>(null);

  async function copyLink(courier: Courier) {
    const link = `${siteUrl}/courier/${courier.tracking_token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(courier.id);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      // Clipboard blocked (insecure origin, permissions) — show the raw link
      // so it can still be copied by hand.
      window.prompt("Copy this courier link:", link);
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <section className="bg-surface-container rounded-xl border border-outline-variant/10 p-md flex flex-col gap-md">
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">Add a Courier</h2>

        {state.error ? (
          <p className="bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
            {state.error}
          </p>
        ) : null}
        {state.createdName ? (
          <p className="bg-primary/10 border border-primary/30 text-primary font-body-sm text-body-sm px-md py-sm rounded-lg">
            {state.createdName} added. Copy their tracking link below and send it to their phone.
          </p>
        ) : null}

        <form action={action} className="grid grid-cols-1 md:grid-cols-4 gap-md items-end">
          <div className="space-y-xs">
            <label className={LABEL} htmlFor="courier-name">
              Full Name
            </label>
            <input id="courier-name" name="fullName" className={FIELD} placeholder="Marcus Vance" required />
            {state.fieldErrors?.fullName ? (
              <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.fullName[0]}</p>
            ) : null}
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="courier-phone">
              Phone
            </label>
            <input id="courier-phone" name="phone" className={FIELD} placeholder="+1 (212) 555-0301" />
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="courier-vehicle">
              Vehicle
            </label>
            <input id="courier-vehicle" name="vehicle" className={FIELD} placeholder="Electric Scooter" />
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="courier-vendor">
              Assigned To
            </label>
            <select id="courier-vendor" name="vendorId" className={FIELD} defaultValue="">
              <option value="">All restaurants</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <Submit label="Add Courier" />
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-sm">
        <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
          {couriers.length} {couriers.length === 1 ? "Courier" : "Couriers"}
        </h2>

        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl">
          Couriers don&apos;t have logins. Each one gets a private link that opens a GPS
          broadcaster on their phone — anyone holding the link can post that courier&apos;s
          position, so treat it like a password and rotate it if a device is lost.
        </p>

        {couriers.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">No couriers yet.</p>
        ) : (
          couriers.map((courier) => (
            <div
              key={courier.id}
              className={`flex flex-col lg:flex-row lg:items-center gap-md p-md bg-surface-container rounded-xl border border-outline-variant/10 ${
                courier.is_active ? "" : "opacity-60"
              }`}
            >
              <span className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
                {courier.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={courier.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-label-md text-label-md text-primary">
                    {initials(courier.full_name)}
                  </span>
                )}
              </span>

              <div className="flex flex-col gap-xs grow min-w-0">
                <div className="flex items-center gap-sm flex-wrap">
                  <span className="font-title-lg text-title-lg text-on-surface">
                    {courier.full_name}
                  </span>
                  <span
                    className={`font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded ${
                      STATUS_TONE[courier.status]
                    }`}
                  >
                    {courier.status.replace("_", " ")}
                  </span>
                  {!courier.is_active ? (
                    <span className="font-label-md text-label-md uppercase tracking-widest px-sm py-1 rounded bg-error-container/40 text-error">
                      Deactivated
                    </span>
                  ) : null}
                </div>

                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {courier.vehicle ?? "—"}
                  {courier.phone ? ` · ${courier.phone}` : ""} · {courier.trips_count} trips · ★{" "}
                  {courier.rating}
                </span>

                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {courier.last_seen_at
                    ? `Last position ${dateTime(courier.last_seen_at)} (${courier.last_lat?.toFixed(4)}, ${courier.last_lng?.toFixed(4)})`
                    : "Never reported a position"}
                </span>
              </div>

              <div className="flex items-center gap-sm shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => copyLink(courier)}
                  className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied === courier.id ? "check" : "link"}
                  </span>
                  {copied === courier.id ? "Copied" : "Copy link"}
                </button>

                <a
                  href={`/courier/${courier.tracking_token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all"
                >
                  Open
                </a>

                <form action={rotateCourierToken}>
                  <input type="hidden" name="courierId" value={courier.id} />
                  <button
                    type="submit"
                    className="bg-surface-container-high text-on-surface-variant px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:text-on-surface transition-all"
                  >
                    Rotate link
                  </button>
                </form>

                <form action={setCourierActive}>
                  <input type="hidden" name="courierId" value={courier.id} />
                  <input type="hidden" name="isActive" value={courier.is_active ? "false" : "true"} />
                  <button
                    type="submit"
                    className="px-md py-xs font-label-md text-label-md uppercase tracking-widest text-error/80 hover:text-error transition-colors"
                  >
                    {courier.is_active ? "Deactivate" : "Reactivate"}
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
