import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { CourierBeacon } from "@/components/tracking/CourierBeacon";

export const metadata: Metadata = {
  title: "Courier",
  robots: { index: false, follow: false },
};

/**
 * The courier's own device page. Reached by an unguessable link rather than a
 * login — see `couriers.tracking_token`.
 *
 * The service-role read is safe here because the token *is* the credential and
 * we only ever return the courier's display fields, never the token itself.
 */
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const supabase = createAdminClient();
  const { data: courier } = await supabase
    .from("couriers")
    .select("id, full_name, vehicle, is_active")
    .eq("tracking_token", token)
    .maybeSingle();

  if (!courier || !courier.is_active) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select("code, status, pickup_name, pickup_address, dropoff_label, dropoff_address")
    .eq("courier_id", courier.id)
    .in("status", ["courier_assigned", "picked_up", "en_route"])
    .order("placed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-margin-mobile">
      <div className="w-full max-w-[440px] flex flex-col gap-md">
        <div className="flex flex-col items-center gap-xs text-center">
          <span className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg shadow-xl shadow-primary/20">
            <span
              className="material-symbols-outlined text-on-primary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              two_wheeler
            </span>
          </span>
          <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-wider mt-sm">
            {courier.full_name}
          </h1>
          <p className="font-label-md text-label-md text-primary uppercase tracking-[0.2em]">
            Perfect Pick Up Courier
          </p>
        </div>

        <CourierBeacon
          token={token}
          assignment={
            order
              ? {
                  code: order.code,
                  status: order.status,
                  pickupName: order.pickup_name,
                  pickupAddress: order.pickup_address,
                  dropoffLabel: order.dropoff_label,
                  dropoffAddress: order.dropoff_address,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
