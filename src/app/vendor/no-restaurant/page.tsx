import Link from "next/link";

export const metadata = { title: "No restaurant yet" };

/**
 * Where `resolveActiveVendor` lands someone who has the vendor role but hasn't
 * been attached to a restaurant yet.
 */
export default function Page() {
  return (
    <div className="flex flex-col items-start gap-md max-w-2xl">
      <span className="material-symbols-outlined text-outline text-[48px]">storefront</span>
      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
        No restaurant assigned
      </h2>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Your account has vendor access, but it isn&apos;t linked to a restaurant yet. An
        administrator needs to open the restaurant&apos;s record and set your email as its owner.
        Once that&apos;s done, your orders and menu will appear here.
      </p>
      <Link
        href="/"
        className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all"
      >
        Back to site
      </Link>
    </div>
  );
}
