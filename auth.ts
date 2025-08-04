import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { compare } from "bcrypt";
import { Role, User } from "@prisma/client";
import { authConfig } from "./auth.config";

export const { signIn, signOut, auth, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials:
          | Partial<Record<"username" | "password", unknown>>
          | undefined
      ): Promise<User | null> {
        if (
          !credentials ||
          typeof credentials.username !== "string" ||
          typeof credentials.password !== "string"
        ) {
          console.warn("Missing or invalid credentials");
          throw new Error("Missing or invalid credentials");
        }

        if (credentials.password.length < 5) {
          throw new Error("Password must be at least 5 characters long");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          if (!user || !user.id) {
            throw new Error("User not found or invalid ID");
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
           throw new Error("Invalid credentials");
          }

          return user;
        } catch (error) {
          throw new Error("Something went wrong");
        }
      },
    }),
  ],

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
});
