import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Perfect Pick Up",
    template: "%s · Perfect Pick Up",
  },
  description:
    "The premier concierge pick up experience for the discerning foodie. Order from the city's best kitchens and watch your courier the whole way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <head>
        {/*
          Loaded via <link> rather than an @import in globals.css: Tailwind v4
          runs the stylesheet through Lightning CSS, which strips remote
          @import rules — the icon font silently never loads and every icon
          renders as its literal ligature name.
        */}
        {/*
          eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font --
          `display=block` is deliberate: with `swap` the fallback font paints
          each ligature's name ("search", "shopping_bag") until the icon font
          arrives. `no-page-custom-font` is Pages Router advice; this is the
          App Router root layout, so it already covers every page.
        */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
