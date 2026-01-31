"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "../ui/sonner";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        forcedTheme="dark" // Dark mode only
        disableTransitionOnChange // Avoid flash on hydration
      >
        {children}
        <Toaster richColors theme="dark" />
      </NextThemesProvider>
    </SessionProvider>
  );
}
