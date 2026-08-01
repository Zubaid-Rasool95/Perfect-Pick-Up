"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { distanceKm, etaMinutes, formatDistance, type LatLng } from "@/lib/geo";
import { ORDER_STATUS_LABEL, isLive } from "@/lib/format";
import type { CourierLocation, OrderStatus } from "@/lib/types/database";

// Leaflet reaches for `window` on import, so keep it out of the server bundle.
const LiveMap = dynamic(() => import("@/components/map/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-surface-container-high animate-pulse flex items-center justify-center">
      <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
        Loading map…
      </span>
    </div>
  ),
});

const MAX_TRAIL_POINTS = 120;
/** Beyond this, the last GPS frame is too old to describe as "live". */
const STALE_AFTER_MS = 90_000;

export interface LiveTrackerProps {
  orderId: string;
  orderCode: string;
  initialStatus: OrderStatus;
  pickup: LatLng & { label: string; sublabel?: string };
  dropoff?: (LatLng & { label: string; sublabel?: string }) | null;
  courierName: string | null;
  initialLocation: CourierLocation | null;
}

export function LiveTracker({
  orderId,
  orderCode,
  initialStatus,
  pickup,
  dropoff,
  courierName,
  initialLocation,
}: LiveTrackerProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [location, setLocation] = useState<CourierLocation | null>(initialLocation);
  const [trail, setTrail] = useState<LatLng[]>(
    initialLocation ? [{ lat: initialLocation.lat, lng: initialLocation.lng }] : []
  );
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const supabaseRef = useRef(createClient());

  // Subscribe to this order's GPS stream and status changes.
  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "courier_locations",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const point = payload.new as CourierLocation;
          setLocation(point);
          setTrail((prev) => [...prev, { lat: point.lat, lng: point.lng }].slice(-MAX_TRAIL_POINTS));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setStatus((payload.new as { status: OrderStatus }).status);
        }
      )
      .subscribe((state) => setConnected(state === "SUBSCRIBED"));

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Drives the "updated Ns ago" copy.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Memoised so the identity is stable across renders that didn't move the pin.
  const courierPoint = useMemo(
    () => (location ? { lat: location.lat, lng: location.lng } : null),
    [location]
  );

  const remaining = useMemo(() => {
    if (!courierPoint || !dropoff) return null;
    return {
      km: distanceKm(courierPoint, dropoff),
      mins: etaMinutes(courierPoint, dropoff),
    };
  }, [courierPoint, dropoff]);

  const lastSeenSeconds = location
    ? Math.max(0, Math.round((now - new Date(location.recorded_at).getTime()) / 1000))
    : null;
  const stale = lastSeenSeconds !== null && lastSeenSeconds * 1000 > STALE_AFTER_MS;

  return (
    <div className="relative group">
      <LiveMap
        className="w-full h-[420px] lg:h-[600px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-xl"
        pickup={pickup}
        dropoff={dropoff}
        courier={courierPoint ? { ...courierPoint, label: courierName ?? "Your courier" } : null}
        trail={trail}
      />

      {/* Floating overlays, matching the original tracking design. */}
      <div className="absolute top-md left-md flex flex-col gap-xs z-[500] max-w-[240px]">
        <div className="bg-surface/90 backdrop-blur-md p-md rounded-lg border border-outline-variant/10 shadow-lg">
          <span className="font-label-md text-label-md text-primary uppercase block mb-xs">
            Pick Up
          </span>
          <p className="font-body-sm text-body-sm text-on-surface">{pickup.label}</p>
          {pickup.sublabel ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">{pickup.sublabel}</p>
          ) : null}
        </div>

        {dropoff ? (
          <div className="bg-surface/90 backdrop-blur-md p-md rounded-lg border border-outline-variant/10 shadow-lg">
            <span className="font-label-md text-label-md uppercase block mb-xs text-tertiary">
              Dropoff
            </span>
            <p className="font-body-sm text-body-sm text-on-surface">{dropoff.label}</p>
            {dropoff.sublabel ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">{dropoff.sublabel}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Live status chip */}
      <div className="absolute top-md right-md z-[500] flex flex-col items-end gap-xs">
        <div className="bg-surface/90 backdrop-blur-md px-md py-sm rounded-lg border border-outline-variant/10 shadow-lg flex items-center gap-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              connected && !stale ? "bg-primary animate-pulse" : "bg-outline"
            }`}
          />
          <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
            {ORDER_STATUS_LABEL[status]}
          </span>
        </div>

        {courierPoint && remaining ? (
          <div className="bg-surface/90 backdrop-blur-md px-md py-sm rounded-lg border border-primary/20 shadow-lg text-right">
            <p className="font-headline-lg text-headline-lg text-primary leading-none">
              {remaining.mins} min
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {formatDistance(remaining.km)} away
            </p>
          </div>
        ) : null}
      </div>

      {/* Ground truth about the feed itself */}
      <div className="absolute bottom-md left-md z-[500]">
        <div className="bg-surface/90 backdrop-blur-md px-md py-xs rounded-lg border border-outline-variant/10 font-body-sm text-body-sm text-on-surface-variant">
          {!isLive(status) ? (
            <>Order {status === "cancelled" ? "cancelled" : "completed"} · {orderCode}</>
          ) : !courierPoint ? (
            <>Waiting for a courier to start sharing their location…</>
          ) : stale ? (
            <>Last position {Math.round((lastSeenSeconds ?? 0) / 60)} min ago — signal lost</>
          ) : (
            <>Live · updated {lastSeenSeconds}s ago</>
          )}
        </div>
      </div>
    </div>
  );
}
