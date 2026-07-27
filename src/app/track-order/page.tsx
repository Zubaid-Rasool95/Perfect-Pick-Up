// @ts-nocheck
"use client";

import { useEffect } from "react";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export default function Page() {
  useEffect(() => {
    // Micro-interaction: Update progress fill based on active step logic
        // In a real app, this would be reactive to order events
        document.addEventListener('DOMContentLoaded', () => {
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
                // Simulated live movement pulse
                let intensity = 0;
                setInterval(() => {
                    intensity = Math.sin(Date.now() / 1000) * 2;
                    progressFill.style.boxShadow = `0 0 ${10 + intensity}px rgba(255, 185, 93, 0.4)`;
                }, 50);
            }
        });
  }, []);

  return (
    <>
      <SiteHeader active="" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
        {/* Header Section: Order Status & High-Level Info */}
        <section className="w-full px-margin-desktop py-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-md">
        <div className="flex flex-col gap-xs">
        <span className="font-label-md text-label-md text-primary uppercase tracking-[0.2em]">Live Tracking</span>
        <h1 className="font-display-lg text-display-lg text-on-surface uppercase">Order #PP-88291</h1>
        <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">schedule</span>
                            Estimated Arrival: 18:45 (12 mins)
                        </p>
        </div>
        <div className="flex items-center gap-sm bg-surface-container px-md py-sm rounded-lg border border-outline-variant/20">
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
        <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Driver is en route</span>
        </div>
        </div>
        </section>
        {/* Main Content: Map & Sidebar */}
        <section className="w-full px-margin-desktop pb-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Map View (Left Column) */}
        <div className="lg:col-span-8 relative group">
        <div className="w-full h-[600px] rounded-xl overflow-hidden grayscale-[0.8] contrast-[1.2] brightness-[0.7] border border-outline-variant/20 shadow-xl" data-location="Los Angeles, CA" style={{  }}>
        </div>
        {/* Floating Map Overlay Elements */}
        <div className="absolute top-md left-md flex flex-col gap-xs">
        <div className="bg-surface/90 backdrop-blur-md p-md rounded-lg border border-outline-variant/10 shadow-lg max-w-[240px]">
        <span className="font-label-md text-label-md text-primary uppercase block mb-xs">Pickup</span>
        <p className="font-body-sm text-body-sm text-on-surface">L'Artisan Brasserie</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">882 West Adams Blvd</p>
        </div>
        <div className="bg-surface/90 backdrop-blur-md p-md rounded-lg border border-outline-variant/10 shadow-lg max-w-[240px]">
        <span className="font-label-md text-label-md text-on-tertiary-fixed-variant uppercase block mb-xs text-tertiary">Dropoff</span>
        <p className="font-body-sm text-body-sm text-on-surface">Private Residence</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">412 Oakwood Ave, Apt 4B</p>
        </div>
        </div>
        </div>
        {/* Tracking Details (Right Column) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
        {/* Progress Stepper */}
        <div className="bg-surface-container p-md rounded-xl border border-outline-variant/10">
        <div className="flex flex-col gap-lg relative">
        {/* Vertical Progress Line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-outline-variant/30"></div>
        <div className="absolute left-[15px] top-4 w-[2px] bg-primary transition-all duration-1000 ease-out" id="progress-fill" style={{ height: "66%" }}></div>
        {/* Step 1 */}
        <div className="flex gap-md relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
        <span className="material-symbols-outlined text-[20px]">check</span>
        </div>
        <div className="flex flex-col">
        <span className="font-title-lg text-body-md text-on-surface">Confirmed</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">18:12</span>
        </div>
        </div>
        {/* Step 2 */}
        <div className="flex gap-md relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
        <span className="material-symbols-outlined text-[20px]">check</span>
        </div>
        <div className="flex flex-col">
        <span className="font-title-lg text-body-md text-on-surface">Preparing</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">18:25</span>
        </div>
        </div>
        {/* Step 3 (Active) */}
        <div className="flex gap-md relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_0_15px_rgba(255,185,93,0.4)]">
        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
        </div>
        <div className="flex flex-col">
        <span className="font-title-lg text-body-md text-primary">Driver Assigned</span>
        <span className="font-body-sm text-body-sm text-on-surface">En route to your location</span>
        </div>
        </div>
        {/* Step 4 */}
        <div className="flex gap-md relative z-10 opacity-40">
        <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[20px]">done_all</span>
        </div>
        <div className="flex flex-col">
        <span className="font-title-lg text-body-md text-on-surface">Delivered</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Estimated 18:45</span>
        </div>
        </div>
        </div>
        </div>
        {/* Driver Card */}
        <div className="bg-surface-container-high p-md rounded-xl border border-outline-variant/20 shadow-md">
        <div className="flex items-center gap-md mb-md">
        <img className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" data-alt="A professional, friendly-looking delivery driver portrait, warm lighting, cinematic depth of field, high-end corporate photography style, neutral background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJzay_YzY4kT5RVmImFvD2Ah98ES4DfxakCdQhcVVuo1ydCbYcFd6e2bn3ooO2UMa73ZJJwOyGcEYDzkIYIkDo0P499fa5bP8VR1okSsvDRBZjOfFH2BAze-tV0K7CuXeWiRPwGec8j1pGph3txKRPLgn617Lm-Mv_1hufm4vOlJ4SeV04q2zR5c-D8iCV1eLVwUB_JsxI8-pqRnJfhEXFQpqbKh6rTNHdMVnJLzLrBiRBOsehqyuZdTpXf5nCo8N1G_qZkZlMI78o"/>
        <div className="flex flex-col">
        <h3 className="font-title-lg text-title-lg text-on-surface">Marcus Vance</h3>
        <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-body-sm text-body-sm text-on-surface">4.9</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant ml-xs">• 1,200+ Pickups</span>
        </div>
        </div>
        </div>
        <div className="flex flex-col gap-sm">
        <button className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">call</span>
                                    Call Driver
                                </button>
        <button className="w-full bg-surface-variant text-on-surface-variant py-sm rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-outline-variant/20 transition-all flex items-center justify-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                                    Send Message
                                </button>
        </div>
        </div>
        {/* Order Summary */}
        <div className="bg-surface-container p-md rounded-xl border border-outline-variant/10">
        <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Order Summary</h4>
        <div className="flex flex-col gap-sm">
        <div className="flex justify-between items-start">
        <div className="flex flex-col">
        <span className="font-body-md text-body-md text-on-surface">Truffle Wagyu Burger</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Medium Rare, No Onions</span>
        </div>
        <span className="font-body-md text-body-md text-on-surface">$34.00</span>
        </div>
        <div className="flex justify-between items-start">
        <div className="flex flex-col">
        <span className="font-body-md text-body-md text-on-surface">Parmesan Truffle Fries</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Extra Aioli</span>
        </div>
        <span className="font-body-md text-body-md text-on-surface">$12.00</span>
        </div>
        <div className="flex justify-between items-center py-sm mt-sm border-t border-outline-variant/10">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase">Subtotal</span>
        <span className="font-body-md text-body-md text-on-surface">$46.00</span>
        </div>
        <div className="flex justify-between items-center">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase">Concierge Fee</span>
        <span className="font-body-md text-body-md text-on-surface">$8.50</span>
        </div>
        <div className="flex justify-between items-center pt-md mt-sm border-t border-primary/20">
        <span className="font-title-lg text-title-lg text-primary uppercase">Total</span>
        <span className="font-headline-lg text-headline-lg text-primary">$54.50</span>
        </div>
        </div>
        </div>
        </div>
        </div>
        </section>
        {/* Decorative background elements */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px]"></div>
        </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
