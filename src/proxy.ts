import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs before every matched request (this was `middleware` before Next 16).
 *
 * Two jobs only:
 *   1. Refresh the Supabase session cookie so Server Components never see an
 *      expired token.
 *   2. An optimistic signed-in check on private routes.
 *
 * Actual role authorization lives in the route layouts via `requireRole`, per
 * the Next.js guidance that proxy is not a session/authorization boundary.
 */

const PRIVATE_PREFIXES = ["/admin", "/vendor", "/profile", "/orders", "/checkout"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Not configured yet: pass the request straight through. The page itself
  // raises a readable "copy .env.local.example" error, which is far more
  // useful than every route failing here.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isPrivate && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(loginUrl);
  }

  // Already signed in? The auth screen has nothing to offer.
  if (pathname === "/login" && user) {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets, image optimizer output, and the courier
     * GPS ping endpoint (which authenticates by token, not by session).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/courier|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
