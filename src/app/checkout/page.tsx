import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/lib/types/database";

export const metadata: Metadata = { title: "Checkout" };

export default async function Page() {
  const user = await requireUser("/checkout");

  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="w-full pt-20 bg-surface min-h-screen">
        <section className="px-margin-mobile md:px-margin-desktop py-lg">
          <div className="max-w-7xl mx-auto flex flex-col gap-xs">
            <span className="font-label-md text-label-md text-primary uppercase tracking-[0.3em]">
              Final Step
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase">
              Checkout
            </h1>
          </div>
        </section>

        <section className="px-margin-mobile md:px-margin-desktop pb-xl">
          <div className="max-w-7xl mx-auto">
            <CheckoutForm addresses={(addresses ?? []) as Address[]} />
          </div>
        </section>

        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px]" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
