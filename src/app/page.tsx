"use client";

import { useCurrentUserClient } from "@/hook/use-current-user";

export default function Home() {
  const { user: session, status } = useCurrentUserClient();
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <pre>{JSON.stringify(session)}</pre>
    </div>
  );
}
