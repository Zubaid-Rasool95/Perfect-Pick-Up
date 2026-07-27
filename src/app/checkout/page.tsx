// @ts-nocheck
"use client";

import { useEffect } from "react";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export default function Page() {
  useEffect(() => {
    document.getElementById('placeOrderBtn')?.addEventListener('click', function() {
          const btn = this;
          const originalText = btn.innerHTML;
          
          // Visual feedback
          btn.disabled = true;
          btn.innerHTML = `
            <svg class="animate-spin h-6 w-6 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2">Processing...</span>
          `;
    
          // Mock completion
          setTimeout(() => {
            btn.innerHTML = `<span class="material-symbols-outlined text-[32px]">check_circle</span> Order Confirmed`;
            btn.classList.replace('bg-primary', 'bg-green-600');
            btn.classList.add('text-white');
            
            // Final transition effect
            setTimeout(() => {
              window.location.href = '/track-order';
            }, 1500);
          }, 2500);
        });
    
        // Simple interaction for input focus states
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          input.addEventListener('focus', () => {
            input.parentElement.querySelector('label')?.classList.add('text-primary');
          });
          input.addEventListener('blur', () => {
            input.parentElement.querySelector('label')?.classList.remove('text-primary');
          });
        });
  }, []);

  return (
    <>
      <SiteHeader active="" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
        {/* Content Container */}
        <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl">
        {/* Page Header & Progress */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
        <span className="font-label-md text-label-md text-primary uppercase tracking-[0.2em] mb-xs block">Secure Checkout</span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface uppercase">Review Your Order</h1>
        </div>
        <div className="flex items-center gap-sm">
        <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">1</div>
        <span className="font-label-md text-label-md text-on-surface mt-xs">Cart</span>
        </div>
        <div className="w-12 h-px bg-outline-variant mb-4"></div>
        <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">2</div>
        <span className="font-label-md text-label-md text-on-surface mt-xs">Details</span>
        </div>
        <div className="w-12 h-px bg-outline-variant mb-4 opacity-30"></div>
        <div className="flex flex-col items-center opacity-30">
        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant font-bold">3</div>
        <span className="font-label-md text-label-md text-on-surface-variant mt-xs">Success</span>
        </div>
        </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 flex flex-col gap-lg">
        {/* Delivery Address Section */}
        <section className="bg-surface-container p-md md:p-lg rounded-xl shadow-xl">
        <div className="flex items-center gap-sm mb-lg">
        <span className="material-symbols-outlined text-primary">location_on</span>
        <h2 className="font-headline-xl text-headline-xl text-on-surface uppercase">Delivery Address</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="flex flex-col gap-xs md:col-span-2">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Full Name</label>
        <input className="w-full bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg text-on-surface focus:border-primary outline-none transition-colors" placeholder="Enter your full name" type="text"/>
        </div>
        <div className="flex flex-col gap-xs md:col-span-2">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Street Address</label>
        <input className="w-full bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg text-on-surface focus:border-primary outline-none transition-colors" placeholder="123 Concierge Way, Suite 400" type="text"/>
        </div>
        <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase">City</label>
        <input className="w-full bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg text-on-surface focus:border-primary outline-none transition-colors" placeholder="Metropolis" type="text"/>
        </div>
        <div className="flex flex-col gap-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Zip Code</label>
        <input className="w-full bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg text-on-surface focus:border-primary outline-none transition-colors" placeholder="10001" type="text"/>
        </div>
        <div className="flex flex-col gap-xs md:col-span-2">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Delivery Instructions (Optional)</label>
        <textarea className="w-full bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg text-on-surface focus:border-primary outline-none transition-colors resize-none" placeholder="Gate code, floor number, or specific drop-off details..." rows="3"></textarea>
        </div>
        </div>
        </section>
        {/* Payment Method Section */}
        <section className="bg-surface-container p-md md:p-lg rounded-xl shadow-xl">
        <div className="flex items-center gap-sm mb-lg">
        <span className="material-symbols-outlined text-primary">payments</span>
        <h2 className="font-headline-xl text-headline-xl text-on-surface uppercase">Payment Method</h2>
        </div>
        <div className="flex flex-col gap-sm">
        {/* Credit Card Option */}
        <label className="group relative flex items-center justify-between p-md border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-high transition-all">
        <input defaultChecked className="hidden peer" name="payment" type="radio"/>
        <div className="flex items-center gap-md">
        <div className="w-5 h-5 rounded-full border-2 border-outline peer-checked:border-primary flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 transition-transform peer-checked:scale-100"></div>
        </div>
        <div className="flex flex-col">
        <span className="font-title-lg text-title-lg text-on-surface">Credit / Debit Card</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Visa, Mastercard, Amex</span>
        </div>
        </div>
        <div className="flex gap-xs opacity-60">
        <span className="material-symbols-outlined">credit_card</span>
        </div>
        <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
        </label>
        {/* PayPal Option */}
        <label className="group relative flex items-center justify-between p-md border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-high transition-all">
        <input className="hidden peer" name="payment" type="radio"/>
        <div className="flex items-center gap-md">
        <div className="w-5 h-5 rounded-full border-2 border-outline peer-checked:border-primary flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 transition-transform peer-checked:scale-100"></div>
        </div>
        <div className="flex flex-col">
        <span className="font-title-lg text-title-lg text-on-surface">PayPal</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Pay via your PayPal account</span>
        </div>
        </div>
        <span className="material-symbols-outlined opacity-60">account_balance_wallet</span>
        <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
        </label>
        {/* Cash on Delivery */}
        <label className="group relative flex items-center justify-between p-md border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-high transition-all">
        <input className="hidden peer" name="payment" type="radio"/>
        <div className="flex items-center gap-md">
        <div className="w-5 h-5 rounded-full border-2 border-outline peer-checked:border-primary flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 transition-transform peer-checked:scale-100"></div>
        </div>
        <div className="flex flex-col">
        <span className="font-title-lg text-title-lg text-on-surface">Cash on Delivery</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Pay when your order arrives</span>
        </div>
        </div>
        <span className="material-symbols-outlined opacity-60">handshake</span>
        <div className="absolute inset-0 rounded-lg border-2 border-primary opacity-0 peer-checked:opacity-100 pointer-events-none"></div>
        </label>
        </div>
        {/* Promo Code */}
        <div className="mt-lg pt-lg border-t border-outline-variant/30">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs block">Promo Code</label>
        <div className="flex gap-sm">
        <input className="flex-1 bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg text-on-surface focus:border-primary outline-none uppercase tracking-widest font-body-md" placeholder="ENTER CODE" type="text"/>
        <button className="px-lg bg-surface-variant text-on-surface-variant font-label-md text-label-md rounded-lg uppercase hover:text-on-surface hover:bg-outline-variant transition-all">Apply</button>
        </div>
        </div>
        </section>
        {/* Secure Badges */}
        <div className="flex flex-wrap items-center justify-center gap-lg opacity-40 py-md grayscale">
        <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-[20px]">verified_user</span>
        <span className="font-label-md text-label-md uppercase tracking-tighter">PCI Compliant</span>
        </div>
        <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-[20px]">lock</span>
        <span className="font-label-md text-label-md uppercase tracking-tighter">256-Bit SSL</span>
        </div>
        <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-[20px]">shield</span>
        <span className="font-label-md text-label-md uppercase tracking-tighter">Fraud Protection</span>
        </div>
        </div>
        </div>
        {/* Right Column: Sticky Summary */}
        <div className="lg:col-span-5">
        <div className="sticky top-24 flex flex-col gap-md">
        <div className="bg-surface-container-high rounded-xl overflow-hidden shadow-2xl border border-outline-variant/20">
        {/* Header */}
        <div className="bg-surface-container-highest p-md border-b border-outline-variant/30">
        <h3 className="font-headline-lg text-headline-lg text-on-surface uppercase">Order Summary</h3>
        </div>
        {/* Items Preview (Scrollable) */}
        <div className="p-md flex flex-col gap-md max-h-[300px] overflow-y-auto">
        <div className="flex gap-md items-center">
        <div className="w-16 h-16 rounded-lg bg-cover bg-center" data-alt="A macro overhead shot of a gourmet wagyu beef burger with gold leaf flakes, caramelized onions, and melted artisan cheese on a brioche bun, presented on a dark slate background with warm moody lighting." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCNXNCznMz10kB3FtkvMMiCBRrkBC-w8ZFXdTRKluvUBHQ77De_DTGWDuYU93f11y3WJM8UN8AaH5BwnYCQHlT8W7kpf0dJqaCaclo8XXZvln212o14XUJC43rUjfjBYmOjqRtxBwtvI3QMmiLVMZV4BuajANykxI17vOcsyHXznU-uIHrP0yQ9f089wWJ_7ptFpNILg14zoZM1MPgKdMjhRdFHA00NjD6BMS0KL3xpHlCBE_gYcVqI6qg1UD2FscUGco30jCc07ruf')" }}></div>
        <div className="flex-1">
        <h4 className="font-body-md text-body-md text-on-surface font-bold">Imperial Wagyu Burger</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Quantity: 1</p>
        </div>
        <span className="font-body-md text-body-md text-on-surface">$34.00</span>
        </div>
        <div className="flex gap-md items-center">
        <div className="w-16 h-16 rounded-lg bg-cover bg-center" data-alt="A close-up shot of a plate of truffle-infused parmesan fries, garnished with fresh herbs and a small side of garlic aioli. The lighting is sophisticated and warm, accentuating the golden textures of the fries against a dark wooden table." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD42-KIPUWIKg-R6ASbrDr7KF6KlPwoTahzalX1u7hZ0-T_ML4g4xkfHrpS9Qwl0vL4PcW-KMHBqzxnh6WVK3C1yEVtgtWPYoQ3HOXt_zbWk2ixxQGKQifgAcS29qs3pCE19MylJmlAa3iPPQSJ5qUpnlo8tX1dfy7Lms_MLOIYIobJwskOaFAYL3loUyHioR260zj0ND4yASEifjV31pC9UbtzInBVcNMjliCUTynLAlm_P6YyXMJL9xuKJxXwKge3UWirxyTubNFY')" }}></div>
        <div className="flex-1">
        <h4 className="font-body-md text-body-md text-on-surface font-bold">Truffle Parmesan Fries</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Quantity: 2</p>
        </div>
        <span className="font-body-md text-body-md text-on-surface">$24.00</span>
        </div>
        </div>
        {/* Financials */}
        <div className="p-md bg-surface-container-low border-t border-outline-variant/30 flex flex-col gap-sm">
        <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
        <span>Subtotal</span>
        <span>$58.00</span>
        </div>
        <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
        <span>Priority Delivery</span>
        <span>$8.50</span>
        </div>
        <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
        <span>Service Fee</span>
        <span>$4.20</span>
        </div>
        <div className="flex justify-between font-body-md text-body-md text-primary mt-sm pt-sm border-t border-outline-variant/30">
        <span className="font-bold uppercase tracking-widest">Total</span>
        <span className="text-headline-xl font-headline-xl">$70.70</span>
        </div>
        </div>
        {/* CTA */}
        <div className="p-md">
        <button className="w-full bg-primary text-on-primary py-md rounded-lg font-headline-xl text-headline-xl uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm" id="placeOrderBtn">
                        Place Order
                        <span className="material-symbols-outlined">chevron_right</span>
        </button>
        <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-sm">
                        By clicking "Place Order" you agree to our <a className="underline hover:text-primary" href="#">Terms of Service</a>.
                      </p>
        </div>
        </div>
        {/* Trust Box */}
        <div className="bg-primary/5 rounded-xl p-md border border-primary/20 flex gap-md items-start">
        <span className="material-symbols-outlined text-primary">verified</span>
        <div className="flex flex-col gap-xs">
        <span className="font-label-md text-label-md text-primary uppercase">The Perfect Promise</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Your order is prepared with culinary excellence and delivered by professional couriers. Full refund if not satisfied.</p>
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>
        {/* Subtle Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[40%] -right-[5%] w-[30%] h-[30%] bg-tertiary/5 rounded-full blur-[100px]" style={{ animation: "float 15s infinite alternate ease-in-out" }}></div>
        </div>


        </div>
      </main>
      <SiteFooter />
      <style dangerouslySetInnerHTML={{ __html: "@keyframes float {\n      from { transform: translate(0, 0); }\n      to { transform: translate(-40px, 60px); }\n    }\n    \n    .peer:checked ~ .scale-100 {\n      transform: scale(1);\n    }" }} />
    </>
  );
}
