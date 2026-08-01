import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  MenuCategory,
  MenuItem,
  MenuItemOption,
  Vendor,
  VendorHours,
} from "@/lib/types/database";

export type VendorSort = "recommended" | "fastest" | "rating" | "min_order";

export interface VendorQuery {
  search?: string;
  cuisine?: string;
  sort?: VendorSort;
  page?: number;
  perPage?: number;
}

export interface VendorPage {
  vendors: Vendor[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export async function listVendors({
  search,
  cuisine,
  sort = "recommended",
  page = 1,
  perPage = 9,
}: VendorQuery = {}): Promise<VendorPage> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;

  let query = supabase.from("vendors").select("*", { count: "exact" }).eq("is_active", true);

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name.ilike.${term},cuisine.ilike.${term},tagline.ilike.${term}`);
  }
  if (cuisine && cuisine !== "All") {
    query = query.eq("cuisine", cuisine);
  }

  switch (sort) {
    case "fastest":
      query = query.order("prep_time_mins", { ascending: true });
      break;
    case "rating":
      query = query.order("rating", { ascending: false }).order("rating_count", { ascending: false });
      break;
    case "min_order":
      query = query.order("min_order_cents", { ascending: true });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false });
  }

  const { data, count, error } = await query.range(from, from + perPage - 1);
  if (error) throw new Error(`Could not load restaurants: ${error.message}`);

  const total = count ?? 0;
  return {
    vendors: (data ?? []) as Vendor[],
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function listCuisines(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("cuisine")
    .eq("is_active", true)
    .not("cuisine", "is", null);

  const unique = new Set((data ?? []).map((row) => row.cuisine as string));
  return Array.from(unique).sort();
}

export async function listFeaturedVendors(limit = 3): Promise<Vendor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false })
    .limit(limit);

  return (data ?? []) as Vendor[];
}

export interface VendorDetail {
  vendor: Vendor;
  categories: MenuCategory[];
  items: MenuItem[];
  options: MenuItemOption[];
  hours: VendorHours[];
}

export async function getVendorBySlug(slug: string): Promise<VendorDetail | null> {
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!vendor) return null;

  const [{ data: categories }, { data: items }, { data: hours }] = await Promise.all([
    supabase.from("menu_categories").select("*").eq("vendor_id", vendor.id).order("position"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("position"),
    supabase.from("vendor_hours").select("*").eq("vendor_id", vendor.id).order("day_of_week"),
  ]);

  const itemIds = (items ?? []).map((item) => item.id);
  const { data: options } = itemIds.length
    ? await supabase
        .from("menu_item_options")
        .select("*")
        .in("menu_item_id", itemIds)
        .order("position")
    : { data: [] };

  return {
    vendor: vendor as Vendor,
    categories: (categories ?? []) as MenuCategory[],
    items: (items ?? []) as MenuItem[],
    options: (options ?? []) as MenuItemOption[],
    hours: (hours ?? []) as VendorHours[],
  };
}
