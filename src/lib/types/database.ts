/**
 * Hand-maintained mirror of the SQL in `supabase/migrations`.
 * If you change a migration, change this too.
 */

export type UserRole = "customer" | "vendor" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "courier_assigned"
  | "picked_up"
  | "en_route"
  | "delivered"
  | "cancelled";

export type CourierStatus = "offline" | "available" | "on_trip";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cuisine: string | null;
  hero_image_url: string | null;
  logo_url: string | null;
  address_line: string;
  city: string | null;
  postcode: string | null;
  lat: number;
  lng: number;
  phone: string | null;
  email: string | null;
  rating: number;
  rating_count: number;
  price_level: number;
  prep_time_mins: number;
  min_order_cents: number;
  service_fee_cents: number;
  is_active: boolean;
  is_featured: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorHours {
  id: string;
  vendor_id: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
}

export interface MenuCategory {
  id: string;
  vendor_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  is_available: boolean;
  is_signature: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItemOption {
  id: string;
  menu_item_id: string;
  option_group: string;
  name: string;
  price_delta_cents: number;
  is_default: boolean;
  position: number;
}

export interface Courier {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  vehicle: string | null;
  rating: number;
  trips_count: number;
  status: CourierStatus;
  vendor_id: string | null;
  tracking_token: string;
  last_lat: number | null;
  last_lng: number | null;
  last_seen_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  city: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  code: string;
  customer_id: string;
  vendor_id: string;
  courier_id: string | null;
  status: OrderStatus;
  subtotal_cents: number;
  service_fee_cents: number;
  tax_cents: number;
  tip_cents: number;
  total_cents: number;
  pickup_name: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_label: string;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  notes: string | null;
  eta_at: string | null;
  placed_at: string;
  confirmed_at: string | null;
  preparing_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name_snapshot: string;
  options_snapshot: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface CourierLocation {
  id: number;
  courier_id: string;
  order_id: string | null;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  recorded_at: string;
}

/** Convenience shapes for joined reads. */
export type VendorWithMenu = Vendor & {
  menu_categories: MenuCategory[];
  menu_items: (MenuItem & { menu_item_options: MenuItemOption[] })[];
  vendor_hours: VendorHours[];
};

export type OrderWithDetail = Order & {
  vendors: Pick<Vendor, "id" | "name" | "slug" | "hero_image_url" | "phone"> | null;
  couriers: Pick<Courier, "id" | "full_name" | "avatar_url" | "phone" | "rating" | "trips_count" | "vehicle"> | null;
  order_items: OrderItem[];
  order_events: OrderEvent[];
};
