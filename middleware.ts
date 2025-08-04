import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { Role } from "@prisma/client";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const session = req.auth;
  const path = url.pathname;
  const role = session?.user?.role;

  const isLoggedIn = !!session;
  const publicPaths = ["/login"];

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/users/add") && role == Role.SALES_AGENT) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
