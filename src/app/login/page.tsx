// @ts-nocheck
"use client";




  function switchAuth(mode: "login" | "signup") {
    const loginForm = document.getElementById("form-login");
    const signupForm = document.getElementById("form-signup");
    const loginTab = document.getElementById("tab-login");
    const signupTab = document.getElementById("tab-signup");
    if (!loginForm || !signupForm || !loginTab || !signupTab) return;
    if (mode === "login") {
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
      loginTab.classList.add("border-primary", "text-on-surface");
      loginTab.classList.remove("border-transparent", "text-on-surface-variant");
      signupTab.classList.add("border-transparent", "text-on-surface-variant");
      signupTab.classList.remove("border-primary", "text-on-surface");
    } else {
      loginForm.classList.add("hidden");
      signupForm.classList.remove("hidden");
      signupTab.classList.add("border-primary", "text-on-surface");
      signupTab.classList.remove("border-transparent", "text-on-surface-variant");
      loginTab.classList.add("border-transparent", "text-on-surface-variant");
      loginTab.classList.remove("border-primary", "text-on-surface");
    }
  }

export default function Page() {
  return (
    <>
      
      <main className="w-full flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col w-full items-center justify-center p-margin-mobile md:p-margin-desktop">
        {/* Ambient Background Decor */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 blur-[120px] rounded-full"></div>
        </div>
        {/* Auth Container */}
        <div className="relative w-full max-w-[480px] z-10">
        {/* Brand Mark (Minimalist) */}
        <div className="flex flex-col items-center mb-xl">
        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg mb-md shadow-xl shadow-primary/20">
        <span className="material-symbols-outlined text-on-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
        </div>
        <h2 className="font-display-lg text-display-lg-mobile md:text-headline-xl text-on-surface tracking-widest uppercase">Concierge</h2>
        <p className="font-label-md text-label-md text-primary tracking-[0.2em] -mt-1 opacity-80">EXCLUSIVE DINING</p>
        </div>
        {/* Main Card */}
        <div className="bg-surface-container rounded-xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-outline-variant/30">
        <button className="flex-1 py-md font-label-md text-label-md uppercase tracking-widest transition-all duration-300 border-b-2 border-primary text-on-surface" id="tab-login" onClick={() => switchAuth("login")}>
                  Login
                </button>
        <button className="flex-1 py-md font-label-md text-label-md uppercase tracking-widest transition-all duration-300 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface" id="tab-signup" onClick={() => switchAuth("signup")}>
                  Sign Up
                </button>
        </div>
        <div className="p-lg md:p-xl">
        {/* Login Form */}
        <form className="flex flex-col gap-md" id="form-login">
        <div className="space-y-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1">Email Address</label>
        <input className="w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20" placeholder="name@example.com" type="email"/>
        </div>
        <div className="space-y-xs">
        <div className="flex justify-between items-center px-1">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Password</label>
        <a className="font-label-md text-label-md text-primary hover:underline transition-all" href="#">Forgot?</a>
        </div>
        <input className="w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20" placeholder="••••••••" type="password"/>
        </div>
        <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all mt-base shadow-lg shadow-primary/10" type="button" onClick={() => { window.location.href = "/"; }}>
                    Sign In
                  </button>
        <div className="relative py-md flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30"></div></div>
        <span className="relative bg-surface-container px-md font-label-md text-label-md text-outline">OR</span>
        </div>
        <button className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface font-label-md text-label-md py-md rounded-lg uppercase tracking-widest flex items-center justify-center gap-sm hover:bg-surface-bright transition-all" type="button">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
        </svg>
                    Continue with Google
                  </button>
        </form>
        {/* Sign Up Form (Hidden by default) */}
        <form className="hidden flex flex-col gap-md" id="form-signup">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1">Full Name</label>
        <input className="w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20" placeholder="John Doe" type="text"/>
        </div>
        <div className="space-y-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1">Phone</label>
        <input className="w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20" placeholder="+1 (555) 000-0000" type="tel"/>
        </div>
        </div>
        <div className="space-y-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1">Email Address</label>
        <input className="w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20" placeholder="name@example.com" type="email"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1">Password</label>
        <input className="w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20" placeholder="••••••••" type="password"/>
        </div>
        <div className="space-y-xs">
        <label className="font-label-md text-label-md text-on-surface-variant uppercase ml-1">Confirm</label>
        <input className="w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20" placeholder="••••••••" type="password"/>
        </div>
        </div>
        <div className="flex items-start gap-sm mt-xs">
        <input className="mt-1 accent-primary" type="checkbox"/>
        <p className="font-body-sm text-body-sm text-on-surface-variant">I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.</p>
        </div>
        <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all mt-base shadow-lg shadow-primary/10" type="submit">
                    Create Account
                  </button>
        </form>
        </div>
        </div>
        {/* Decorative Bottom Metadata */}
        <div className="flex justify-between items-center mt-lg px-md">
        <span className="font-label-md text-[10px] text-outline uppercase tracking-[0.3em]">Encrypted Session</span>
        <div className="flex gap-md">
        <span className="material-symbols-outlined text-outline text-lg">verified_user</span>
        <span className="material-symbols-outlined text-outline text-lg">cloud_download</span>
        </div>
        </div>
        </div>
        {/* Editorial Image Overlay (Asymmetric) */}
        <div className="hidden xl:block fixed left-12 bottom-12 w-64 h-96 -rotate-6 z-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:rotate-0 transition-all duration-700">
        <div className="w-full h-full bg-cover bg-center rounded-sm shadow-2xl border border-outline-variant/20" data-alt="Close up high-end gourmet plating with dramatic lighting, gold leaf accents, and dark ceramic textures. The aesthetic is extremely moody and sophisticated, echoing a Michelin-star dining environment." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCDRoZIoaO0OYkK5IMb-9ar7q4cyy83cjG_x6XYBMsuJGU8m-HyMAdtYI3aAr9-1LcWwDfggZt6z5us6egXUFb-Mdt84HQkaQw1MDYchgtWmcaOtd3csvi0nxQt-x2RP9UhN5qawRiLMAaRohl0Tv3M5s0mli4Tnai1L5pSQZEy_sdyumSNFqZhssrv7j8ccD5tUFwz0EX8x43GNAygkPll3H4joRZwSAtAD68ZWxg3UjQ30zHY6KYt2A3OD_DqHep9Xa2YvbI1WK5')" }}></div>
        </div>
        <div className="hidden xl:block fixed right-12 top-24 w-80 h-56 rotate-3 z-0 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 hover:rotate-0 transition-all duration-700">
        <div className="w-full h-full bg-cover bg-center rounded-sm shadow-2xl border border-outline-variant/20" data-alt="Luxury interior of a modern private members club at night. Warm amber lighting hitting crystal glassware and dark velvet textures. Atmospheric, exclusive, and quiet ambiance." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCdziGZMTky7bt6hAMiZhh3DhhiO7fzSB-QGruTuZBis3_7cGa4Lwuof03MPVzV-O-xwtBN1fo53uhM7l86Pxi4ejDp8WKPWV1we0CCBgYnpb20bKAsnyLiLeGHvY6shTWO-gp8zfYWYsVb47wFe8wNOrl4NrEYlG4qCmpiBBVox1fj9sUAF8ZeUpeVqSGCOKECB1MvZZFRWxSfHrcMEn1nMr4q4na0K2SpJiDhNXEldbBm4u9aqB2uM2ZNEI249NS5PLFEnhzOKe7')" }}></div>
        </div>

        </div>
      </main>
      
    </>
  );
}
