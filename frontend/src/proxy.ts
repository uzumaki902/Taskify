import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const jwt = request.cookies.get("jwt")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isAuthRoute =
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");

  if (isProtectedRoute && !jwt) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthRoute && jwt) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/signin", "/signup"],
};
