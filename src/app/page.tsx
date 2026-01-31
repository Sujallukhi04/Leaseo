"use client";

import { useCurrentUserClient } from "@/hook/use-current-user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Home() {
  const { user: session, status } = useCurrentUserClient();
  
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-8 p-4 text-center">
      <h1 className="text-5xl font-bold tracking-tighter">Rental Management System</h1>
      <p className="text-zinc-400 max-w-[600px] text-lg">
        Manage your rental business with ease. Track products, orders, customers and invoices in one place.
      </p>

      <div className="flex gap-4">
        {session ? (
          <>
            <Link href="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                Go to Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900 px-8" onClick={() => signOut()}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900 px-8">
                Sign Up
              </Button>
            </Link>
            <Link href="/auth/vendor-signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                Become a Vendor
              </Button>
            </Link>
          </>
        )}
      </div>

      {session && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-left max-w-md w-full">
          <h3 className="text-sm font-bold mb-2 text-zinc-500 uppercase tracking-widest">Logged in as</h3>
          <p className="font-medium">{session.name}</p>
          <p className="text-zinc-400 text-sm">{session.email}</p>
          <p className="mt-2 inline-block px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
            {session.role}
          </p>
        </div>
      )}
    </div>
  );
}
