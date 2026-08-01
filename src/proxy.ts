import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      if (!process.env.SESSION_SECRET) {
        throw new Error("CRITICAL: SESSION_SECRET environment variable is not set.");
      }
      const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);
      await jwtVerify(sessionCookie.value, encodedKey, {
        algorithms: ["HS256"],
      });
      // Session is valid, allow request
      return NextResponse.next();
    } catch {
      // Invalid or expired token
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
