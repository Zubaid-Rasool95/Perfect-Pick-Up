#!/usr/bin/env node
/**
 * Seeds the restaurant roster from supabase/seed/restaurants.json.
 *
 * Idempotent: vendors are matched on `slug` and menu items on
 * (vendor, name), so re-running only fills in what's missing. It never
 * overwrites edits made in the admin panel and never deletes anything.
 *
 *   npm run seed:restaurants
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local. The service-role key is needed because these tables are
 * admin-writable only under RLS.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

function loadEnv(file) {
  let raw;
  try {
    raw = readFileSync(resolve(root, file), "utf8");
  } catch {
    throw new Error(`Could not read ${file}. Copy .env.local.example to .env.local first.`);
  }
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      })
  );
}

const env = loadEnv(".env.local");
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
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

const restaurants = JSON.parse(readFileSync(resolve(root, "supabase/seed/restaurants.json"), "utf8"));

// Sanity-check the file before touching the database.
const slugs = restaurants.map((r) => r.slug);
const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupes.length) {
  console.error(`Duplicate slugs in restaurants.json: ${[...new Set(dupes)].join(", ")}`);
  process.exit(1);
}

console.log(`Seeding ${restaurants.length} restaurants into ${SUPABASE_URL}\n`);

const existing = await rest("vendors?select=id,slug");
const bySlug = new Map(existing.map((v) => [v.slug, v.id]));

let created = 0;
let skipped = 0;
let itemsAdded = 0;

for (const r of restaurants) {
  let vendorId = bySlug.get(r.slug);

  if (!vendorId) {
    const [row] = await rest("vendors", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        slug: r.slug,
        name: r.name,
        tagline: r.tagline ?? null,
        cuisine: r.cuisine ?? null,
        description: r.description ?? null,
        address_line: r.address_line,
        city: r.city ?? "Atlanta",
        postcode: r.postcode ?? null,
        lat: r.lat,
        lng: r.lng,
        price_level: r.price_level ?? 2,
        prep_time_mins: r.prep_time_mins ?? 20,
        min_order_cents: r.min_order_cents ?? 0,
        service_fee_cents: r.service_fee_cents ?? 399,
        is_active: true,
        is_featured: r.is_featured ?? false,
      }),
    });
    vendorId = row.id;
    created += 1;
    console.log(`+ ${r.name}`);
  } else {
    skipped += 1;
  }

  if (!r.menu?.length) continue;

  // One "Menu" section per brand, created on first run.
  const categories = await rest(
    `menu_categories?vendor_id=eq.${vendorId}&name=eq.Menu&select=id`
  );
  let categoryId = categories[0]?.id;
  if (!categoryId) {
    const [cat] = await rest("menu_categories", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ vendor_id: vendorId, name: "Menu", position: 0 }),
    });
    categoryId = cat.id;
  }

  const have = new Set(
    (await rest(`menu_items?vendor_id=eq.${vendorId}&select=name`)).map((i) => i.name)
  );
  const missing = r.menu.filter((item) => !have.has(item.name));

  if (missing.length) {
    await rest("menu_items", {
      method: "POST",
      body: JSON.stringify(
        missing.map((item, index) => ({
          vendor_id: vendorId,
          category_id: categoryId,
          name: item.name,
          description: item.description ?? null,
          price_cents: item.price_cents,
          is_signature: item.is_signature ?? false,
          is_available: true,
          position: index,
        }))
      ),
    });
    itemsAdded += missing.length;
  }
}

const totalVendors = (await rest("vendors?select=id")).length;
const totalItems = (await rest("menu_items?select=id")).length;

console.log(
  `\nDone. ${created} restaurants created, ${skipped} already present, ${itemsAdded} menu items added.`
);
console.log(`Database now holds ${totalVendors} restaurants and ${totalItems} menu items.`);
