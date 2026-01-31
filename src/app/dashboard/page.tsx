"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUserClient } from "@/hook/use-current-user";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "../loading";

export default function Home() {
  const { user: session, status } = useCurrentUserClient();
  const router = useRouter();

  const onLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="">
      <div>{JSON.stringify(session)}</div>
      <Button variant="outline" type="submit" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
}
