import { useSession } from "next-auth/react";

type User = {
  name: string;
  email: string;
  image: string | null;
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
};

export function useCurrentUserClient(): {
  user: User | null | undefined;
  status: "loading" | "authenticated" | "unauthenticated";
} {
  const session = useSession();
  //@ts-ignore
  return { user: session.data?.user ?? null, status: session.status };
}
