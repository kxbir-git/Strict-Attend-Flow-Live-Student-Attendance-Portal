import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static files and internal routes are exempt
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "strict-attend-flow-super-secure-jwt-secret-key-32chars",
  });

  const role = token?.role as string | undefined;

  // If user visits /login while authenticated, redirect to their dashboard
  if (pathname === "/login") {
    if (token && role) {
      if (role === "ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (role === "TEACHER") return NextResponse.redirect(new URL("/teacher/dashboard", req.url));
      if (role === "STUDENT") return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Check protected portals
  const isAdminRoute = pathname.startsWith("/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");

  if (isAdminRoute || isTeacherRoute || isStudentRoute) {
    // Unauthenticated -> redirect to /login
    if (!token || !role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific enforcement
    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (isTeacherRoute && role !== "TEACHER") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }

    if (isStudentRoute && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
  ],
};
