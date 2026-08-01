import { resolveActiveVendor } from "@/lib/data/vendor-scope";
import { getSessionUser } from "@/lib/auth";
import { VendorForm } from "@/components/admin/VendorForm";
import { VendorSwitcher } from "@/components/dashboard/VendorSwitcher";

export const metadata = { title: "Settings" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string }>;
}) {
  const { vendor: vendorParam } = await searchParams;
  const [{ vendors, active }, user] = await Promise.all([
    resolveActiveVendor(vendorParam),
    getSessionUser(),
  ]);

  const isAdmin = user?.profile?.role === "admin";

  return (
    <div className="flex flex-col gap-lg">
      <VendorSwitcher vendors={vendors} activeId={active.id} />

      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
        {active.name} Settings
      </h2>

      {!isAdmin ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl">
          Whether your restaurant is live or featured is set by the Perfect Pick Up team — get in
          touch if you need it changed.
        </p>
      ) : null}

      <VendorForm vendor={active} canManagePlatformFlags={isAdmin} />
    </div>
  );
}
