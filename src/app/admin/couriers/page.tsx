import { createClient } from "@/lib/supabase/server";
import { CourierList } from "@/components/admin/CourierList";
import { env } from "@/lib/env";
import type { Courier, Vendor } from "@/lib/types/database";

export const metadata = { title: "Couriers" };

export default async function Page() {
  const supabase = await createClient();

  const [{ data: couriers }, { data: vendors }] = await Promise.all([
    supabase.from("couriers").select("*").order("is_active", { ascending: false }).order("full_name"),
    supabase.from("vendors").select("*").order("name"),
  ]);

  return (
    <CourierList
      couriers={(couriers ?? []) as Courier[]}
      vendors={(vendors ?? []) as Vendor[]}
      siteUrl={env.siteUrl}
    />
  );
}
