"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";

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
      {pending ? "Saving…" : "Save Profile"}
    </button>
  );
}

export function ProfileEditor({
  fullName,
  phone,
  avatarUrl,
}: {
  fullName: string;
  phone: string;
  avatarUrl: string;
}) {
  const [state, action] = useActionState<ProfileFormState, FormData>(updateProfile, {});

  return (
    <section className="flex flex-col gap-md">
      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">Your Details</h2>

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
            Profile updated.
          </p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-xs">
            <label className={LABEL} htmlFor="profile-name">
              Full Name
            </label>
            <input id="profile-name" name="fullName" className={FIELD} defaultValue={fullName} required />
            {state.fieldErrors?.fullName ? (
              <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.fullName[0]}</p>
            ) : null}
          </div>

          <div className="space-y-xs">
            <label className={LABEL} htmlFor="profile-phone">
              Phone
            </label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              className={FIELD}
              defaultValue={phone}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-xs md:col-span-2">
            <label className={LABEL} htmlFor="profile-avatar">
              Avatar Image URL
            </label>
            <input
              id="profile-avatar"
              name="avatarUrl"
              type="url"
              className={FIELD}
              defaultValue={avatarUrl}
              placeholder="https://…"
            />
            {state.fieldErrors?.avatarUrl ? (
              <p className="font-body-sm text-body-sm text-error">{state.fieldErrors.avatarUrl[0]}</p>
            ) : null}
          </div>
        </div>

        <Save />
      </form>
    </section>
  );
}
