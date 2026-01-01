import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  // 1. protected routes pattern
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // 2. Check session from cookie
    // Better-auth writes session_token cookie
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      // Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
