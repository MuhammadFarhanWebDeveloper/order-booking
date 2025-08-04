import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as Role,
          username: token.username as string,
        };
      }
      return session;
    },
  },
  trustHost: true,
  providers: [],
} satisfies Partial<NextAuthConfig>; // ✅ use Partial to avoid the 'providers' type error
