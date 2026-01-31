import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { SigninSchema } from "./lib";
import bcrypt from "bcryptjs";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  events: {
    async linkAccount({ user }) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      } catch (error) {
        console.error(
          "Failed to update emailVerified during linkAccount:",
          error
        );
      }
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as "ADMIN" | "VENDOR" | "CUSTOMER";
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db.user.findUnique({
            // @ts-ignore
            where: { email: user?.email },
          });

          if (existingUser) {
            if (!existingUser.emailVerified) {
              await db.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              });
            }

            return true;
          } else {
            return true;
          }
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { id: user.id },
        });

        // Prevent sign in without email verification
        if (!existingUser || !existingUser.emailVerified) return false;

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
  session: { strategy: "jwt" },
  adapter: PrismaAdapter(db),
  providers: [
    ...authConfig.providers!,
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        // 1. Check for token-based login (Email Verification Auto-Login)
        if (credentials.token && credentials.email) {
          const { token, email } = credentials;

          // Fetch token from DB
          const verificationToken = await db.token.findFirst({
            where: { token, type: "EmailVerification" },
          });

          if (
            !verificationToken ||
            verificationToken.email !== email ||
            new Date(verificationToken.expires) < new Date()
          ) {
            return null;
          }

          // Fetch user
          const user = await db.user.findUnique({ where: { email } });

          if (!user) return null;

          // Delete the token now that it has been used for login
          await db.token.delete({ where: { id: verificationToken.id } });

          return user;
        }

        // 2. Default Password Login
        const validatedFields = SigninSchema.safeParse(credentials);

        if (validatedFields.error) return null;

        const { email, password } = validatedFields.data;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return null;

        return user;
      },
    }),
  ],
});
