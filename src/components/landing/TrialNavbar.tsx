"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export function TrialNavbar() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent h-20 flex items-center justify-between px-6 md:px-12">
            <div className="flex items-center gap-2">
                {/* <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                </div> */}
                <span className={`text-4xl font-bold tracking-tight text-white ${dancingScript.className}`}>Leaseo</span>
            </div>

            <div className="flex items-center gap-6">
                <Link href="#" className="hidden md:block text-sm font-medium text-white hover:text-sky-500 transition-colors">
                    Contact Support
                </Link>
                <Link href="/auth/login" className="text-sm font-medium text-white hover:text-sky-500 transition-colors">
                    Log in
                </Link>
            </div>
        </nav>
    );
}
