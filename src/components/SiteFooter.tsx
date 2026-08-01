import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 pt-lg pb-md">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-lg">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-md">
            <div className="flex items-center gap-base">
              <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center opacity-90">
                <span
                  className="material-symbols-outlined text-on-primary text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  restaurant
                </span>
              </span>
              <span className="font-headline-xl text-headline-xl text-on-surface uppercase">
                Perfect Pick Up
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[320px]">
              The premier concierge pick up experience for the discerning foodie. Quality and
              speed, perfected — and tracked every metre of the way.
            </p>
          </div>

          <div className="flex flex-col gap-sm">
            <h2 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">
              Navigation
            </h2>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/restaurants">Restaurants</FooterLink>
            <FooterLink href="/orders">My Orders</FooterLink>
            <FooterLink href="/profile">My Profile</FooterLink>
          </div>

          <div className="flex flex-col gap-sm">
            <h2 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">
              Partners
            </h2>
            <FooterLink href="/vendor">Vendor Dashboard</FooterLink>
            <FooterLink href="/login">Sign In</FooterLink>
          </div>
        </div>

        <div className="pt-md border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-md text-on-surface-variant font-body-sm text-body-sm">
          <span>© {new Date().getFullYear()} Perfect Pick Up. All rights reserved.</span>
          <div className="flex gap-md">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}
