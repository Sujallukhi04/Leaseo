import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: "ADMIN" | "VENDOR" | "CUSTOMER";
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    id: string;
    role?: "ADMIN" | "VENDOR" | "CUSTOMER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    sub: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    role?: "ADMIN" | "VENDOR" | "CUSTOMER";
  }
}
