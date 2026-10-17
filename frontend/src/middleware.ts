import { type NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware:
 * Direct access to Command Center dashboard, dispatch, and incidents.
 * Automatically redirects any legacy /login or /register attempts to /dashboard.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect any legacy signin / login / register paths directly to dashboard
  if (pathname === "/login" || pathname === "/register" || pathname === "/signin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
