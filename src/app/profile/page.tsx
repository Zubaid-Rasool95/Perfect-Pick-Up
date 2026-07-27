// @ts-nocheck
"use client";

import { useEffect } from "react";



export default function Page() {
  useEffect(() => {
    document.querySelectorAll('.group').forEach(card => {
          card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
          });
          card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
          });
        });
    
        const tabs = document.querySelectorAll('nav button');
        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
            tabs.forEach(t => {
              t.classList.remove('bg-surface-container-highest', 'text-primary');
              t.classList.add('text-on-surface-variant');
            });
            tab.classList.add('bg-surface-container-highest', 'text-primary');
            tab.classList.remove('text-on-surface-variant');
          });
        });
  }, []);

  return (
    <>
      
      <main className="w-full flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col w-full max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
        {/* Profile Header */}
        <div className="relative w-full flex flex-col md:flex-row items-start md:items-end gap-md mb-xl">
        <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-highest ring-4 ring-background shadow-xl">
        <img className="w-full h-full object-cover" data-alt="A cinematic, high-end close-up portrait of a sophisticated person in their late 30s, dramatic side-lighting, deep shadows, moody atmosphere. The background is a blurred luxury lounge with warm amber glows. 8k resolution, professional photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb7sX9Oh1qSLKUd3ihgqlpw553YoAVLGVkFwOUdANFM4Z2J6Z5S19eUJ-DsD_IM5SohoCzMLmULsJ3s9Cr7GRztWlwcSZrYNr9k7R2W79ovDm-lne9vxagpC7bgxp3yq9oLyjgWUFXa7BUkXmeqAG8rlK4zTASg-Nc_kXOSdv1psy05QRGkXXxFyt2CJqygNnGEszlpu0TUzdkWJ5kVROnakrKe9_H3urveH10HdpK7n1GNnoH3I9xGD3qDiEb3pgthg_6ujlb2B9y"/>
        </div>
        <div className="absolute bottom-1 right-1 bg-primary p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-on-primary text-[20px]">photo_camera</span>
        </div>
        </div>
        <div className="flex-1 space-y-sm">
        <div className="flex items-center gap-sm">
        <span className="font-label-md text-primary uppercase tracking-widest">Premium Member</span>
        <div className="h-[1px] w-12 bg-outline-variant"></div>
        </div>
        <h1 className="font-display-lg text-on-surface uppercase">Alexander Sterling</h1>
        <p className="font-body-md text-on-surface-variant max-w-[448px]">Curating the finest culinary experiences since 2022. Based in Upper Manhattan.</p>
        </div>
        <button className="group flex items-center gap-2 px-md py-3 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-lg border border-outline-variant/30">
        <span className="material-symbols-outlined text-primary group-hover:rotate-12 transition-transform">edit</span>
        <span className="font-label-md text-on-surface uppercase tracking-wider">Edit Profile</span>
        </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-xl">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-67 shrink-0">
        <nav className="flex flex-row lg:flex-col gap-xs overflow-x-auto lg:overflow-visible pb-md lg:pb-0 scrollbar-hide">
        <button className="flex items-center gap-md px-md py-4 rounded-lg bg-surface-container-highest text-primary w-full whitespace-nowrap lg:whitespace-normal">
        <span className="material-symbols-outlined">person</span>
        <span className="font-label-md uppercase tracking-widest">Profile Info</span>
        </button>
        <button className="flex items-center gap-md px-md py-4 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-all w-full whitespace-nowrap lg:whitespace-normal border border-transparent hover:border-outline-variant/20">
        <span className="material-symbols-outlined">history</span>
        <span className="font-label-md uppercase tracking-widest">Order History</span>
        </button>
        <button className="flex items-center gap-md px-md py-4 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-all w-full whitespace-nowrap lg:whitespace-normal border border-transparent hover:border-outline-variant/20">
        <span className="material-symbols-outlined">location_on</span>
        <span className="font-label-md uppercase tracking-widest">Saved Addresses</span>
        </button>
        <button className="flex items-center gap-md px-md py-4 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-all w-full whitespace-nowrap lg:whitespace-normal border border-transparent hover:border-outline-variant/20">
        <span className="material-symbols-outlined">settings</span>
        <span className="font-label-md uppercase tracking-widest">Settings</span>
        </button>
        </nav>
        {/* Membership Card Mini */}
        <div className="mt-xl p-md rounded-xl bg-gradient-to-br from-surface-container-highest to-surface-container border border-primary/20 relative overflow-hidden hidden lg:block">
        <div className="relative z-10">
        <p className="font-label-md text-primary mb-base">LOYALTY STATUS</p>
        <p className="font-headline-lg text-on-surface mb-md">GOLD TIER</p>
        <div className="w-full bg-background/50 h-1 rounded-full overflow-hidden">
        <div className="bg-primary h-full w-3/4 shadow-[0_0_8px_rgba(255,185,93,0.5)]"></div>
        </div>
        <p className="text-[10px] font-label-md text-on-surface-variant mt-sm">2,450 / 3,000 PTS TO PLATINUM</p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
        <span className="material-symbols-outlined text-[120px] text-primary">military_tech</span>
        </div>
        </div>
        </aside>
        {/* Main Content: Order History */}
        <div className="flex-1 space-y-md">
        <div className="flex items-center justify-between mb-lg">
        <div className="space-y-xs">
        <h2 className="font-headline-xl text-on-surface uppercase">Recent Orders</h2>
        <p className="font-body-sm text-on-surface-variant">Manage your past dining experiences and quick-reorder favorites.</p>
        </div>
        <div className="flex gap-sm">
        <span className="material-symbols-outlined p-2 bg-surface-container rounded-lg text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors">filter_list</span>
        <span className="material-symbols-outlined p-2 bg-surface-container rounded-lg text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors">search</span>
        </div>
        </div>
        {/* Order List */}
        <div className="grid grid-cols-1 gap-md">
        {/* Order Card 1 */}
        <div className="group bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-md md:p-lg flex flex-col md:flex-row gap-md items-center border border-outline-variant/10">
        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
        <img className="w-full h-full object-cover" data-alt="Close up of a luxury gourmet sushi platter, gold flakes on toro, dark slate background, professional studio lighting, high contrast." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhU43GgWcB858o4b9WdO5F26AE2NjyZVT_yweX461Dr4qebwDVeXMxizv9oV-YAc1FfsFCAjKEs6UFGxIzT1F-o9ToF5PliTLfIoPBVFDr2JYDI0Pxi8R1V8hEkVuorZt2R5ulOz0U0h5TbqjT-fGC7naEZ47c8zlnR2AyIUP00EfvpxjSYVFm-5GYp-JZ04lop_-T9rN2C3fGdEdd4TcgWdr17PIvPuYF5HQNSrlaoy4PWYv81W2krbqLsZF1blyLzgxYIFt9hEot"/>
        </div>
        <div className="flex-1 text-center md:text-left space-y-xs">
        <div className="flex flex-col md:flex-row md:items-center gap-sm">
        <h3 className="font-title-lg text-on-surface">Mizumi Omakase</h3>
        <span className="inline-flex items-center px-sm py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-label-md uppercase tracking-tighter">Delivered</span>
        </div>
        <p className="font-body-sm text-on-surface-variant">Oct 24, 2023 • 3 Items • #ORD-9921</p>
        <p className="font-body-md text-on-surface font-bold">$142.50</p>
        </div>
        <div className="flex gap-sm w-full md:w-auto">
        <button className="flex-1 md:flex-none px-md py-3 rounded-lg bg-primary text-on-primary font-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10">
                      Reorder
                    </button>
        <button className="flex-1 md:flex-none px-md py-3 rounded-lg border border-outline-variant text-on-surface font-label-md uppercase tracking-widest hover:bg-surface-container-highest transition-colors">
                      Details
                    </button>
        </div>
        </div>
        {/* Order Card 2 */}
        <div className="group bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-md md:p-lg flex flex-col md:flex-row gap-md items-center border border-outline-variant/10">
        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
        <img className="w-full h-full object-cover" data-alt="High-end dry-aged ribeye steak with rosemary sprig, dark moody wooden table, fine dining aesthetic, warm lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVIISV9M0yChdoklNcByczfBmdpwtcgZVX58xqZTuPW9a0IyA7mlyIEWCUtvySY1HrFNdEnTWRIc6HLRfoI5dVUTbY0QcyrqIrobmMhykzBKlaT4Vksp5Ijl_fF8Fz-tz1jM53vvmcNqAf8qsON-YwzBaXyeqgadQQnxmulIn2e4-vZjvIt5pNp49srZYWqzj1FETbEKVBcYbOW5eVI7GD576a50Fp9l4AiA_yastoG16ARD29PG-0yo2NfvBq5i4hvdiaQelScZSt"/>
        </div>
        <div className="flex-1 text-center md:text-left space-y-xs">
        <div className="flex flex-col md:flex-row md:items-center gap-sm">
        <h3 className="font-title-lg text-on-surface">The Gilded Grill</h3>
        <span className="inline-flex items-center px-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-label-md uppercase tracking-tighter">Cancelled</span>
        </div>
        <p className="font-body-sm text-on-surface-variant">Oct 18, 2023 • 1 Item • #ORD-8742</p>
        <p className="font-body-md text-on-surface font-bold">$84.00</p>
        </div>
        <div className="flex gap-sm w-full md:w-auto">
        <button className="flex-1 md:flex-none px-md py-3 rounded-lg bg-primary text-on-primary font-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10">
                      Reorder
                    </button>
        <button className="flex-1 md:flex-none px-md py-3 rounded-lg border border-outline-variant text-on-surface font-label-md uppercase tracking-widest hover:bg-surface-container-highest transition-colors">
                      Details
                    </button>
        </div>
        </div>
        {/* Order Card 3 */}
        <div className="group bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-md md:p-lg flex flex-col md:flex-row gap-md items-center border border-outline-variant/10">
        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
        <img className="w-full h-full object-cover" data-alt="Authentic Italian truffle pasta, dark ceramic bowl, moody lighting, grated parmesan flying in the air." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9mLwQgtLc3JnslWSZUeOAR2sPyHbB-UStK5vudk1OXoxt6ELWgoU7onoJ1uOGBder-2sd7EASRRr7M47SRaIA5ksr4xIcg56VXdB6zUTiSjoLfuLPj0PXTBYmTzoN8aN37rQpsDWC4l6XUstsJyxSPn-1Llp9-Me4whIyY9DcESxH8TjXNzr8veRhUXJUTXRj3wa1wskBWUBMVWuxOL-ObIDvwdYXCIF432vmbHZ6zUj2WRlgbmKg8yH60UYZzLqr-WYgc7eSCuLJ"/>
        </div>
        <div className="flex-1 text-center md:text-left space-y-xs">
        <div className="flex flex-col md:flex-row md:items-center gap-sm">
        <h3 className="font-title-lg text-on-surface">La Trattoria Nera</h3>
        <span className="inline-flex items-center px-sm py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-label-md uppercase tracking-tighter">Delivered</span>
        </div>
        <p className="font-body-sm text-on-surface-variant">Oct 12, 2023 • 5 Items • #ORD-7651</p>
        <p className="font-body-md text-on-surface font-bold">$210.15</p>
        </div>
        <div className="flex gap-sm w-full md:w-auto">
        <button className="flex-1 md:flex-none px-md py-3 rounded-lg bg-primary text-on-primary font-label-md uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10">
                      Reorder
                    </button>
        <button className="flex-1 md:flex-none px-md py-3 rounded-lg border border-outline-variant text-on-surface font-label-md uppercase tracking-widest hover:bg-surface-container-highest transition-colors">
                      Details
                    </button>
        </div>
        </div>
        </div>
        {/* Pagination/Load More */}
        <div className="pt-lg flex flex-col items-center gap-md">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
        <button className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
        <span className="font-label-md uppercase tracking-[0.2em]">View All Activity</span>
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
        </div>
        </div>
        </div>
        {/* Micro-interactions Script */}

        </div>
      </main>
      
    </>
  );
}
