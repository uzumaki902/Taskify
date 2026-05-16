import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Extract the secure JWT cookie
  const jwt = request.cookies.get("jwt")?.value;
  const { pathname } = request.nextUrl;

  // Define our route boundaries
  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");

  // Rule 1: If trying to access the dashboard WITHOUT a token, kick to signin
  if (isProtectedRoute && !jwt) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Rule 2: If trying to access login/register/root WITH a token, kick to dashboard
  if (isAuthRoute && jwt) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Rule 3: Otherwise, let them pass
  return NextResponse.next();
}

// Performance Optimization: Only run this middleware on specific routes
export const config = {
  matcher: ["/", "/dashboard/:path*", "/signin", "/signup"],
};
