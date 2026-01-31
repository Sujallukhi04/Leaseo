"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function FloatingTrialCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Trigger after scrolling past the hero (100vh)
            const triggerPoint = window.innerHeight - 180;
            setIsVisible(window.scrollY > triggerPoint);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            className={cn(
                "fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 transition-all duration-700 ease-in-out transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0"
            )}
        >
            <div className="bg-black text-white rounded-[2rem] px-8 py-6 shadow-2xl w-full max-w-[480px] flex flex-col gap-4 border border-white/10">
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold mb-1">Start for free</h2>
                    <p className="text-xs text-gray-400 font-medium">
                        You agree to receive marketing emails.
                    </p>
                </div>

                <div className="relative w-full">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full h-12 pl-5 pr-12 rounded-full bg-[#1a1a1a] border border-[#333] text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    />
                    <Link href="/auth/signup" className="absolute right-1 top-1 bottom-1 aspect-square rounded-full flex items-center justify-center transition-colors group z-10">
                        <ArrowRight className="w-5 h-5 text-white transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
