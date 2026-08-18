#!/usr/bin/env node
/**
 * Narrows the storefront to the venues approved for launch.
 *
 *   npm run seed:launch            apply
 *   npm run seed:launch -- --dry   show what would change, touch nothing
 *
 * Three things happen:
 *   1. Each approved venue is moved to its real address in the service area,
 *      with coordinates geocoded from that address.
 *   2. Every other restaurant is deactivated — hidden from the storefront but
 *      kept intact, so it can be republished from the admin panel later.
 *   3. Approved venues are marked active.
 *
 * Nothing is deleted. Re-running is safe.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dryRun = process.argv.includes("--dry");

const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

const roster = JSON.parse(readFileSync(resolve(root, "supabase/seed/launch-roster.json"), "utf8"));
const CITY = "Conyers";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Rockdale/Newton county sanity box — rejects a geocode that lands elsewhere. */
function inServiceArea(lat, lng) {
  return lat > 33.4 && lat < 33.8 && lng > -84.3 && lng < -83.7;
}

/**
 * OpenStreetMap's geocoder. Free and keyless, but the usage policy asks for a
 * real User-Agent and no more than one request a second — hence the delay.
 */
async function lookup(query) {
  const url =
    "https://nominatim.openstreetmap.org/search" +
    `?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=us`;
  const res = await fetch(url, {
    headers: { "User-Agent": "PerfectPickUp/1.0 (restaurant onboarding)" },
  });
  if (!res.ok) return null;
  const [hit] = await res.json();
  if (!hit) return null;
  return { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name };
}

/**
 * Nominatim is fussy about US address formatting. Suite numbers make it miss
 * entirely, and it wants state highways as "GA-138" rather than "Highway 138".
 * Try progressively looser forms and take the first hit inside the service area.
 */
function variants(addressLine, postcode) {
  const noSuite = addressLine.replace(/,?\s*(ste|suite|unit|#)\s*[\w-]+/i, "").trim();
  const asStateRoute = noSuite.replace(/\b(highway|hwy)\s*(\d+)/i, "GA-$2");
  // Dropping the quadrant suffix is often what makes a state-route match land.
  const noQuadrant = asStateRoute.replace(/\s+(NE|NW|SE|SW)\b/i, "").trim();
  const streetOnly = noSuite.replace(/^\d+\s*/, "").trim();

  return [...new Set([
    `${addressLine}, ${CITY}, GA ${postcode}`,
    `${noSuite}, ${CITY}, GA ${postcode}`,
    `${asStateRoute}, ${CITY}, GA ${postcode}`,
    `${noQuadrant}, ${CITY}, GA ${postcode}`,
    `${noQuadrant}, ${CITY}, GA`,
    `${noSuite}, ${CITY}, GA`,
    `${asStateRoute}, ${CITY}, GA`,
    `${streetOnly}, ${CITY}, GA`,
  ])];
}

async function geocode(addressLine, postcode) {
  const houseNumber = (addressLine.match(/^(\d+)/) ?? [])[1];
  const tried = [];
  let fallback = null;

  for (const query of variants(addressLine, postcode)) {
    const hit = await lookup(query);
    await sleep(1100);

    if (!hit || !inServiceArea(hit.lat, hit.lng)) {
      tried.push([query, hit ? `${hit.lat},${hit.lng} OUT OF AREA` : "no hit"]);
      continue;
    }

    // A result that opens with the street number is pinned to the building.
    // Anything else is just a point somewhere along the road, which is not
    // good enough to send a courier to.
    if (!houseNumber || hit.label.startsWith(`${houseNumber},`)) return hit;

    fallback ??= hit;
    tried.push([query, `${hit.lat},${hit.lng} road-level only`]);
  }

  if (fallback) return { ...fallback, approximate: true };

  for (const [query, outcome] of tried) console.log("       " + query + "  ->  " + outcome);
  return null;
}



const vendors = await rest("vendors?select=id,slug,name,city,is_active");
const bySlug = new Map(vendors.map((v) => [v.slug, v]));

const approved = new Set(roster.venues.map((v) => v.slug));
const missing = roster.venues.filter((v) => !bySlug.has(v.slug));
if (missing.length) {
  console.error(`Not in the database: ${missing.map((m) => m.slug).join(", ")}`);
  console.error("Run `npm run seed:restaurants` first.");
  process.exit(1);
}

console.log(`${dryRun ? "DRY RUN — " : ""}Relocating ${roster.venues.length} venues to ${CITY}, GA\n`);

let moved = 0;
let failed = 0;

for (const venue of roster.venues) {
  const vendor = bySlug.get(venue.slug);
  const hit = await geocode(venue.address_line, venue.postcode);

  if (!hit) {
    console.log(`  !! ${vendor.name.padEnd(22)} could not be geocoded — left unchanged`);
    failed += 1;
    continue;
  }

  const flag =
    (venue.needs_confirmation ? "  [ADDRESS UNCONFIRMED]" : "") +
    (hit.approximate ? "  [road-level, not building]" : "");
  console.log(`  -> ${vendor.name.padEnd(22)} ${venue.address_line}, ${venue.postcode}  (${hit.lat.toFixed(4)}, ${hit.lng.toFixed(4)})${flag}`);

  if (!dryRun) {
    await rest(`vendors?id=eq.${vendor.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        address_line: venue.address_line,
        city: CITY,
        postcode: venue.postcode,
        lat: hit.lat,
        lng: hit.lng,
        is_active: true,
      }),
    });
  }
  moved += 1;
}

const toHide = vendors.filter((v) => !approved.has(v.slug) && v.is_active);
console.log(`\nHiding ${toHide.length} restaurants outside the launch list (kept, not deleted).`);

if (!dryRun && toHide.length) {
  for (const vendor of toHide) {
    await rest(`vendors?id=eq.${vendor.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: false }),
    });
  }
}

if (!dryRun) {
  const live = await rest("vendors?select=name,city,postcode&is_active=eq.true&order=name");
  console.log(`\nLive on the storefront (${live.length}):`);
  for (const v of live) console.log(`  ${v.name.padEnd(24)} ${v.city}, ${v.postcode ?? "?"}`);
}

console.log(`\nrelocated ${moved}, geocode failures ${failed}`);
const unconfirmed = roster.venues.filter((v) => v.needs_confirmation);
if (unconfirmed.length) {
  console.log(`\nNeeds the client to confirm the exact address:`);
  for (const v of unconfirmed) console.log(`  ${v.slug} — ${v.needs_confirmation}`);
}
