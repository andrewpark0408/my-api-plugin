import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    realmId?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      realmId?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.authType !== "manual") {
          throw new Error("No user found with this email");
        }

        if (credentials.password !== user.password) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          realmId: user.realmId,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // 🔹 Ensure realmId is retrieved every time the session is accessed
    async session({ session, token }) {
      console.log("🔍 Debugging session callback:", token);

      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { realmId: true, role: true },
        });

        session.user.realmId = dbUser?.realmId || null; // ✅ Always fetch from DB
        session.user.role = dbUser?.role || "user";
      }

      console.log("✅ Updated session with realmId:", session.user.realmId);
      return session;
    },

    // 🔹 Ensure realmId is persisted in the JWT token
    async jwt({ token, user }) {
      if (user) {
        console.log("🔍 Storing realmId in JWT:", user.realmId);
        token.realmId = user.realmId;
        token.role = user.role;
      } else {
        // If the user is already logged in, fetch the latest realmId from DB
        const userFromDB = await prisma.user.findUnique({
          where: { email: token.email },
          select: { realmId: true, role: true },
        });

        token.realmId = userFromDB?.realmId || null;
        token.role = userFromDB?.role || "user";
      }

      return token;
    },
  },

  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
};


const handler = NextAuth(authOptions);
export { handler, handler as GET, handler as POST };
