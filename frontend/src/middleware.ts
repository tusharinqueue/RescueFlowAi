import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Edge middleware – refreshes Supabase session cookies and enforces
 * route-level authentication guards.
 *
 * Protected prefixes: /dashboard, /incidents, /dispatch, /map, /settings
 * Public routes:      /, /login, /register, /api/*
 *
 * NOTE: When NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are not set (demo / local dev),
 * auth guards are bypassed so all pages are accessible for UI review.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl  = process.env["NEXT_PUBLIC_SUPABASE_URL"]  ?? "";
  const supabaseKey  = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "";

  // ── Demo mode: skip auth entirely when Supabase is not configured ─────────
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  // ── Production mode: full Supabase session refresh + route guards ─────────
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Refresh session (keeps it alive)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const protectedPrefixes = ["/dashboard", "/incidents", "/dispatch", "/map", "/settings"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && user == null) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (user != null && (pathname === "/login" || pathname === "/register")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
