import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static files, Next internals, and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/admin/auth/login") ||
    pathname.startsWith("/Layout-Icons") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Check for the authenticated admin session cookie
  const sessionCookie =
    request.cookies.get("admin_session")?.value ||
    request.cookies.get("admin_token")?.value;

  const isLoginPage = pathname === "/login";

  // 3. Unauthenticated visitor trying to access protected admin pages
  if (!sessionCookie && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/" && pathname !== "") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. Already authenticated visitor trying to access /login
  if (sessionCookie && isLoginPage) {
    const destination = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
