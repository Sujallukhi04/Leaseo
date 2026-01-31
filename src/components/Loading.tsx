"use client";

import { Spinner } from "@/components/ui/spinner";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Spinner size can be adjusted with className */}

      <div className={`text-sky-500 font-bold text-6xl tracking-tighter ${dancingScript.className} animate-pulse`}>
        Leaseo
      </div>
    </div>
  );
};

export default Loading;
