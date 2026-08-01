import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { AddressBook } from "@/components/profile/AddressBook";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listMyOrders } from "@/lib/data/orders";
import { dateTime, initials, money } from "@/lib/format";
import type { Address } from "@/lib/types/database";

export const metadata: Metadata = { title: "My Profile" };

export default async function Page() {
  const user = await requireUser("/profile");

  const supabase = await createClient();
  const [{ data: addresses }, orders] = await Promise.all([
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
    listMyOrders(5),
  ]);

  const settled = orders.filter((order) => order.status !== "cancelled");
  const lifetimeCents = settled.reduce((sum, order) => sum + order.total_cents, 0);
  const role = user.profile?.role ?? "customer";

  return (
    <>
      <SiteHeader />
      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
          {/* Profile header */}
          <div className="relative w-full flex flex-col md:flex-row items-start md:items-end gap-md mb-xl">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-highest ring-4 ring-background shadow-xl flex items-center justify-center shrink-0">
              {user.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={user.profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display-lg text-display-lg-mobile text-primary">
                  {initials(user.profile?.full_name ?? user.email)}
                </span>
              )}
            </div>

            <div className="flex-1 space-y-sm">
              <div className="flex items-center gap-sm">
                <span className="font-label-md text-label-md text-primary uppercase tracking-widest">
                  {role === "admin"
                    ? "Administrator"
                    : role === "vendor"
                      ? "Restaurant Partner"
                      : "Member"}
                </span>
                <div className="h-px w-12 bg-outline-variant" />
              </div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase">
                {user.profile?.full_name ?? "Your Profile"}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {user.email}
                {user.profile?.created_at
                  ? ` · Member since ${new Date(user.profile.created_at).getFullYear()}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
            <Stat label="Orders Placed" value={String(settled.length)} />
            <Stat label="Lifetime Spend" value={money(lifetimeCents)} />
            <Stat
              label="Saved Addresses"
              value={String((addresses ?? []).length)}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-xl">
            <div className="flex-1 flex flex-col gap-xl min-w-0">
              <ProfileEditor
                fullName={user.profile?.full_name ?? ""}
                phone={user.profile?.phone ?? ""}
                avatarUrl={user.profile?.avatar_url ?? ""}
              />

              <AddressBook addresses={(addresses ?? []) as Address[]} />
            </div>

            {/* Recent orders */}
            <aside className="lg:w-96 shrink-0 flex flex-col gap-md">
              <div className="flex items-center justify-between gap-md">
                <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
                  Recent Orders
                </h2>
                <Link
                  href="/orders"
                  className="font-label-md text-label-md text-primary uppercase tracking-widest hover:brightness-125 whitespace-nowrap"
                >
                  See all
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Nothing yet.{" "}
                  <Link href="/restaurants" className="text-primary hover:underline">
                    Find somewhere to eat.
                  </Link>
                </p>
              ) : (
                <div className="flex flex-col gap-sm">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/track/${order.code}`}
                      className="flex items-center justify-between gap-md p-md bg-surface-container rounded-lg border border-outline-variant/10 hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-body-md text-body-md text-on-surface truncate">
                          {order.vendors?.name ?? order.pickup_name}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {dateTime(order.placed_at)}
                        </span>
                      </div>
                      <span className="font-body-md text-body-md text-primary whitespace-nowrap">
                        {money(order.total_cents)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-md rounded-xl bg-surface-container border border-outline-variant/10 flex flex-col gap-xs">
      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
        {label}
      </span>
      <span className="font-headline-xl text-headline-xl text-on-surface">{value}</span>
    </div>
  );
}
