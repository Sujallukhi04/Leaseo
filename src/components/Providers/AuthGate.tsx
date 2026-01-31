"use client";

import { useCurrentUserClient } from "@/hook/use-current-user";
import Loading from "../Loading";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useCurrentUserClient();

  if (status === "loading") {
    return <Loading />;
  }

  return <>{children}</>;
}
