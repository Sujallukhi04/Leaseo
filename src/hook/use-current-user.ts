import { useSession } from "next-auth/react";
import getServerSession from "next-auth";
import { authConfig } from "@/auth.config";

type User = {
  name: string;
  email: string;
  image: string | null;
  id: string;
  role?: string | null; // e.g., 'VENDOR' | 'CUSTOMER'
};

export function useCurrentUserClient(): {
  user: User | null | undefined;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const session = useSession();
  //@ts-ignore
  return { user: session.data?.user ?? null, status: session.status };
}

// Server-side helper to get the currently authenticated user in server components/actions
export async function currentUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authConfig as any);
    // The return type from getServerSession may vary between versions; cast to any to access .user
    return ((session as any)?.user as User) ?? null;
  } catch (err) {
    return null;
  }
} 
