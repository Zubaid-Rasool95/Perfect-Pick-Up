// @ts-nocheck
"use client";

import { useEffect } from "react";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export default function Page() {
  useEffect(() => {
    // Subtle interaction for filter chips
            document.querySelectorAll('.rounded-full').forEach(chip => {
                chip.addEventListener('click', function() {
                    // Remove active class from all
                    document.querySelectorAll('.rounded-full').forEach(c => {
                        c.classList.remove('bg-primary', 'text-on-primary');
                        c.classList.add('bg-surface-container-high', 'text-on-surface-variant');
                    });
                    // Add active class to clicked
                    this.classList.remove('bg-surface-container-high', 'text-on-surface-variant');
                    this.classList.add('bg-primary', 'text-on-primary');
                });
            });
    
            // Hover effect for pagination
            const paginationBtns = document.querySelectorAll('.md\\:flex button');
            paginationBtns.forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    if(!btn.classList.contains('bg-primary')) {
                        btn.style.transform = 'translateY(-2px)';
                    }
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                });
            });
  }, []);

  return (
    <>
      <SiteHeader active="restaurants" />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
        {/* Header/Search Section */}
        <section className="relative px-margin-desktop py-xl bg-surface-container-low overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg mb-lg">
        <div className="flex flex-col gap-sm">
        <span className="font-label-md text-label-md text-primary uppercase tracking-[0.3em]">Curated Selection</span>
        <h1 className="font-display-lg text-display-lg text-on-surface uppercase">Elite Establishments</h1>
        </div>
        <div className="flex items-center gap-md font-body-sm text-on-surface-variant">
        <span className="flex items-center gap-xs"><span className="text-primary font-bold">128</span> Restaurants Near You</span>
        <div className="h-4 w-px bg-outline-variant/30"></div>
        <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">location_on</span> Manhattan, NY</span>
        </div>
        </div>
        {/* Search & Filter Bar */}
        <div className="bg-surface-container p-md rounded-xl shadow-xl flex flex-col gap-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-center">
        {/* Search Input */}
        <div className="lg:col-span-7 relative">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input className="w-full bg-surface-dim border-none rounded-lg py-md pl-xl pr-md text-on-surface font-body-md focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50" placeholder="Search by name, cuisine, or dish..." type="text"/>
        </div>
        {/* Sort Dropdown */}
        <div className="lg:col-span-3 relative">
        <select className="w-full appearance-none bg-surface-dim border-none rounded-lg py-md px-md text-on-surface font-body-md focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
        <option>Sort by: Recommended</option>
        <option>Fastest Delivery</option>
        <option>Highest Rated</option>
        <option>Minimum Order: Low to High</option>
        </select>
        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
        </div>
        {/* Filter Trigger (Mobile/Utility) */}
        <button className="lg:col-span-2 flex items-center justify-center gap-sm bg-primary text-on-primary font-label-md uppercase tracking-widest py-md rounded-lg hover:brightness-110 transition-all">
        <span className="material-symbols-outlined text-[20px]">tune</span>
                                Refine
                            </button>
        </div>
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-sm items-center pt-xs border-t border-outline-variant/10">
        <button className="px-md py-xs rounded-full bg-primary text-on-primary font-label-md uppercase tracking-wider">All</button>
        <button className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-label-md uppercase tracking-wider">Fast Food</button>
        <button className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-label-md uppercase tracking-wider">Pizza</button>
        <button className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-label-md uppercase tracking-wider">Burgers</button>
        <button className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-label-md uppercase tracking-wider">Asian</button>
        <button className="px-md py-xs rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all font-label-md uppercase tracking-wider">Desserts</button>
        </div>
        </div>
        </div>
        </section>
        {/* Grid Section */}
        <section className="px-margin-desktop py-xl">
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
        {/* Card 1 */}
        <div className="group flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2">
        <div className="relative h-64 overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="A high-end Japanese restaurant interior with soft amber lighting, minimalist wooden architecture, and a focused chef preparing premium sashimi. The atmosphere is sophisticated and nocturnal, featuring rich textures of dark stone and polished cedar." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5nGKM5JrxQdVsxCweqVdk0Nj8EKfAHiHJQ43OiWtGis0JeLx85E_l6xQPGTwBTlmAuY2EYC3ffQyPfokPyPVY78Sw_sLOdUDe45MSZ2HUjS8om2Ik6eEJKaCZ42gH1tM7Dxh_HSa4KLb1fwSA7YAfpdzBCm9cSMaDMhghxIjm6UddG-7BAubQoUZLgrJxSsg6vGITK_tOcmC5niXDlrWVRwGBM2Byg5pBPr4D4FVc0-EJiLvLNXDgb-JutPFOQ3owTBGPvDulrOWv"/>
        <div className="absolute top-md right-md bg-surface/90 backdrop-blur-md px-sm py-xs rounded-lg flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-label-md text-on-surface">4.9</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-surface-container to-transparent"></div>
        </div>
        <div className="p-md flex flex-col gap-md">
        <div className="flex justify-between items-start">
        <div className="flex flex-col gap-xs">
        <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">OSAKA ELITE</h3>
        <div className="flex gap-xs">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Japanese</span>
        <span className="text-label-md font-label-md text-outline">•</span>
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Sashimi</span>
        </div>
        </div>
        </div>
        <div className="flex items-center justify-between py-sm border-y border-outline-variant/10">
        <div className="flex flex-col gap-xs">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Delivery</span>
        <span className="font-body-sm text-on-surface flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">schedule</span> 25-35 min</span>
        </div>
        <div className="flex flex-col gap-xs items-end">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Min Order</span>
        <span className="font-body-sm text-on-surface">$45.00</span>
        </div>
        </div>
        <a href="/menu" className="w-full py-md bg-primary-container text-on-primary-container font-label-md uppercase tracking-[0.2em] rounded-lg hover:bg-primary transition-all shadow-md group-hover:shadow-primary/20 text-center">Order Now</a>
        </div>
        </div>
        {/* Card 2 */}
        <div className="group flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2">
        <div className="relative h-64 overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Close up shot of a gourmet artisanal pizza with charred crust, fresh burrata melting in the center, and vibrant basil leaves. Professional food photography with dark mood lighting, high contrast, and warm golden tones reflecting off the olive oil." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5QtsdMgiOpNu73En_JXYHQ6MOI8bY8o8KyTE2jbq1zQ_1W6jWHxJBczj6XM0K0GLfKRWa8XWwaylyChTkonsvO5BBYHP66C7cSmF-r64xMNdY_oR-P7Nanl3oEr31ItwSBRas3fK58at_J5oprOPZiTF5xlSitTNEvrcswFdE1DOKN7jh-v0vUawgN9aRUWwmhlW5Eybl8LIt1Zvl6s1NVPwE8y9r-MnH040M6x3tQKIBAQZnXY_-8lf8QsfwDoy-63IQYrl2OY5-"/>
        <div className="absolute top-md right-md bg-surface/90 backdrop-blur-md px-sm py-xs rounded-lg flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-label-md text-on-surface">4.7</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-surface-container to-transparent"></div>
        </div>
        <div className="p-md flex flex-col gap-md">
        <div className="flex justify-between items-start">
        <div className="flex flex-col gap-xs">
        <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">THE HEARTH</h3>
        <div className="flex gap-xs">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Italian</span>
        <span className="text-label-md font-label-md text-outline">•</span>
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Wood-Fired</span>
        </div>
        </div>
        </div>
        <div className="flex items-center justify-between py-sm border-y border-outline-variant/10">
        <div className="flex flex-col gap-xs">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Delivery</span>
        <span className="font-body-sm text-on-surface flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">schedule</span> 15-25 min</span>
        </div>
        <div className="flex flex-col gap-xs items-end">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Min Order</span>
        <span className="font-body-sm text-on-surface">$20.00</span>
        </div>
        </div>
        <a href="/menu" className="w-full py-md bg-primary-container text-on-primary-container font-label-md uppercase tracking-[0.2em] rounded-lg hover:bg-primary transition-all shadow-md text-center">Order Now</a>
        </div>
        </div>
        {/* Card 3 */}
        <div className="group flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2">
        <div className="relative h-64 overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="A luxury steakhouse setting with a perfectly seared ribeye steak resting on a wooden board, garnished with rosemary. Behind it, a crystal glass of red wine glows under dim spotlight. The aesthetic is wealthy, moody, and highlights deep browns and gold accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYX3vvTaLW4RAK5Ho9jhZdTqO9paxjCK2yiecfGubQwZTXHkd2YCG0N6cxjwl2iH_kMsew4PIjgdvRjhXPtW-S-RDteFTJ8JRYbkyJwBvBpfk7Ng0Nl03tngHWbLTbGNW4EaV0tQElthz9Y7C5fKQ5YuSKFV0kvKD-GS0y38nIwKhqkEqnrG7yMPHTtEkXNeJcB-wNwUyCawTUDUZa22R2Z9pbcl31GMro4O0sznZh3zShSYHCbNbLW92sYfZ5Gb9lTE5TWzQ9UPBl"/>
        <div className="absolute top-md right-md bg-surface/90 backdrop-blur-md px-sm py-xs rounded-lg flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-label-md text-on-surface">5.0</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-surface-container to-transparent"></div>
        </div>
        <div className="p-md flex flex-col gap-md">
        <div className="flex justify-between items-start">
        <div className="flex flex-col gap-xs">
        <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">PRIME CUT</h3>
        <div className="flex gap-xs">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Steakhouse</span>
        <span className="text-label-md font-label-md text-outline">•</span>
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Premium</span>
        </div>
        </div>
        </div>
        <div className="flex items-center justify-between py-sm border-y border-outline-variant/10">
        <div className="flex flex-col gap-xs">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Delivery</span>
        <span className="font-body-sm text-on-surface flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">schedule</span> 40-50 min</span>
        </div>
        <div className="flex flex-col gap-xs items-end">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Min Order</span>
        <span className="font-body-sm text-on-surface">$75.00</span>
        </div>
        </div>
        <a href="/menu" className="w-full py-md bg-primary-container text-on-primary-container font-label-md uppercase tracking-[0.2em] rounded-lg hover:bg-primary transition-all shadow-md text-center">Order Now</a>
        </div>
        </div>
        {/* Card 4 (Repeat pattern for density) */}
        <div className="group flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2">
        <div className="relative h-64 overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Artistic stack of high-end smash burgers with melting truffle cheese, caramelized onions, and glossy brioche buns. Set against a dark, moody industrial background with neon golden light streaks. Sharp focus on texture and moisture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYn9RwQrnAkETzdrwY1IYv050KIyyHvYH9iAhuLnIzINW6xSD5HUyPTnm-hsejc0id1Yw53Zt_wev2xwyJ2fmtt5ODpBJggUEmksEsYSjqwxF6Nh_5JjudiaPa1PA4YsIzNimJcbJZtOmu-1l5B8dskqGA05Hy1UTdsoRUbvJxIdcH_kpZOY7gDv7ZwqTL4uo3SmYSmtqdXRpe-LtYoHhILZO05f6i13LYp8Pj8_15VhzwjhrsQssTsZn4nxt2SKVGO5JEMfKbwlf9"/>
        <div className="absolute top-md right-md bg-surface/90 backdrop-blur-md px-sm py-xs rounded-lg flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-label-md text-on-surface">4.6</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-surface-container to-transparent"></div>
        </div>
        <div className="p-md flex flex-col gap-md">
        <div className="flex justify-between items-start">
        <div className="flex flex-col gap-xs">
        <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">NOIR BURGER</h3>
        <div className="flex gap-xs">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Burgers</span>
        <span className="text-label-md font-label-md text-outline">•</span>
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Gourmet</span>
        </div>
        </div>
        </div>
        <div className="flex items-center justify-between py-sm border-y border-outline-variant/10">
        <div className="flex flex-col gap-xs">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Delivery</span>
        <span className="font-body-sm text-on-surface flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">schedule</span> 20-30 min</span>
        </div>
        <div className="flex flex-col gap-xs items-end">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Min Order</span>
        <span className="font-body-sm text-on-surface">$15.00</span>
        </div>
        </div>
        <a href="/menu" className="w-full py-md bg-primary-container text-on-primary-container font-label-md uppercase tracking-[0.2em] rounded-lg hover:bg-primary transition-all shadow-md text-center">Order Now</a>
        </div>
        </div>
        {/* Card 5 */}
        <div className="group flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2">
        <div className="relative h-64 overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Premium Dim Sum array with steam rising from bamboo baskets. Delicate har gow, shumai, and golden fried dumplings. Soft morning-style light filtering through a window, illuminating the intricate patterns on ceramic plates. Elegant Asian fine dining aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmnzg7WlThHvddb_o6FmdA8y_3ACOq_RD22J-AFe6GCpv97C8ra6Fenen_-wkOHuzDrNY66DhZlDii9PZrbxzRAIJ-swmfVha_G2NehfoxhA5PmcJsMTB6hUCzLhft8rsGdcTiR-DRv6CMf9YvLHxDSZ5Xx_Qx1Gp7hLN_wcLj7j3ixAUTrZbKTJrKaZ3Xb_a6EY6uZuzAF8d8vejUTlAo0iSl0xhPpYGjbrs7xt15yY5RuYzJv5JfNvRlGGoy1up2IlV318Nvaiop"/>
        <div className="absolute top-md right-md bg-surface/90 backdrop-blur-md px-sm py-xs rounded-lg flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-label-md text-on-surface">4.8</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-surface-container to-transparent"></div>
        </div>
        <div className="p-md flex flex-col gap-md">
        <div className="flex justify-between items-start">
        <div className="flex flex-col gap-xs">
        <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">SILK ROAD</h3>
        <div className="flex gap-xs">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Asian</span>
        <span className="text-label-md font-label-md text-outline">•</span>
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Dim Sum</span>
        </div>
        </div>
        </div>
        <div className="flex items-center justify-between py-sm border-y border-outline-variant/10">
        <div className="flex flex-col gap-xs">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Delivery</span>
        <span className="font-body-sm text-on-surface flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">schedule</span> 30-45 min</span>
        </div>
        <div className="flex flex-col gap-xs items-end">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Min Order</span>
        <span className="font-body-sm text-on-surface">$35.00</span>
        </div>
        </div>
        <a href="/menu" className="w-full py-md bg-primary-container text-on-primary-container font-label-md uppercase tracking-[0.2em] rounded-lg hover:bg-primary transition-all shadow-md text-center">Order Now</a>
        </div>
        </div>
        {/* Card 6 */}
        <div className="group flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-lg transition-transform duration-500 hover:-translate-y-2">
        <div className="relative h-64 overflow-hidden">
        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="Exquisite pastry display featuring gold-leaf chocolate eclairs, layered mille-feuille, and vibrant fruit tarts. The setting is a chic Parisian patisserie with marble counters and soft, ethereal lighting. Luxury dessert presentation with deep shadows and highlighted textures." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFzR8BycyiWE9mPSHrR-cBsNXfI4Qcp6tcp3NaD3s2K1ILDBvKMzUleOwZSJIvlGQxPH18pEOyCh8Ltojn5msAJDypx-6KRfqp_ahK_ECBGU06xxC-vl0i9MKOYOAx5V7sz1nq_gnlEtpyb9vkSq7IQRBKQmXQspr-V2fdCWW_UZn7_BNucrDf2XhNcSOYwrD9QQXdvH4GlvOraSS2qfmR0E0hPoEk5ms-aoSWXGlaaRYHn7DNVgXmwuiDP3lHkB9ZuMRl8QZVREew"/>
        <div className="absolute top-md right-md bg-surface/90 backdrop-blur-md px-sm py-xs rounded-lg flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-label-md text-on-surface">4.9</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-surface-container to-transparent"></div>
        </div>
        <div className="p-md flex flex-col gap-md">
        <div className="flex justify-between items-start">
        <div className="flex flex-col gap-xs">
        <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">L'ETOILE DOREE</h3>
        <div className="flex gap-xs">
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">Dessert</span>
        <span className="text-label-md font-label-md text-outline">•</span>
        <span className="text-label-md font-label-md text-on-surface-variant uppercase">French</span>
        </div>
        </div>
        </div>
        <div className="flex items-center justify-between py-sm border-y border-outline-variant/10">
        <div className="flex flex-col gap-xs">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Delivery</span>
        <span className="font-body-sm text-on-surface flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">schedule</span> 15-20 min</span>
        </div>
        <div className="flex flex-col gap-xs items-end">
        <span className="text-label-md text-on-surface-variant uppercase opacity-60">Min Order</span>
        <span className="font-body-sm text-on-surface">$25.00</span>
        </div>
        </div>
        <a href="/menu" className="w-full py-md bg-primary-container text-on-primary-container font-label-md uppercase tracking-[0.2em] rounded-lg hover:bg-primary transition-all shadow-md text-center">Order Now</a>
        </div>
        </div>
        </div>
        </div>
        </section>
        {/* Pagination Section */}
        <section className="px-margin-desktop py-lg border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md uppercase tracking-widest disabled:opacity-30" disabled>
        <span className="material-symbols-outlined">chevron_left</span>
                        Previous
                    </button>
        <div className="hidden md:flex items-center gap-md">
        <button className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold">1</button>
        <button className="w-10 h-10 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface font-bold">2</button>
        <button className="w-10 h-10 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface font-bold">3</button>
        <span className="text-on-surface-variant">...</span>
        <button className="w-10 h-10 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface font-bold">12</button>
        </div>
        <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md uppercase tracking-widest">
                        Next
                        <span className="material-symbols-outlined">chevron_right</span>
        </button>
        </div>
        </section>
        {/* Bottom Decorative Script */}

        </div>
      </main>
      <SiteFooter />
    </>
  );
}
