#!/usr/bin/env node
/**
 * Fills in placeholder photography for restaurants and dishes that have none.
 *
 *   npm run seed:images                  assign images to rows that have none
 *   npm run seed:images -- --reassign    also redo previous placeholder picks
 *   npm run seed:images -- --verify      only check every URL still resolves
 *
 * By default only touches rows where the image is NULL. --reassign additionally
 * replaces images this script set before (recognised by the Unsplash host),
 * which is how a corrected keyword mapping gets applied to existing rows.
 *
 * Uploads made through the dashboard are never touched in either mode.
 *
 * The pictures are Unsplash stock, licensed for commercial use. They are
 * deliberately generic rather than brand-owned: a chain's own product
 * photography and logos are copyrighted, and republishing them here without
 * an agreement would be infringement. Logos are left empty for that reason —
 * restaurants supply their own through the vendor dashboard.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const verifyOnly = process.argv.includes("--verify");
const reassign = process.argv.includes("--reassign");

/** Images this script placed, as opposed to something a human uploaded. */
const PLACEHOLDER_HOST = "https://images.unsplash.com/";
const isReplaceable = (url) => !url || (reassign && url.startsWith(PLACEHOLDER_HOST));

const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

const config = JSON.parse(readFileSync(resolve(root, "supabase/seed/food-images.json"), "utf8"));
const { pool, keywords, cuisineFallback } = config;

/** Wide crop for restaurant banners, squarer for dish thumbnails. */
function buildUrl(id, variant) {
  const size = variant === "hero" ? "w=1200&h=675" : "w=800&h=600";
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&${size}&q=75`;
}

/** Stable per-name pick, so the same dish always gets the same photo and
 *  neighbouring dishes in a category don't all look identical. */
function pick(category, seed, variant) {
  const ids = pool[category];
  if (!ids?.length) return null;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return buildUrl(ids[hash % ids.length], variant);
}

function categoryFor(dishName, cuisine) {
  const name = dishName.toLowerCase();
  for (const [needle, category] of keywords) {
    if (name.includes(needle)) return category;
  }
  return cuisineFallback[cuisine] ?? "burger";
}

// --- verify mode -------------------------------------------------------------
if (verifyOnly) {
  let bad = 0;
  const ids = [...new Set(Object.values(pool).flat())];
  for (const id of ids) {
    try {
      const res = await fetch(buildUrl(id, "item"), { signal: AbortSignal.timeout(15000) });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !type.startsWith("image/")) {
        console.log(`DEAD ${id} -> ${res.status} ${type}`);
        bad += 1;
      }
    } catch (e) {
      console.log(`DEAD ${id} -> ${e.message}`);
      bad += 1;
    }
  }
  console.log(`${ids.length - bad}/${ids.length} images resolve.`);
  process.exit(bad ? 1 : 0);
}

// --- assign ------------------------------------------------------------------
const vendors = await rest("vendors?select=id,name,slug,cuisine,hero_image_url");
const items = await rest("menu_items?select=id,name,vendor_id,image_url");

const cuisineByVendor = new Map(vendors.map((v) => [v.id, v.cuisine]));

const vendorsNeeding = vendors.filter((v) => isReplaceable(v.hero_image_url));
const itemsNeeding = items.filter((i) => isReplaceable(i.image_url));

console.log(
  `${reassign ? "Reassigning" : "Filling"}: ` +
    `${vendorsNeeding.length}/${vendors.length} restaurants, ` +
    `${itemsNeeding.length}/${items.length} dishes.\n`
);

let vendorCount = 0;
for (const vendor of vendorsNeeding) {
  const category = cuisineFallback[vendor.cuisine] ?? "diner";
  const url = pick(category, vendor.slug, "hero");
  if (!url) continue;

  await rest(`vendors?id=eq.${vendor.id}`, {
    method: "PATCH",
    body: JSON.stringify({ hero_image_url: url }),
  });
  vendorCount += 1;
}
console.log(`restaurants updated: ${vendorCount}`);

let itemCount = 0;
for (const item of itemsNeeding) {
  const category = categoryFor(item.name, cuisineByVendor.get(item.vendor_id));
  const url = pick(category, item.name, "item");
  if (!url) continue;

  await rest(`menu_items?id=eq.${item.id}`, {
    method: "PATCH",
    body: JSON.stringify({ image_url: url }),
  });
  itemCount += 1;
}
console.log(`dishes updated:      ${itemCount}`);

const stillBlankVendors = (await rest("vendors?select=id&hero_image_url=is.null")).length;
const stillBlankItems = (await rest("menu_items?select=id&image_url=is.null")).length;
console.log(
  `\nRemaining without a picture — restaurants: ${stillBlankVendors}, dishes: ${stillBlankItems}`
);
console.log("Logos are intentionally left empty; restaurants upload their own.");
