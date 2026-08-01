"use client";

import { useEffect, useRef } from "react";
import type * as LeafletNS from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/geo";

/**
 * Leaflet on CARTO's dark basemap — no API key, no billing, and the palette
 * already sits in the same register as the rest of the app.
 *
 * Leaflet is imported lazily inside an effect because it touches `window` at
 * module scope and would blow up during server rendering.
 */

export interface LiveMapProps {
  pickup: LatLng & { label: string; sublabel?: string };
  dropoff?: (LatLng & { label: string; sublabel?: string }) | null;
  courier?: (LatLng & { label: string }) | null;
  /** Breadcrumb trail of where the courier has already been. */
  trail?: LatLng[];
  className?: string;
}

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function pinIcon(L: typeof LeafletNS, symbol: string, tone: "primary" | "tertiary") {
  const background = tone === "primary" ? "#ffb95d" : "#85cfff";
  const foreground = tone === "primary" ? "#462a00" : "#00344c";

  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:34px;height:34px;border-radius:50%;
      background:${background};color:${foreground};
      border:2px solid rgba(24,18,12,.65);
      box-shadow:0 4px 14px rgba(0,0,0,.5);
      font-family:'Material Symbols Outlined';font-size:19px;line-height:1;
    ">${symbol}</span>`,
  });
}

function courierIcon(L: typeof LeafletNS) {
  return L.divIcon({
    className: "",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    html: `<span style="position:relative;display:flex;align-items:center;justify-content:center;width:42px;height:42px;">
      <span style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(255,185,93,.28);
        animation:ppu-pulse 2s ease-out infinite;
      "></span>
      <span style="
        position:relative;display:flex;align-items:center;justify-content:center;
        width:30px;height:30px;border-radius:50%;
        background:#ffb95d;color:#462a00;
        border:2px solid #18120c;
        box-shadow:0 0 18px rgba(255,185,93,.65);
        font-family:'Material Symbols Outlined';font-size:17px;line-height:1;
      ">two_wheeler</span>
    </span>`,
  });
}

export function LiveMap({ pickup, dropoff, courier, trail = [], className }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const courierMarkerRef = useRef<LeafletNS.Marker | null>(null);
  const trailLineRef = useRef<LeafletNS.Polyline | null>(null);
  const routeLineRef = useRef<LeafletNS.Polyline | null>(null);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView([pickup.lat, pickup.lng], 14);

      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 20 }).addTo(map);

      L.marker([pickup.lat, pickup.lng], { icon: pinIcon(L, "storefront", "primary") })
        .addTo(map)
        .bindPopup(`<strong>${pickup.label}</strong><br/>${pickup.sublabel ?? ""}`);

      if (dropoff) {
        L.marker([dropoff.lat, dropoff.lng], { icon: pinIcon(L, "home", "tertiary") })
          .addTo(map)
          .bindPopup(`<strong>${dropoff.label}</strong><br/>${dropoff.sublabel ?? ""}`);

        // Straight guide line between the two ends of the job.
        routeLineRef.current = L.polyline(
          [
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ],
          { color: "#9e8e7d", weight: 2, opacity: 0.35, dashArray: "6 8" }
        ).addTo(map);

        map.fitBounds(
          L.latLngBounds([
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ]),
          { padding: [60, 60] }
        );
      }

      mapRef.current = map;
    }

    void init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      courierMarkerRef.current = null;
      trailLineRef.current = null;
      routeLineRef.current = null;
    };
    // Pickup/dropoff are fixed for the life of an order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move the courier marker as new GPS frames arrive.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (!courier) {
      if (courierMarkerRef.current) {
        courierMarkerRef.current.remove();
        courierMarkerRef.current = null;
      }
      return;
    }

    const position: LeafletNS.LatLngExpression = [courier.lat, courier.lng];

    if (courierMarkerRef.current) {
      courierMarkerRef.current.setLatLng(position);
    } else {
      courierMarkerRef.current = L.marker(position, {
        icon: courierIcon(L),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`<strong>${courier.label}</strong>`);
      map.panTo(position, { animate: true });
    }
  }, [courier]);

  // Redraw the breadcrumb trail.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (trail.length < 2) {
      trailLineRef.current?.remove();
      trailLineRef.current = null;
      return;
    }

    const points = trail.map((point) => [point.lat, point.lng] as [number, number]);

    if (trailLineRef.current) {
      trailLineRef.current.setLatLngs(points);
    } else {
      trailLineRef.current = L.polyline(points, {
        color: "#ffb95d",
        weight: 3,
        opacity: 0.75,
      }).addTo(map);
    }
  }, [trail]);

  return (
    <div className={className}>
      <style>{`
        @keyframes ppu-pulse {
          0%   { transform: scale(.6); opacity: .9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-container { background: #130d07; font-family: inherit; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #302922; color: #ede0d5; border-radius: 8px;
        }
        .leaflet-popup-content { margin: 10px 14px; font-size: 13px; line-height: 1.4; }
        .leaflet-control-attribution {
          background: rgba(19,13,7,.75) !important; color: #9e8e7d !important; font-size: 10px;
        }
        .leaflet-control-attribution a { color: #d6c3b1 !important; }
        .leaflet-bar a {
          background: #251f18; color: #ede0d5; border-color: rgba(158,142,125,.25);
        }
        .leaflet-bar a:hover { background: #302922; color: #ffb95d; }
      `}</style>
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />
    </div>
  );
}

export default LiveMap;
