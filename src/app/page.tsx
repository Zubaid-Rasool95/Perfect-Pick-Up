import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VendorCard } from "@/components/vendors/VendorCard";
import { listFeaturedVendors } from "@/lib/data/vendors";

export default async function Page() {
  const featured = await listFeaturedVendors(3);

  return (
    <>
      <SiteHeader active="home" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full overflow-hidden">
          {/* Hero */}
          <section className="relative min-h-[720px] md:min-h-[870px] flex items-center justify-center -mt-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/80 to-surface z-10" />
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center scale-110"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuHNFwVW3i47S434b1VmBd6dYOZUTnj1-F-JOOxZDvtxHNyFP0txAx0wTJfxIgCl7Lkg8hXZPYHGKo8RpxQlLVIfax4s8zURkGCI8XEWXI-VuhgxqPUrwEasGK8_tp2FnLftD5ETvHdN6dmcgQQuhojovWh7K8B9St1MfJZXfDadZwVpymSgMXAakYNSty6SFQ1Kdc34BAL35lDuMJzkvrQpbSKcwrQfDCiut_Vktn_ue16zhnsyFc6XJw6t3DoIc4jWhbSrvkk8i6')",
                }}
              />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop text-center flex flex-col items-center pt-20">
              <span className="font-label-md text-label-md text-primary uppercase tracking-[0.4em] mb-md animate-fade-in">
                Excellence Delivered
              </span>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase mb-lg max-w-4xl">
                Order From The Best <span className="text-primary">Restaurants</span> Near You
              </h1>

              {/* Real search — lands on the directory with the query applied. */}
              <form
                action="/restaurants"
                method="get"
                className="w-full max-w-2xl bg-surface-container-highest/40 backdrop-blur-2xl p-sm rounded-xl shadow-2xl flex flex-col md:flex-row items-center gap-sm"
              >
                <div className="flex-1 flex items-center gap-sm px-md w-full">
                  <span className="material-symbols-outlined text-primary">search</span>
                  <label className="sr-only" htmlFor="hero-search">
                    Search restaurants
                  </label>
                  <input
                    id="hero-search"
                    name="q"
                    type="search"
                    className="bg-transparent border-none outline-none text-on-surface font-body-md w-full placeholder:text-on-surface-variant/50 h-12"
                    placeholder="Search a restaurant, cuisine, or dish…"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_30px_rgba(201,136,42,0.3)] text-center"
                >
                  Find Food
                </button>
              </form>

              <p className="mt-xl font-body-sm text-body-sm text-on-surface-variant">
                <span className="text-on-surface font-bold">{featured.length > 0 ? "Live" : "Opening soon"}</span>{" "}
                — order, then watch your courier the whole way.
              </p>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-xs opacity-50 animate-bounce">
              <span className="font-label-md text-[10px] uppercase tracking-widest text-on-surface-variant">
                Scroll
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works" className="py-xl bg-surface relative scroll-mt-24">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
                <div className="max-w-[576px]">
                  <h2 className="font-headline-xl text-headline-xl uppercase text-on-surface mb-sm">
                    The Concierge Process
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    We&apos;ve redefined pick up for the discerning palate. Simple, fast, and
                    uncompromising on quality.
                  </p>
                </div>
                <div className="hidden md:block font-display-lg text-display-lg text-surface-container-highest/20 select-none">
                  01-03
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                <Step
                  symbol="restaurant"
                  title="Choose Restaurant"
                  body="Browse our curated selection of elite local dining establishments, from Michelin-starred kitchens to hidden gems."
                />
                <Step
                  symbol="menu_book"
                  title="Pick Your Food"
                  body="Select from seasonal menus optimised for transport, ensuring your meal arrives exactly as the chef intended."
                  raised
                />
                <Step
                  symbol="my_location"
                  title="Track Every Metre"
                  body="Your courier's GPS streams live to your screen the moment they collect. No guessing, no vague windows."
                />
              </div>
            </div>
          </section>

          {/* Featured restaurants, straight from the database */}
          <section className="py-xl bg-surface-container-low">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex items-center justify-between gap-md mb-xl">
                <h2 className="font-headline-xl text-headline-xl uppercase text-on-surface">
                  Local Legends
                </h2>
                <Link
                  href="/restaurants"
                  className="font-label-md text-label-md text-primary uppercase border-b border-primary/30 pb-1 hover:border-primary transition-all whitespace-nowrap"
                >
                  View All Venues
                </Link>
              </div>

              {featured.length === 0 ? (
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No restaurants have been published yet. If you&apos;re an administrator, add your
                  first one from the{" "}
                  <Link href="/admin/vendors/new" className="text-primary hover:underline">
                    admin console
                  </Link>
                  .
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {featured.map((vendor) => (
                    <VendorCard key={vendor.id} vendor={vendor} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Tracking showcase */}
          <section className="py-xl bg-surface relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-96 h-96 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="bg-surface-container-highest rounded-3xl p-lg md:p-xl flex flex-col md:flex-row items-center gap-xl relative overflow-hidden">
                <div className="flex-1 z-10">
                  <span className="font-label-md text-label-md text-primary uppercase tracking-widest mb-md block">
                    Live GPS
                  </span>
                  <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase mb-md">
                    Watch It <br />
                    Come To You
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-[512px]">
                    The moment your courier collects the bag, their position streams to your
                    screen — a moving marker, a live distance, and an ETA that updates itself.
                  </p>
                  <div className="flex flex-wrap gap-md">
                    <Link
                      href="/restaurants"
                      className="bg-primary text-on-primary px-lg py-md rounded-xl font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                      Start an Order
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-sm bg-surface border border-outline-variant/30 px-lg py-md rounded-xl hover:bg-surface-bright transition-colors font-label-md text-label-md uppercase tracking-widest text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                      Track an Order
                    </Link>
                  </div>
                </div>

                <div className="flex-1 relative w-full max-w-sm md:max-w-none flex justify-center">
                  <div className="relative z-10 w-64 md:w-80 aspect-[9/19] bg-surface rounded-[3rem] p-3 shadow-2xl border-4 border-outline-variant/20 overflow-hidden animate-float">
                    <div className="w-full h-full rounded-[2.5rem] bg-surface-container overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuByJyleCqS7G-vA5n6B3o-ksYIHnBQ5UwlEGYnVeqCVKqvCsDZ99RmMbIWOt__WPkU-rJgeH1dtzbz7KC9OhX73q2yj_HgXGEKkshw3ZL6jBGZaRy_psWBtKopdh_dCvxHbIMAafcaiyydU6sVjeDoR6eEtrsYGDiUOAPFj19dgJ7TKG41V1pP-ohicCurnYZ52SPBWP2unLxQ5PJMXxTZQWyCurapRKYYoflMeuE0XICem5TxI1Q73OliqUNp761cM82R1nG21KhRS"
                      />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-surface rounded-full" />
                    </div>
                  </div>
                  <div className="absolute bottom-[-20px] w-48 h-8 bg-black/40 blur-xl rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="contact" className="py-xl bg-primary scroll-mt-24">
            <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex flex-col md:flex-row items-center justify-between gap-xl">
                <div className="max-w-[576px] text-center md:text-left">
                  <h2 className="font-display-lg text-headline-xl text-on-primary uppercase mb-xs">
                    Join the Inner Circle
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-primary/80">
                    Create an account for invites to tasting events and early access to new
                    restaurant partners.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="bg-on-primary text-primary px-xl py-md rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface hover:text-on-surface transition-all whitespace-nowrap"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Step({
  symbol,
  title,
  body,
  raised = false,
}: {
  symbol: string;
  title: string;
  body: string;
  raised?: boolean;
}) {
  return (
    <div
      className={`group flex flex-col gap-md p-md bg-surface-container/30 hover:bg-surface-container transition-colors rounded-xl ${
        raised ? "md:-mt-8" : ""
      }`}
    >
      <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <span
          className="material-symbols-outlined text-primary text-4xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {symbol}
        </span>
      </div>
      <h3 className="font-title-lg text-title-lg text-on-surface uppercase">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant">{body}</p>
    </div>
  );
}
