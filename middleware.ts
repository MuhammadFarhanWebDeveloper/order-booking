import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { Role } from "@prisma/client";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req: NextRequest) {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;
  const role = session?.user?.role;

  const publicPaths = ["/login"];
  const isLoggedIn = !!session;

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Routes only accessible by ADMIN
  const adminOnlyPaths = ["/users/add", "/customers/add", "/product/add"];
  if (adminOnlyPaths.some((adminPath) => path.startsWith(adminPath)) && role !== Role.ADMIN) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // Specific restriction for SALES_AGENT
  if (path.startsWith("/orders/add") && role === Role.SALES_AGENT) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
