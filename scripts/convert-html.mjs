import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const stitchRoot = path.resolve(root, "..");

const pages = [
  {
    id: "home",
    html: "home_perfect_pickup/code.html",
    route: "page.tsx",
    active: "home",
    hasHeader: true,
    hasFooter: true,
  },
  {
    id: "login",
    html: "login_perfect_pickup/code.html",
    route: "login/page.tsx",
    active: null,
    hasHeader: false,
    hasFooter: false,
  },
  {
    id: "restaurants",
    html: "restaurants_perfect_pickup/code.html",
    route: "restaurants/page.tsx",
    active: "restaurants",
    hasHeader: true,
    hasFooter: true,
  },
  {
    id: "menu",
    html: "menu_perfect_pickup/code.html",
    route: "menu/page.tsx",
    active: "restaurants",
    hasHeader: true,
    hasFooter: true,
  },
  {
    id: "checkout",
    html: "checkout_perfect_pickup/code.html",
    route: "checkout/page.tsx",
    active: null,
    hasHeader: true,
    hasFooter: true,
  },
  {
    id: "track-order",
    html: "track_order_perfect_pickup/code.html",
    route: "track-order/page.tsx",
    active: null,
    hasHeader: true,
    hasFooter: true,
  },
  {
    id: "profile",
    html: "my_profile_perfect_pickup/code.html",
    route: "profile/page.tsx",
    active: null,
    hasHeader: false,
    hasFooter: false,
  },
];

function extractTagWithAttrs(html, tagName) {
  const re = new RegExp(`<${tagName}([^>]*)>([\\s\\S]*?)</${tagName}>`, "i");
  const match = html.match(re);
  if (!match) return null;
  return { attrs: match[1].trim(), content: match[2] };
}

function htmlToJsx(html) {
  let out = html;

  out = out.replace(/<!--([\s\S]*?)-->/g, (_m, c) => `{/*${c}*/}`);
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/\sclass=/g, " className=");
  out = out.replace(/\sfor=/g, " htmlFor=");
  out = out.replace(/\schecked=""/g, " defaultChecked");
  out = out.replace(/\sdisabled=""/g, " disabled");
  out = out.replace(/\sreadonly=""/g, " readOnly");
  out = out.replace(/\sselected=""/g, " defaultSelected");
  out = out.replace(/\sviewbox=/gi, " viewBox=");
  out = out.replace(/\sstroke-width=/gi, " strokeWidth=");
  out = out.replace(/\stabindex=/gi, " tabIndex=");
  out = out.replace(/\scolspan=/gi, " colSpan=");
  out = out.replace(/\srowspan=/gi, " rowSpan=");
  out = out.replace(/\sautocomplete=/gi, " autoComplete=");

  out = out.replace(/\sonclick=/gi, " onClick=");
  // Login auth tabs
  out = out.replace(
    /onClick="switchAuth\('login'\)"/g,
    'onClick={() => switchAuth("login")}'
  );
  out = out.replace(
    /onClick="switchAuth\('signup'\)"/g,
    'onClick={() => switchAuth("signup")}'
  );

  const voids = ["img", "input", "br", "hr", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"];
  for (const tag of voids) {
    out = out.replace(
      new RegExp(`<${tag}([^>]*?)(?<!/)>`, "gi"),
      (_m, attrs) => `<${tag}${attrs} />`
    );
  }

  out = out.replace(/\sstyle="([^"]*)"/g, (_m, style) => {
    const cleaned = style.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    const props = {};
    cleaned.split(";").forEach((part) => {
      const idx = part.indexOf(":");
      if (idx === -1) return;
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (!key || !val) return;
      const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      props[camel] = val;
    });
    const entries = Object.entries(props)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(", ");
    return ` style={{ ${entries} }}`;
  });

  out = out.replace(/>\s*html\s*\n/, ">\n");
  return out.trim();
}

function extractBodyScripts(raw) {
  const body = extractTagWithAttrs(raw, "body");
  if (!body) return [];
  const scripts = [];
  const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let sc;
  while ((sc = scriptRe.exec(body.content)) !== null) {
    const code = sc[1].trim();
    // Skip empty or function definitions that are only switchAuth (handled in page)
    if (!code) continue;
    if (code.includes("function switchAuth")) continue;
    scripts.push(code);
  }
  return scripts;
}

function extractPageStyles(raw) {
  const body = extractTagWithAttrs(raw, "body");
  if (!body) return [];
  const styles = [];
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  while ((sm = styleRe.exec(body.content)) !== null) {
    const css = sm[1].trim();
    // Skip base resets already in globals.css
    if (css.includes("@layer base")) {
      const withoutBase = css
        .replace(/@layer base\{[\s\S]*?\}/, "")
        .replace(/::-webkit-scrollbar\{display:none;\}/, "")
        .trim();
      if (withoutBase) styles.push(withoutBase);
      continue;
    }
    styles.push(css);
  }
  return styles;
}

function unwrapDomReady(code) {
  let c = code.trim();
  const patterns = [
    /^document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*\(\)\s*=>\s*\{([\s\S]*)\}\s*\);?\s*$/,
    /^document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*function\s*\(\)\s*\{([\s\S]*)\}\s*\);?\s*$/,
  ];
  for (const p of patterns) {
    const m = c.match(p);
    if (m) return m[1].trim();
  }
  return c;
}

function extractPageParts(raw) {
  const header = extractTagWithAttrs(raw, "header");
  const footer = extractTagWithAttrs(raw, "footer");
  const main = extractTagWithAttrs(raw, "main");

  let mainContent = main ? main.content : "";
  mainContent = mainContent.replace(/^\s*html\s*/, "");

  const mainClassMatch = main?.attrs.match(/class="([^"]*)"/);
  const mainClass = mainClassMatch ? mainClassMatch[1] : "w-full";

  return {
    mainClass,
    mainContent: htmlToJsx(mainContent),
    styles: extractPageStyles(raw),
    scripts: extractBodyScripts(raw).map(unwrapDomReady),
  };
}

function componentImport(route, name) {
  const depth = route.split("/").length - 1;
  const prefix = depth <= 0 ? "../components/" : "../".repeat(depth) + "components/";
  // route like page.tsx -> depth 0? "page.tsx".split = ["page.tsx"] length 1, depth 0
  // "login/page.tsx".split = ["login","page.tsx"] length 2, depth 1 -> ../components
  // Actually for app/page.tsx we need ../components
  // for app/login/page.tsx we need ../../components
  const rel = route.includes("/") ? "../../components/" : "../components/";
  return `import { ${name} } from "${rel}${name}";`;
}

function wrapPage(page, parts) {
  const headerImport = page.hasHeader ? componentImport(page.route, "SiteHeader") : "";
  const footerImport = page.hasFooter ? componentImport(page.route, "SiteFooter") : "";

  const effectLines = [];
  if (page.id === "login") {
    effectLines.push(`    function switchAuth(mode: "login" | "signup") {
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
    (window as unknown as { switchAuth: typeof switchAuth }).switchAuth = switchAuth;`);
  }

  for (const script of parts.scripts) {
    for (const line of script.split("\n")) {
      effectLines.push("    " + line);
    }
  }

  if (effectLines.length === 0) {
    effectLines.push("    // no-op");
  }

  // For login, replace switchAuth string handlers with local function via declaring switchAuth in component scope
  let mainContent = parts.mainContent;
  if (page.id === "login") {
    mainContent = mainContent
      .replace(
        /onClick=\{\(\) => switchAuth\("login"\)\}/g,
        'onClick={() => switchAuth("login")}'
      )
      .replace(
        /onClick=\{\(\) => switchAuth\("signup"\)\}/g,
        'onClick={() => switchAuth("signup")}'
      );
  }

  const headerJsx = page.hasHeader
    ? `<SiteHeader active="${page.active ?? ""}" />`
    : "";
  const footerJsx = page.hasFooter ? `<SiteFooter />` : "";

  const globalStyle =
    parts.styles.length > 0
      ? `\n      <style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(parts.styles.join("\n"))} }} />`
      : "";

  const loginHelper =
    page.id === "login"
      ? `
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
`
      : "";

  const useEffectBlock =
    page.id === "login"
      ? ""
      : `
  useEffect(() => {
${effectLines.filter((l) => !l.includes("switchAuth")).join("\n")}
  }, []);
`;

  const reactImport =
    page.id === "login"
      ? ""
      : `import { useEffect } from "react";\n`;

  return `"use client";

${reactImport}${headerImport}
${footerImport}
${loginHelper}
export default function Page() {${useEffectBlock}
  return (
    <>
      ${headerJsx}
      <main className="${parts.mainClass}">
${indent(mainContent, 8)}
      </main>
      ${footerJsx}${globalStyle}
    </>
  );
}
`;
}

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

const headerComponent = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOGO =
  "https://lh3.googleusercontent.com/aida/AP1WRLsLWx9kBRj1M29diOdsznZ1AwLRisG98zfnDzE1ogFAmxstTPvO8NKqpMNEgZ3QVHXvy-xSchVxTJ2Yf0MMfnLo77Y0lX7m7VhacsW0QtqBMwwC4-HUUjqDItLAhvkBlpYQGNBHIlpB2zdXnUoEJt1VzecMyT3pSG_G_z27l5S2xJ7Vs98m2nblpvMvuc-VznDXlxKm0Fmx3nTk0-7tAbhadVmscAT8NHmxJLUAyszpOCw-OMGR_St7BorNiYpaXLQJ2AsLGYXQXbw";

const nav = [
  { href: "/", label: "Home", key: "home" },
  { href: "/restaurants", label: "Restaurants", key: "restaurants" },
  { href: "/#how-it-works", label: "How It Works", key: "how-it-works" },
  { href: "/#contact", label: "Contact", key: "contact" },
];

export function SiteHeader({ active = "" }: { active?: string }) {
  const pathname = usePathname();
  const current =
    active ||
    (pathname === "/"
      ? "home"
      : pathname?.startsWith("/restaurants") || pathname?.startsWith("/menu")
        ? "restaurants"
        : "");

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
      <div className="h-20 max-w-7xl mx-auto px-margin-desktop flex items-center justify-between">
        <Link href="/" className="flex items-center gap-base">
          <img alt="Perfect Pickup Logo" className="w-10 h-10 rounded-full object-cover" src={LOGO} />
          <span className="font-headline-lg text-headline-lg text-primary uppercase tracking-wider">Perfect Pickup</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-lg">
          {nav.map((item) => {
            const isActive = current === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "transition-colors text-primary font-bold"
                    : "font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-md">
          <Link href="/restaurants" className="bg-primary-container text-on-primary-container px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:brightness-110 transition-all">
            Order Now
          </Link>
          <Link href="/profile">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-outline-variant" src={LOGO} />
          </Link>
        </div>
      </div>
    </header>
  );
}
`;

const footerComponent = `import Link from "next/link";

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
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
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
`;

const componentsDir = path.join(root, "src/components");
fs.mkdirSync(componentsDir, { recursive: true });
fs.writeFileSync(path.join(componentsDir, "SiteHeader.tsx"), headerComponent);
fs.writeFileSync(path.join(componentsDir, "SiteFooter.tsx"), footerComponent);

for (const page of pages) {
  const raw = fs.readFileSync(path.join(stitchRoot, page.html), "utf8");
  const parts = extractPageParts(raw);
  const tsx = wrapPage(page, parts);
  const outPath = path.join(root, "src/app", page.route);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, tsx);
  console.log("Wrote", page.route);
}

console.log("Done.");
