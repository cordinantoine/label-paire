import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/admin-auth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page et API de login sont accessibles sans auth
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete("admin_token");
    return res;
  }

  return NextResponse.next();
}
