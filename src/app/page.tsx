// @ts-nocheck
"use client";

import { useEffect } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export default function Page() {
  useEffect(() => {
    // Simple intersection observer for reveal animations
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    document.querySelectorAll("section > div").forEach((el) => {
      el.classList.add(
        "transition-all",
        "duration-1000",
        "opacity-0",
        "translate-y-10",
      );
      observer.observe(el);
    });
  }, []);

  return (
    <>
      <SiteHeader active="home" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full overflow-hidden">
          {/* Hero Section */}
          <section className="relative min-h-[870px] flex items-center justify-center -mt-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-surface/80 to-surface z-10"></div>
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center scale-110"
                data-alt="A cinematic, high-end food photography shot of a dimly lit, luxury restaurant interior. Soft warm amber lighting reflects off polished dark marble tables. A chef's hand is seen plating a gourmet dish in the background with shallow depth of field. The overall mood is exclusive, nocturnal, and sophisticated with deep blacks and rich golden highlights."
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuHNFwVW3i47S434b1VmBd6dYOZUTnj1-F-JOOxZDvtxHNyFP0txAx0wTJfxIgCl7Lkg8hXZPYHGKo8RpxQlLVIfax4s8zURkGCI8XEWXI-VuhgxqPUrwEasGK8_tp2FnLftD5ETvHdN6dmcgQQuhojovWh7K8B9St1MfJZXfDadZwVpymSgMXAakYNSty6SFQ1Kdc34BAL35lDuMJzkvrQpbSKcwrQfDCiut_Vktn_ue16zhnsyFc6XJw6t3DoIc4jWhbSrvkk8i6')",
                }}
              ></div>
            </div>
            <div className="relative z-20 max-w-7xl mx-auto px-margin-desktop text-center flex flex-col items-center pt-20">
              <span className="font-label-md text-label-md text-primary uppercase tracking-[0.4em] mb-md animate-fade-in">
                Excellence Delivered
              </span>
              <h1 className="font-display-lg text-display-lg text-on-surface uppercase mb-lg max-w-4xl mix-blend-exclusion">
                Order From The Best{" "}
                <span className="text-primary">Restaurants</span> Near You
              </h1>
              <div className="w-full max-w-2xl bg-surface-container-highest/40 backdrop-blur-2xl p-sm rounded-xl shadow-2xl flex flex-col md:flex-row items-center gap-sm">
                <div className="flex-1 flex items-center gap-sm px-md w-full">
                  <span className="material-symbols-outlined text-primary">
                    location_on
                  </span>
                  <input
                    className="bg-transparent border-none outline-none text-on-surface font-body-md w-full placeholder:text-on-surface-variant/50 h-12"
                    placeholder="Enter your delivery address..."
                    type="text"
                  />
                </div>
                <a
                  href="/restaurants"
                  className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_30px_rgba(201,136,42,0.3)] text-center"
                >
                  Find Food
                </a>
              </div>
              <div className="mt-xl flex items-center gap-md">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Portrait of a smiling gourmet food critic, professional studio lighting, dark background"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSkLLxTgofmcOGoyg16t7fInsc_CSnUC-2QIfTXYjk44GO0deQLIQNF634g5SYLZgNGXpv2RS5h9EyYrZc3dmR9hti9zInq_tZosOwhmEwXOsPTMYLWkecLIaVpxV0Rhz8NUFckzQp-HmBq5X0su93zndHe-PXQem99Uubc_hyT53TXeXD6KQEvntnOEka8AV6UDSn1nWWjDU15hMWpwn_2ol2eC5DeACvJhI0r6SiLb48WZX7WJ5GLX9LxvNubg4992S3ge3oS56y"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Close up of a happy customer enjoying a luxury meal, warm cinematic lighting"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuArV1bYOlrEZbCNuFarwR4LXyZmbaFDEWI1O3NqhDAhl6bQDgF1tPzByus4Z-iyM3qfD2KC0Ut49Z33xWMqW5qtD-jqEu7Zd3fCIk9JdujU2s35VmqiQkVU0E2dCDTvfWAf0LDCEwj-K7042YHDdVGV5RnnrUaN9gXR7N6g8uDoljiM0A9hBj4vGu0XQkNJxLNryCzeT6dNKF2MA44FX0qNRWzH_JS2Ik-MWag9HGYZpaOO-DBBTb06dCYPtyxZKl4yV6gdOSi16ikA"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Professional chef in a clean white uniform, dark kitchen background"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaAIVnAUwXnlB_k8tMwoCdgJweYt6L-bRs-fEcqinJEhGQAx3dgitf7dXAYeuKI-efrJilJ2xGM6LkEmhnOFF5zowP3K_y-z3Rro_DqorpK9itK28dTANzUZHdfAbGq5p6RrYY1-Ft8QiUETW3lzxy8mYz7uTGynNaxfoRersRatOixAjRnsxAum0uOU9Hjb_MbPQyGLkSXSMsuD3LcGLPUZTiq2ZGQdiEirmLVU9wxOHnLC5PYazMhtG_FwHcgEJgEYBKGMWx0EK9"
                    />
                  </div>
                </div>
                <p className="font-body-sm text-on-surface-variant">
                  <span className="text-on-surface font-bold">12k+</span>{" "}
                  Foodies already joined
                </p>
              </div>
            </div>
            {/* Floating Decorative Element */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-xs opacity-50 animate-bounce">
              <span className="font-label-md text-[10px] uppercase tracking-widest text-on-surface-variant">
                Scroll
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent"></div>
            </div>
          </section>
          {/* How It Works */}
          <section className="py-xl bg-surface relative">
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="flex flex-col md:flex-row justify-between items-end mb-xl gap-md">
                <div className="max-w-[576px]">
                  <h2 className="font-headline-xl text-headline-xl uppercase text-on-surface mb-sm">
                    The Concierge Process
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    We've redefined delivery for the discerning palate. Simple,
                    fast, and uncompromising on quality.
                  </p>
                </div>
                <div className="hidden md:block font-display-lg text-surface-container-highest/20 select-none">
                  01-03
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                {/* Step 1 */}
                <div className="group flex flex-col gap-md p-md bg-surface-container/30 hover:bg-surface-container transition-colors rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span
                      className="material-symbols-outlined text-primary text-4xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      restaurant
                    </span>
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-surface uppercase">
                    Choose Restaurant
                  </h3>
                  <p className="font-body-md text-on-surface-variant">
                    Browse our curated selection of elite local dining
                    establishments, from Michelin-starred kitchens to hidden
                    gems.
                  </p>
                </div>
                {/* Step 2 */}
                <div className="group flex flex-col gap-md p-md bg-surface-container/30 hover:bg-surface-container transition-colors rounded-xl md:-mt-8">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span
                      className="material-symbols-outlined text-primary text-4xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      menu_book
                    </span>
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-surface uppercase">
                    Pick Your Food
                  </h3>
                  <p className="font-body-md text-on-surface-variant">
                    Select from seasonal menus optimized for transport, ensuring
                    your meal arrives exactly as the chef intended.
                  </p>
                </div>
                {/* Step 3 */}
                <div className="group flex flex-col gap-md p-md bg-surface-container/30 hover:bg-surface-container transition-colors rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span
                      className="material-symbols-outlined text-primary text-4xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      speed
                    </span>
                  </div>
                  <h3 className="font-title-lg text-title-lg text-on-surface uppercase">
                    Fast Delivery
                  </h3>
                  <p className="font-body-md text-on-surface-variant">
                    Our specialized couriers use climate-controlled transport to
                    bring the restaurant experience to your door.
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* Featured Restaurants */}
          <section className="py-xl bg-surface-container-low">
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="flex items-center justify-between mb-xl">
                <h2 className="font-headline-xl text-headline-xl uppercase text-on-surface">
                  Local Legends
                </h2>
                <a
                  className="font-label-md text-label-md text-primary uppercase border-b border-primary/30 pb-1 hover:border-primary transition-all"
                  href="/restaurants"
                >
                  View All Venues
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {/* Card 1 */}
                <div className="group bg-surface-container rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      data-alt="Gourmet sushi platter on a slate plate with artisanal soy sauce containers. Dark, atmospheric lighting with soft bokeh background. 8k resolution food photography."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuClfe3UABvDPwnOoFDtIYba2raIcBBESlwqyKvRUABb0-7qcFMOgHdmrXHB00UFQXYFTyWAMDRUunMTlZhCAYAYeBavL0RWeQzZgTdoPTj6G7YCPfFQD3FA-3GcY2GEv58QAko0-yjNlS7-nV2lRFAYueTD9jmniTRmZZnC8KMo475D9CvMvu7PuejPg6_bKV6q57idldRlBUCZSs_YneiJijhPOV4dfSq5Ui1iZ5DC7UsAwSfsmJsv5wk2B8FTt2163mbBh8q5TZ2N"
                    />
                    <div className="absolute top-md right-md bg-surface/80 backdrop-blur-md px-sm py-xs rounded font-label-md text-primary">
                      25-35 MIN
                    </div>
                  </div>
                  <div className="p-md">
                    <div className="flex justify-between items-start mb-xs">
                      <h4 className="font-title-lg text-title-lg text-on-surface group-hover:text-primary transition-colors">
                        KAIZEN OMAKASE
                      </h4>
                      <div className="flex items-center gap-xs">
                        <span
                          className="material-symbols-outlined text-primary text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-label-md text-on-surface">
                          4.9
                        </span>
                      </div>
                    </div>
                    <p className="font-body-sm text-on-surface-variant mb-md uppercase tracking-wider">
                      Japanese • Fine Dining • Seafood
                    </p>
                    <div className="pt-md border-t border-outline-variant/10 flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant">
                        DELIVERY: $5.00
                      </span>
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                        add_circle
                      </button>
                    </div>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="group bg-surface-container rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      data-alt="A thick, juicy wagyu beef burger with melted gold-standard cheese, caramelized onions, and truffle aioli on a brioche bun. Moody studio lighting, dark wood background."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR4e3ERXFsZoGEOuBG6VIYLrjBtXoLno9uflcThdMtd5MupXJFePQOa1cjyhmM-qwY-fZyl_TecSS1HU-47u7pbdlCx-u4IHM1EbsGZc11fgURDJDXr5m3rSzwUlbNk1zQ1aj6oaAFbWG30FQQug26CHAsSq6AVQm0Cw74PCozPHG-gWpyh7YiBRXjShejbo4fAfNJbbxvpAhS3WVORx_kI4y5kD4_nSVe4PHJvDdkanAIgTvyU8Uy7gYY4mMIIWbWavxQlq6lphwv"
                    />
                    <div className="absolute top-md right-md bg-surface/80 backdrop-blur-md px-sm py-xs rounded font-label-md text-primary">
                      15-25 MIN
                    </div>
                  </div>
                  <div className="p-md">
                    <div className="flex justify-between items-start mb-xs">
                      <h4 className="font-title-lg text-title-lg text-on-surface group-hover:text-primary transition-colors">
                        THE BURGER ATELIER
                      </h4>
                      <div className="flex items-center gap-xs">
                        <span
                          className="material-symbols-outlined text-primary text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-label-md text-on-surface">
                          4.7
                        </span>
                      </div>
                    </div>
                    <p className="font-body-sm text-on-surface-variant mb-md uppercase tracking-wider">
                      American • Gourmet • Burgers
                    </p>
                    <div className="pt-md border-t border-outline-variant/10 flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant">
                        DELIVERY: FREE
                      </span>
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                        add_circle
                      </button>
                    </div>
                  </div>
                </div>
                {/* Card 3 */}
                <div className="group bg-surface-container rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      data-alt="Freshly baked Neapolitan pizza with buffalo mozzarella, basil, and a perfectly charred leopard-spotted crust. Shot from an overhead angle on a marble surface with flour dustings."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIFGe3GNVbMGG8vbbaLD_xx8x4JJUqTeJmg82_Y6nsXDNPeEmqCmN-meeKC4fQNwLfRGRVbfW-n_vwYO5ylb9nJmGWq0BF1cUa-n18Ri86RQVdYpZ4GXvAlmxtIzOdR-vxZCemQ12iEjYFRapkBL4WgedFJWvwxF96EdzxL1o53A1ao4DTqyM96H6WSg56F-Fdl8eOgV_HC25zeJCQN6o_RaQyG_QS3d9zkByMjkJafOyf3vfVA16E-knwQKZeDx_fE7fG1cxwa1DH"
                    />
                    <div className="absolute top-md right-md bg-surface/80 backdrop-blur-md px-sm py-xs rounded font-label-md text-primary">
                      20-30 MIN
                    </div>
                  </div>
                  <div className="p-md">
                    <div className="flex justify-between items-start mb-xs">
                      <h4 className="font-title-lg text-title-lg text-on-surface group-hover:text-primary transition-colors">
                        PIETRO'S HEARTH
                      </h4>
                      <div className="flex items-center gap-xs">
                        <span
                          className="material-symbols-outlined text-primary text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-label-md text-on-surface">
                          4.8
                        </span>
                      </div>
                    </div>
                    <p className="font-body-sm text-on-surface-variant mb-md uppercase tracking-wider">
                      Italian • Wood Fired • Artisan
                    </p>
                    <div className="pt-md border-t border-outline-variant/10 flex items-center justify-between">
                      <span className="font-label-md text-on-surface-variant">
                        DELIVERY: $3.50
                      </span>
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                        add_circle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* App Download Section */}
          <section className="py-xl bg-surface relative overflow-hidden">
            {/* Decorative background patterns */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -left-20 -top-20 w-96 h-96 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="bg-surface-container-highest rounded-3xl p-lg md:p-xl flex flex-col md:flex-row items-center gap-xl relative overflow-hidden">
                <div className="flex-1 z-10">
                  <span className="font-label-md text-label-md text-primary uppercase tracking-widest mb-md block">
                    Mobile Exclusive
                  </span>
                  <h2 className="font-display-lg text-display-lg text-on-surface uppercase mb-md">
                    Get the Perfect <br />
                    Pickup App
                  </h2>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-[512px]">
                    Track your luxury dining orders in real-time, get exclusive
                    early access to menu drops, and manage your concierge
                    preferences from anywhere.
                  </p>
                  <div className="flex flex-wrap gap-md">
                    <button className="flex items-center gap-sm bg-surface border border-outline-variant/30 px-lg py-md rounded-xl hover:bg-surface-bright transition-colors">
                      <span className="material-symbols-outlined text-on-surface text-3xl">
                        file_download
                      </span>
                      <div className="text-left">
                        <p className="font-label-md text-[10px] text-on-surface-variant leading-none uppercase">
                          Download on the
                        </p>
                        <p className="font-title-lg text-lg text-on-surface leading-none">
                          App Store
                        </p>
                      </div>
                    </button>
                    <button className="flex items-center gap-sm bg-surface border border-outline-variant/30 px-lg py-md rounded-xl hover:bg-surface-bright transition-colors">
                      <span className="material-symbols-outlined text-on-surface text-3xl">
                        play_arrow
                      </span>
                      <div className="text-left">
                        <p className="font-label-md text-[10px] text-on-surface-variant leading-none uppercase">
                          Get it on
                        </p>
                        <p className="font-title-lg text-lg text-on-surface leading-none">
                          Google Play
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative w-full max-w-sm md:max-w-none flex justify-center">
                  <div className="relative z-10 w-64 md:w-80 aspect-[9/19] bg-surface rounded-[3rem] p-3 shadow-2xl border-4 border-outline-variant/20 overflow-hidden animate-float">
                    <div className="w-full h-full rounded-[2.5rem] bg-surface-container overflow-hidden relative">
                      <img
                        className="w-full h-full object-cover"
                        data-alt="A mockup of a mobile application interface showing a high-end food delivery tracking screen with a dark elegant UI, golden route lines on a map, and high-resolution food images. Professional app design aesthetic."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuByJyleCqS7G-vA5n6B3o-ksYIHnBQ5UwlEGYnVeqCVKqvCsDZ99RmMbIWOt__WPkU-rJgeH1dtzbz7KC9OhX73q2yj_HgXGEKkshw3ZL6jBGZaRy_psWBtKopdh_dCvxHbIMAafcaiyydU6sVjeDoR6eEtrsYGDiUOAPFj19dgJ7TKG41V1pP-ohicCurnYZ52SPBWP2unLxQ5PJMXxTZQWyCurapRKYYoflMeuE0XICem5TxI1Q73OliqUNp761cM82R1nG21KhRS"
                      />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-surface rounded-full"></div>
                    </div>
                  </div>
                  {/* Decorative shadow beneath phone */}
                  <div className="absolute bottom-[-20px] w-48 h-8 bg-black/40 blur-xl rounded-full"></div>
                </div>
              </div>
            </div>
          </section>
          {/* Newsletter / CTA */}
          <section className="py-xl bg-primary">
            <div className="max-w-7xl mx-auto px-margin-desktop">
              <div className="flex flex-col md:flex-row items-center justify-between gap-xl">
                <div className="max-w-[576px] text-center md:text-left">
                  <h2 className="font-display-lg text-headline-xl text-on-primary uppercase mb-xs">
                    Join the Inner Circle
                  </h2>
                  <p className="font-body-lg text-on-primary/80">
                    Subscribe for exclusive invites to tasting events and early
                    access to new restaurant partners.
                  </p>
                </div>
                <div className="flex w-full max-w-[448px] bg-on-primary/10 backdrop-blur-md p-xs rounded-xl">
                  <input
                    className="bg-transparent border-none outline-none text-on-primary font-body-md px-md w-full placeholder:text-on-primary/50"
                    placeholder="Your email address"
                    type="email"
                  />
                  <button className="bg-on-primary text-primary px-lg py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface hover:text-on-surface transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@keyframes float {\n    0%, 100% { transform: translateY(0px); }\n    50% { transform: translateY(-20px); }\n  }\n  .animate-float {\n    animation: float 6s ease-in-out infinite;\n  }\n  @keyframes fade-in {\n    from { opacity: 0; transform: translateY(10px); }\n    to { opacity: 1; transform: translateY(0); }\n  }\n  .animate-fade-in {\n    animation: fade-in 1s ease-out forwards;\n  }",
        }}
      />
    </>
  );
}
