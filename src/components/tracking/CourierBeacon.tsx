"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ORDER_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus } from "@/lib/types/database";

export interface CourierAssignment {
  code: string;
  status: OrderStatus;
  pickupName: string;
  pickupAddress: string;
  dropoffLabel: string;
  dropoffAddress: string;
}

/** Don't spam the database with sub-second GPS jitter. */
const MIN_PING_INTERVAL_MS = 5000;

export function CourierBeacon({
  token,
  assignment,
}: {
  token: string;
  assignment: CourierAssignment | null;
}) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [pingCount, setPingCount] = useState(0);

  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);
  const inFlightRef = useRef(false);

  const send = useCallback(
    async (coords: GeolocationCoordinates) => {
      // Skip if a request is still open or we pinged very recently.
      if (inFlightRef.current) return;
      const now = Date.now();
      if (now - lastSentAtRef.current < MIN_PING_INTERVAL_MS) return;

      inFlightRef.current = true;
      lastSentAtRef.current = now;

      try {
        const response = await fetch(`/api/courier/${token}/ping`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: coords.latitude,
            lng: coords.longitude,
            heading: Number.isFinite(coords.heading) ? coords.heading : null,
            speed: Number.isFinite(coords.speed) ? coords.speed : null,
            accuracy: coords.accuracy ?? null,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          setError(payload.error ?? "Could not send your location.");
          return;
        }

        setError(null);
        setLastSent(new Date());
        setPingCount((count) => count + 1);
      } catch {
        setError("You appear to be offline. We'll retry on the next position update.");
      } finally {
        inFlightRef.current = false;
      }
    },
    [token]
  );

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  }, []);

  const start = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("This device can't share its location.");
      return;
    }

    setError(null);
    setSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (next) => {
        setPosition(next);
        void send(next.coords);
      },
      (geoError) => {
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was denied. Enable it for this site and try again."
            : "Couldn't get a GPS fix. Move somewhere with a clearer view of the sky."
        );
        stop();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 }
    );
  }, [send, stop]);

  // Always release the GPS watch when the page goes away.
  useEffect(() => stop, [stop]);

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-md flex flex-col gap-md shadow-2xl">
      {assignment ? (
        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between gap-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
              Current Job
            </span>
            <span className="font-label-md text-label-md text-primary uppercase">
              {ORDER_STATUS_LABEL[assignment.status]}
            </span>
          </div>

          <p className="font-title-lg text-title-lg text-on-surface">{assignment.code}</p>

          <div className="flex flex-col gap-xs pt-sm border-t border-outline-variant/10">
            <span className="font-label-md text-label-md text-primary uppercase">Collect from</span>
            <p className="font-body-sm text-body-sm text-on-surface">{assignment.pickupName}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {assignment.pickupAddress}
            </p>
          </div>

          <div className="flex flex-col gap-xs pt-sm border-t border-outline-variant/10">
            <span className="font-label-md text-label-md text-tertiary uppercase">Deliver to</span>
            <p className="font-body-sm text-body-sm text-on-surface">{assignment.dropoffLabel}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {assignment.dropoffAddress}
            </p>
          </div>
        </div>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          You have no active job right now. You can still go online — your position will be
          attached automatically as soon as an order is assigned to you.
        </p>
      )}

      {error ? (
        <p className="bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={sharing ? stop : start}
        className={`w-full py-md rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all flex items-center justify-center gap-sm ${
          sharing
            ? "bg-surface-variant text-on-surface-variant hover:bg-outline-variant/30"
            : "bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/10"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {sharing ? "location_disabled" : "my_location"}
        </span>
        {sharing ? "Stop sharing location" : "Go online & share location"}
      </button>

      {sharing ? (
        <div className="flex flex-col gap-xs font-body-sm text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-xs text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Broadcasting · {pingCount} {pingCount === 1 ? "update" : "updates"} sent
          </span>
          {position ? (
            <span className="tabular-nums">
              {position.coords.latitude.toFixed(5)}, {position.coords.longitude.toFixed(5)} · ±
              {Math.round(position.coords.accuracy)} m
            </span>
          ) : (
            <span>Acquiring GPS fix…</span>
          )}
          {lastSent ? <span>Last sent {lastSent.toLocaleTimeString()}</span> : null}
          <span className="text-outline">
            Keep this screen open — browsers stop GPS when the tab is backgrounded for long.
          </span>
        </div>
      ) : null}
    </div>
  );
}
