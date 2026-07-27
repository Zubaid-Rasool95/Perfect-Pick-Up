// @ts-nocheck
"use client";

import { useEffect } from "react";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export default function Page() {
  useEffect(() => {
    const tabs = document.querySelectorAll('.menu-tab');
                
                // Handle Tab Selection
                tabs.forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        tabs.forEach(t => {
                            t.classList.remove('border-primary', 'text-primary');
                            t.classList.add('border-transparent', 'text-on-surface-variant');
                        });
                        tab.classList.add('border-primary', 'text-primary');
                        tab.classList.remove('border-transparent', 'text-on-surface-variant');
                    });
                });
    
                // Smooth Scroll for tabs
                tabs.forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        document.querySelector(this.getAttribute('href')).scrollIntoView({
                            behavior: 'smooth'
                        });
                    });
                });
    
                // Add to Cart Animation
                const addButtons = document.querySelectorAll('.add-to-cart');
                addButtons.forEach(btn => {
                    btn.addEventListener('click', function() {
                        const originalText = this.innerHTML;
                        this.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Added';
                        this.classList.replace('bg-primary', 'bg-tertiary-container');
                        this.classList.replace('text-on-primary', 'text-on-tertiary');
                        
                        setTimeout(() => {
                            this.innerHTML = originalText;
                            this.classList.replace('bg-tertiary-container', 'bg-primary');
                            this.classList.replace('text-on-tertiary', 'text-on-primary');
                        }, 2000);
                    });
                });
    
                // Parallax Hero Effect
                window.addEventListener('scroll', () => {
                    const scrolled = window.pageYOffset;
                    const heroBg = document.querySelector('[style*="background-image"]');
                    if (heroBg) {
                        heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.05)`;
                    }
                });
  }, []);

  return (
    <>
      <SiteHeader active="restaurants" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
        {/* Hero Banner with Negative Margin to Bleed Under Header */}
        <section className="relative w-full h-[614px] -mt-20 overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
        <div className="absolute inset-0 scale-105" data-alt="Cinematic, high-end food photography of a dimly lit luxury restaurant interior with warm golden lighting, charcoal wood textures, and a focused shot of a signature wagyu burger on a marble countertop. The atmosphere is sophisticated and moody, featuring the Perfect Pickup gold and deep black color palette." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCylTs9162iwsfvXi0Qc-9cfDFognrJmuMHtapPWVibtu_l27JYMnmUnisiCwN1iks79hEsRezYuv6ClLy0ti91sKDfElxonmVEN9Ay0BwcYU1kYj0L696Jr3VPBSIVClskYkd1Li9o4C9B3ABuHsVQOXYLEWwe3bDAwblGXxW0b7rxbPN-UQ_x8ur2Cf_z1AraRM8dmlB8k6UwpQxYKQcPrAIqI5N6ktNA8lfedu5rLTfwBZcpMjF6_eV-SoFD4yRHu3yZnnK7iAPy')" }}></div>
        <div className="relative z-20 max-w-7xl mx-auto px-margin-desktop pb-xl w-full">
        <div className="flex flex-col gap-md max-w-3xl">
        <div className="flex flex-wrap gap-sm items-center">
        <span className="bg-primary text-on-primary font-label-md text-label-md px-md py-1 rounded-full uppercase tracking-tighter">Premier Partner</span>
        <div className="flex items-center gap-xs text-primary">
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-title-lg text-title-lg">4.9</span>
        <span className="text-on-surface-variant font-body-sm text-body-sm ml-1">(250+ Reviews)</span>
        </div>
        </div>
        <h1 className="font-display-lg text-display-lg text-on-surface uppercase leading-none">L'Artiste Gastronomique</h1>
        <div className="flex flex-wrap gap-lg items-center">
        <div className="flex items-center gap-base">
        <span className="material-symbols-outlined text-primary-fixed-dim">schedule</span>
        <span className="font-body-md text-body-md text-on-surface-variant">25–35 MINS</span>
        </div>
        <div className="flex items-center gap-base">
        <span className="material-symbols-outlined text-primary-fixed-dim">shopping_bag</span>
        <span className="font-body-md text-body-md text-on-surface-variant">MIN ORDER $40.00</span>
        </div>
        <div className="flex items-center gap-base">
        <span className="material-symbols-outlined text-primary-fixed-dim">restaurant_menu</span>
        <span className="font-body-md text-body-md text-on-surface-variant">FRENCH FUSION</span>
        </div>
        </div>
        </div>
        </div>
        </section>
        {/* Sticky Navigation */}
        <nav className="sticky top-20 z-40 bg-surface/95 backdrop-blur-md border-b border-outline-variant/10" id="menu-nav">
        <div className="max-w-7xl mx-auto px-margin-desktop flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex gap-lg">
        <a className="menu-tab py-md border-b-2 border-primary text-primary font-label-md uppercase tracking-widest whitespace-nowrap" href="#starters">Starters</a>
        <a className="menu-tab py-md border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all font-label-md uppercase tracking-widest whitespace-nowrap" href="#mains">Mains</a>
        <a className="menu-tab py-md border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all font-label-md uppercase tracking-widest whitespace-nowrap" href="#burgers">Signature Burgers</a>
        <a className="menu-tab py-md border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all font-label-md uppercase tracking-widest whitespace-nowrap" href="#drinks">Artisanal Drinks</a>
        <a className="menu-tab py-md border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all font-label-md uppercase tracking-widest whitespace-nowrap" href="#desserts">Desserts</a>
        </div>
        <div className="hidden md:flex items-center gap-base">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input className="bg-transparent border-none focus:ring-0 text-body-sm text-on-surface placeholder:text-outline/50 w-48" placeholder="Search menu..." type="text"/>
        </div>
        </div>
        </nav>
        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-margin-desktop py-xl grid grid-cols-1 lg:grid-cols-10 gap-gutter relative">
        {/* Menu Items List (Left 70%) */}
        <div className="lg:col-span-7 flex flex-col gap-xl">
        {/* Category: Starters */}
        <section className="scroll-mt-48" id="starters">
        <h2 className="font-headline-xl text-headline-xl text-on-surface uppercase mb-lg tracking-widest">Starters <span className="text-primary opacity-50 ml-2">/ 01</span></h2>
        <div className="grid grid-cols-1 gap-md">
        {/* Item 1 */}
        <div className="group flex flex-col md:flex-row gap-md p-md bg-surface-container rounded-xl transition-all hover:bg-surface-container-high shadow-sm">
        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Close up of pan-seared scallops with a vibrant saffron foam and micro-greens, plated on a dark slate dish. Fine dining presentation with warm dramatic lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB90N-9U9Xo-5a6Iz2iWS58mKlhGC2_3dgiFdFmbrtHHgJjYmirFnmbWG8dnvziBATyvwRCPW7tcwzmlHA4-9dbJ6hTQ3KuyRAF1paaRY3Hblqpvk-Id9aLTzIKisRBoC9CnkXeSs-tWxPzfSv1_TLMWyZZB2FF28yh5ekPjN9sJzZkpeG8VT8wq08SKZ6TE1j1I9WqIaOb1jzO7H3OCXTqrJIlcn6IXkr1OPaF0YPcbR5GLLGLf7dupuPj3ozPtgUCdeJKCQfEVIRt"/>
        </div>
        <div className="flex flex-col justify-between flex-grow">
        <div>
        <div className="flex justify-between items-start">
        <h3 className="font-title-lg text-title-lg text-on-surface">Saffron Seared Scallops</h3>
        <span className="font-headline-lg text-headline-lg text-primary">$28.00</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs line-clamp-2">Hand-dived Atlantic scallops, infused with premium Persian saffron foam, served with a citrus micro-salad.</p>
        </div>
        <div className="flex items-center justify-between mt-md">
        <span className="font-label-md text-label-md text-primary bg-primary/10 px-sm py-1 rounded uppercase tracking-tighter">Chef's Choice</span>
        <button className="add-to-cart bg-primary text-on-primary px-lg py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">add</span> Add
                                        </button>
        </div>
        </div>
        </div>
        {/* Item 2 */}
        <div className="group flex flex-col md:flex-row gap-md p-md bg-surface-container rounded-xl transition-all hover:bg-surface-container-high shadow-sm">
        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A trio of Wagyu beef sliders on toasted brioche buns, topped with caramelized onions and aged gruyere cheese. Rustic dark wood background, moody lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUb6ZjMzXVRV7Q71p6IJSfCwLWbAK_2fKanWfJrHY3ZlkZjxRpXhzHRhDfFIIAu7NbHfaQpFJ62m6Sx0WUQhz0gUi1p2s8PmRQRKx4plD6OgpeBicbmadsffZGHZG4M_fZtmQhvSXNGSn9RnD5Agdp-9PpJU3luDHghrxyzCuj4Gl_ivnhhawNkhXImo4thvJiVjrnMkq5fgYYNLWvX04Y_86BXqdLhMSMRoVQLR8xyEam-_5fzwu3IwexJks9LWKn4aeBukkXQRFJ"/>
        </div>
        <div className="flex flex-col justify-between flex-grow">
        <div>
        <div className="flex justify-between items-start">
        <h3 className="font-title-lg text-title-lg text-on-surface">Petite Wagyu Sliders</h3>
        <span className="font-headline-lg text-headline-lg text-primary">$22.00</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs line-clamp-2">Three mini A5 Wagyu patties, aged gruyère, balsamico onions, on toasted artisanal brioche.</p>
        </div>
        <div className="flex items-center justify-end mt-md">
        <button className="add-to-cart bg-primary text-on-primary px-lg py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">add</span> Add
                                        </button>
        </div>
        </div>
        </div>
        </div>
        </section>
        {/* Category: Mains */}
        <section className="scroll-mt-48" id="mains">
        <h2 className="font-headline-xl text-headline-xl text-on-surface uppercase mb-lg tracking-widest">Mains <span className="text-primary opacity-50 ml-2">/ 02</span></h2>
        <div className="grid grid-cols-1 gap-md">
        {/* Item 3 */}
        <div className="group flex flex-col md:flex-row gap-md p-md bg-surface-container rounded-xl transition-all hover:bg-surface-container-high shadow-sm">
        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Grilled Alaskan Halibut over a bed of lemon-infused risotto, garnished with fresh herbs. The plate is white porcelain against a dark table. Soft bokeh background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcPcUg0kvLKjrBT-BQePGn5PaMsfcWRkdNaVXxAdPpD5_w0fGevFlrbJblEcRxMIto9K8iUEEpR3giiNssfG4ePf7Qc5xyDJ95ZoBm-jJ0Y4ZILNVqmO6byyAhe23dEhQhVX540jPx4yr61amTTMqWjzY2k0wtlom-HB--lmE9JXE_sFOysygtrJjSQvuMjLAUS7Gz7txjxyHM93Ywb4NvQXk9EWK5lr2O5IWQZSAhSDbBTJXe__UXRvTWV8njLFVrG5VydNppMaqB"/>
        </div>
        <div className="flex flex-col justify-between flex-grow">
        <div>
        <div className="flex justify-between items-start">
        <h3 className="font-title-lg text-title-lg text-on-surface">Citrus Alaskan Halibut</h3>
        <span className="font-headline-lg text-headline-lg text-primary">$45.00</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs line-clamp-2">Wild-caught halibut, lemon-verbena risotto, charred seasonal asparagus, and a white wine reductions.</p>
        </div>
        <div className="flex items-center justify-between mt-md">
        <div className="flex gap-xs">
        <span className="material-symbols-outlined text-primary-fixed-dim" title="Gluten Free">eco</span>
        <span className="material-symbols-outlined text-primary-fixed-dim" title="High Protein">fitness_center</span>
        </div>
        <button className="add-to-cart bg-primary text-on-primary px-lg py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-xs">
        <span className="material-symbols-outlined text-[18px]">add</span> Add
                                        </button>
        </div>
        </div>
        </div>
        </div>
        </section>
        </div>
        {/* Sticky Cart Summary (Right 30%) */}
        <aside className="lg:col-span-3">
        <div className="sticky top-40 flex flex-col gap-md bg-surface-container-highest p-md rounded-xl shadow-xl border border-outline-variant/10">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-md">
        <h3 className="font-headline-lg text-headline-lg text-on-surface uppercase">Your Order</h3>
        <span className="bg-primary/20 text-primary px-sm py-1 rounded-full text-label-md font-label-md">3 ITEMS</span>
        </div>
        {/* Cart Items */}
        <div className="flex flex-col gap-md py-md max-h-[409px] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center group">
        <div className="flex flex-col">
        <span className="font-body-md text-on-surface">Saffron Scallops</span>
        <span className="font-body-sm text-on-surface-variant">Qty: 1</span>
        </div>
        <div className="flex items-center gap-md">
        <span className="font-body-md text-on-surface">$28.00</span>
        <span className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer text-body-sm transition-colors">delete</span>
        </div>
        </div>
        <div className="flex justify-between items-center group">
        <div className="flex flex-col">
        <span className="font-body-md text-on-surface">Wagyu Sliders</span>
        <span className="font-body-sm text-on-surface-variant">Qty: 2</span>
        </div>
        <div className="flex items-center gap-md">
        <span className="font-body-md text-on-surface">$44.00</span>
        <span className="material-symbols-outlined text-on-surface-variant hover:text-error cursor-pointer text-body-sm transition-colors">delete</span>
        </div>
        </div>
        </div>
        {/* Totals */}
        <div className="flex flex-col gap-sm border-t border-outline-variant/20 pt-md">
        <div className="flex justify-between font-body-sm text-on-surface-variant">
        <span>Subtotal</span>
        <span>$72.00</span>
        </div>
        <div className="flex justify-between font-body-sm text-on-surface-variant">
        <span>Delivery Fee</span>
        <span>$4.99</span>
        </div>
        <div className="flex justify-between font-body-sm text-on-surface-variant">
        <span>Service Fee</span>
        <span>$2.50</span>
        </div>
        <div className="flex justify-between mt-sm text-on-surface font-title-lg text-title-lg">
        <span>Total</span>
        <span className="text-primary">$79.49</span>
        </div>
        </div>
<a href="/checkout" className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all shadow-lg hover:shadow-primary/20 text-center">
                    Proceed to Checkout
                </a>
        <p className="text-center font-body-sm text-on-surface-variant italic">Estimated delivery in 35 mins</p>
        </div>
        </aside>
        </div>
        {/* Reviews Section */}
        <section className="w-full bg-surface-container-low py-xl border-t border-outline-variant/5">
        <div className="max-w-7xl mx-auto px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-md">
        <div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-widest">Guest Experiences</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">What our discerning diners are saying.</p>
        </div>
        <div className="flex gap-md">
        <button className="p-base border border-outline-variant rounded-lg text-on-surface hover:bg-surface-variant transition-colors">
        <span className="material-symbols-outlined">filter_list</span>
        </button>
        <button className="bg-primary-container text-on-primary-container px-lg py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest">
                                Leave Review
                            </button>
        </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Review Card 1 */}
        <div className="bg-surface p-lg rounded-xl flex flex-col gap-md border border-outline-variant/10">
        <div className="flex justify-between items-center">
        <div className="flex gap-xs text-primary">
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </div>
        <span className="text-on-surface-variant font-label-md text-[10px] uppercase">2 days ago</span>
        </div>
        <p className="font-body-md text-on-surface italic">"The Scallops were transcendent. Perfect Pickup delivered them still perfectly warm and the foam hadn't even collapsed. Exceptional service."</p>
        <div className="flex items-center gap-base">
        <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
        <img className="w-full h-full object-cover" data-alt="Portrait of an elegant middle-aged man in a charcoal suit, high contrast, warm studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTnC054VcQ5Vfu8QBsEeeCASDpkmGEbHhVWmsVev_SvksIc9dtxTCkFTFy-0SThWpw0_Egc0OrRHItEMBfd10yM09WdC0v5NC7BhY-tsPvB9umBuAvstr8x8OSIqRV-tbB-wBKzS6u-DOqE6HdR0ZGvpqaC_hV_F8aR-wooT9FwLY4zkv7cDHEnT3z6Fu9kYjgOxcoL_1ec_TX7zLjAScUY_qy6lkPQTQ113P3o1PQ9aqcsfWThnazCQWip684dgUHv0hrJrBdtGhF"/>
        </div>
        <span className="font-title-lg text-on-surface text-body-md">Alexander V.</span>
        </div>
        </div>
        {/* Review Card 2 */}
        <div className="bg-surface p-lg rounded-xl flex flex-col gap-md border border-outline-variant/10">
        <div className="flex justify-between items-center">
        <div className="flex gap-xs text-primary">
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]">star</span>
        </div>
        <span className="text-on-surface-variant font-label-md text-[10px] uppercase">1 week ago</span>
        </div>
        <p className="font-body-md text-on-surface italic">"Consistently the best French fusion in the city. The packaging for delivery is high-end, preserving the restaurant experience at home."</p>
        <div className="flex items-center gap-base">
        <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
        <img className="w-full h-full object-cover" data-alt="Portrait of a sophisticated woman with modern eyewear, minimal aesthetic, cinematic lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7q8rO9YbCfrsdIyb64SJQGyINx9EPT1R3-w6jDFMWpiBxtySJE-qLBD9i2FFXTmVzxhlcwNlEFvzGHqZac2A9C5Q-PAYVKTAtRsu53QkRqqwCbRXIpcfehxbGQvLizqI05pOQsyWmYY8dJUrxlc3bjAsfMmC8H2dlVGqIdQBq6bRWi4Zu-Jb1TBrzMllG01F2RqEIdNnf0cyZuMcyEcAMHlVHLNx0wrPlEnAT1JVZ3SJxYT9eje9Hod0yHeEZGzqiZ9n9x0yaadcH"/>
        </div>
        <span className="font-title-lg text-on-surface text-body-md">Elena Rose</span>
        </div>
        </div>
        {/* Review Card 3 */}
        <div className="bg-surface p-lg rounded-xl flex flex-col gap-md border border-outline-variant/10">
        <div className="flex justify-between items-center">
        <div className="flex gap-xs text-primary">
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </div>
        <span className="text-on-surface-variant font-label-md text-[10px] uppercase">3 weeks ago</span>
        </div>
        <p className="font-body-md text-on-surface italic">"A5 Wagyu Sliders are a must-try. The quality of the meat is unparalleled for a pickup service. 10/10 recommendation."</p>
        <div className="flex items-center gap-base">
        <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
        <img className="w-full h-full object-cover" data-alt="Portrait of a young creative professional with a minimalist watch, dark background, luxury lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHif4AVCZKJ3BeAF1s_0OXzZgltCNW3CAgowOe-C_cPjXZ1C7DUF8LKrdT1W04u4i0ggEGjNyDUeRWOogCZ2lkrxAHygict3wB5PlUjUFzP0gYgEk0c0Rm8z2asmMWvMJ3adN_w4a25o01TgeLiupWhPzmLXuKEbPtKisJMsohVVD715nSO7hOer1M-_r3ntTpkQvqqgwhH1SE5ZCDmc9TNEwOg-PVshDLGcUdETZNVctL7fk9xRJgIssvZ_MlD9f_i8-BKzcnPOAP"/>
        </div>
        <span className="font-title-lg text-on-surface text-body-md">Marcus K.</span>
        </div>
        </div>
        </div>
        </div>
        </section>
        {/* Micro-interactions Script */}

        </div>
      </main>
      <SiteFooter />
    </>
  );
}
