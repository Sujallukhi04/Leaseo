"use client";

import { useCurrentUserClient } from "@/hook/use-current-user";
import Loading from "../Loading";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGate({ 
  children,
  allowedRole
}: { 
  children: React.ReactNode;
  allowedRole?: UserRole;
}) {
  const { user, status } = useCurrentUserClient();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && allowedRole && user?.role !== allowedRole) {
      router.push("/dashboard"); // Redirect to main dashboard if role mismatch
    }
  }, [status, user, allowedRole, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
