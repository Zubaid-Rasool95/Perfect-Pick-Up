import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Sign in · Perfect Pick Up",
};

const ERROR_COPY: Record<string, string> = {
  google: "We couldn't start the Google sign-in. Try again.",
  missing_code: "That sign-in link was incomplete. Request a new one.",
  exchange_failed: "That link has expired. Request a new one.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";
  const error = params.error ? ERROR_COPY[params.error] : undefined;

  return (
    <main className="w-full flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col w-full items-center justify-center p-margin-mobile md:p-margin-desktop">
        {/* Ambient Background Decor */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 blur-[120px] rounded-full" />
        </div>

        {/* Auth Container */}
        <div className="relative w-full max-w-[480px] z-10">
          {/* Brand Mark */}
          <div className="flex flex-col items-center mb-xl">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-lg mb-md shadow-xl shadow-primary/20">
              <span
                className="material-symbols-outlined text-on-primary text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                restaurant
              </span>
            </div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-headline-xl text-on-surface tracking-widest uppercase">
              Perfect Pick Up
            </h2>
            <p className="font-label-md text-label-md text-primary tracking-[0.2em] -mt-1 opacity-80">
              EXCLUSIVE DINING
            </p>
          </div>

          {error ? (
            <p className="mb-md bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
              {error}
            </p>
          ) : null}

          <AuthPanel next={next} />

          {/* Decorative Bottom Metadata */}
          <div className="flex justify-between items-center mt-lg px-md">
            <span className="font-label-md text-[10px] text-outline uppercase tracking-[0.3em]">
              Encrypted Session
            </span>
            <div className="flex gap-md">
              <span className="material-symbols-outlined text-outline text-lg">verified_user</span>
              <span className="material-symbols-outlined text-outline text-lg">cloud_download</span>
            </div>
          </div>
        </div>

        {/* Editorial Image Overlay (Asymmetric) */}
        <div className="hidden xl:block fixed left-12 bottom-12 w-64 h-96 -rotate-6 z-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:rotate-0 transition-all duration-700">
          <div
            className="w-full h-full bg-cover bg-center rounded-sm shadow-2xl border border-outline-variant/20"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCDRoZIoaO0OYkK5IMb-9ar7q4cyy83cjG_x6XYBMsuJGU8m-HyMAdtYI3aAr9-1LcWwDfggZt6z5us6egXUFb-Mdt84HQkaQw1MDYchgtWmcaOtd3csvi0nxQt-x2RP9UhN5qawRiLMAaRohl0Tv3M5s0mli4Tnai1L5pSQZEy_sdyumSNFqZhssrv7j8ccD5tUFwz0EX8x43GNAygkPll3H4joRZwSAtAD68ZWxg3UjQ30zHY6KYt2A3OD_DqHep9Xa2YvbI1WK5')",
            }}
          />
        </div>
        <div className="hidden xl:block fixed right-12 top-24 w-80 h-56 rotate-3 z-0 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 hover:rotate-0 transition-all duration-700">
          <div
            className="w-full h-full bg-cover bg-center rounded-sm shadow-2xl border border-outline-variant/20"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCdziGZMTky7bt6hAMiZhh3DhhiO7fzSB-QGruTuZBis3_7cGa4Lwuof03MPVzV-O-xwtBN1fo53uhM7l86Pxi4ejDp8WKPWV1we0CCBgYnpb20bKAsnyLiLeGHvY6shTWO-gp8zfYWYsVb47wFe8wNOrl4NrEYlG4qCmpiBBVox1fj9sUAF8ZeUpeVqSGCOKECB1MvZZFRWxSfHrcMEn1nMr4q4na0K2SpJiDhNXEldbBm4u9aqB2uM2ZNEI249NS5PLFEnhzOKe7')",
            }}
          />
        </div>
      </div>
    </main>
  );
}
