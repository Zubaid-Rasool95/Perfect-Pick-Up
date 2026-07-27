import Link from "next/link";

const LOGO =
  "https://lh3.googleusercontent.com/aida/AP1WRLsLWx9kBRj1M29diOdsznZ1AwLRisG98zfnDzE1ogFAmxstTPvO8NKqpMNEgZ3QVHXvy-xSchVxTJ2Yf0MMfnLo77Y0lX7m7VhacsW0QtqBMwwC4-HUUjqDItLAhvkBlpYQGNBHIlpB2zdXnUoEJt1VzecMyT3pSG_G_z27l5S2xJ7Vs98m2nblpvMvuc-VznDXlxKm0Fmx3nTk0-7tAbhadVmscAT8NHmxJLUAyszpOCw-OMGR_St7BorNiYpaXLQJ2AsLGYXQXbw";

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 pt-lg pb-md">
      <div className="max-w-7xl mx-auto px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-lg">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-md">
            <div className="flex items-center gap-base">
              <img alt="Perfect Pickup Logo" className="w-8 h-8 rounded-full opacity-80" src={LOGO} />
              <span className="font-headline-xl text-headline-xl text-on-surface uppercase">Perfect Pickup</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[320px]">
              The premier concierge pickup experience for the discerning foodie. Quality and speed, perfected.
            </p>
          </div>
          <div className="flex flex-col gap-sm">
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">Navigation</h4>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/">Home</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/restaurants">Restaurants</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="/profile">Support</Link>
          </div>
          <div className="flex flex-col gap-sm">
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest">Social</h4>
            <div className="flex gap-md">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">share</span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">public</span>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">camera</span>
            </div>
          </div>
        </div>
        <div className="pt-md border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-md text-on-surface-variant font-body-sm text-body-sm">
          <span>© 2024 Perfect Pickup. All rights reserved.</span>
          <div className="flex gap-md">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
