import NextAuth from "next-auth";
import { User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User extends PrismaUser {} // Merges Prisma's User fields (like 'role') into NextAuth's User
}

declare module "next/server" {
  interface NextRequest {
    auth: {
      user: User
    } | null
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    username: string;
  }
}
