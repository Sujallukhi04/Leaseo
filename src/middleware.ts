import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  privateRoutes,
} from "./routes";
import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const session = await auth();
  const isLoggedIn = !!session?.user;

  const pathname = nextUrl.pathname;

  if (pathname.startsWith(apiAuthPrefix)) return NextResponse.next();

  const isAuthRoute = authRoutes.includes(pathname);
  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isLoggedIn && isAuthRoute) {
    if (session?.user?.role === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/customer/dashboard", nextUrl));
  }

  // Protect Vendor Routes
  if (isLoggedIn && pathname.startsWith("/vendor") && session?.user?.role !== "VENDOR") {
    return NextResponse.redirect(new URL("/customer/dashboard", nextUrl));
  }

  if (!isLoggedIn && isPrivateRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
