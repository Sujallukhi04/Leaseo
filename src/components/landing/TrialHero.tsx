"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dancing_Script } from "next/font/google";
import { motion } from "framer-motion";

const dancingScript = Dancing_Script({ subsets: ["latin"] });

export function TrialHero() {
    return (
        <section className="relative w-full h-[100vh] overflow-hidden bg-[#e6e8ea]">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    src="/leaseo-video.webm"
                />
                <div className="absolute inset-0 bg-black/10" /> {/* Slight overlay for better text contrast if needed */}
            </div>

            {/* Central Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">

                <motion.div
                    initial={{ y: 600, opacity: 1 }}
                    animate={{ y: 40, opacity: 1 }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                        delay: 2.2 // Wait for intro animation (approx 2.5s total duration)
                    }}
                    className="flex flex-col gap-2 w-full max-w-[480px]"
                >
                    {/* Top Card: White */}
                    <div className="bg-white rounded-[2rem] px-10 py-4 text-left shadow-2xl">
                        <h1 className="text-4xl md:text-[2.75rem] font-semibold text-slate-900 tracking-tight mb-4 leading-[1.05]">
                            Your business starts with <span className={`text-sky-500 ${dancingScript.className} text-6xl`}>Leaseo</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-sm mx-auto leading-normal">
                            Try 3 days free, then ₹20/month for 3 months. <br />
                            What are you waiting for?
                        </p>
                    </div>
                </motion.div>
                
                <motion.div
                    initial={{ y: 600, opacity: 1 }}
                    animate={{ y: 50, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 2.2 // Wait for intro animation (approx 2.5s total duration)
                    }}
                    className="flex flex-col gap-2 w-full max-w-[480px]"
                >
                    {/* Bottom Card: Black */}
                    <div className="bg-black text-white rounded-[2rem] px-10 py-4 shadow-2xl">
                        <div className="max-w-sm mx-auto">
                            <h2 className="text-2xl font-semibold mb-1">Start for free</h2>
                            <p className="text-2xs text-gray-400 mb-2 font-medium">
                                You agree to receive marketing emails.
                            </p>

                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full h-12 pl-5 pr-12 rounded-full bg-[#1a1a1a] border border-[#333] text-base text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
                                />
                                <Link href="/auth/signup" className="absolute right-1 top-1 bottom-1 aspect-square rounded-full flex items-center justify-center transition-colors group">
                                    <ArrowRight className="w-5 h-5 text-white transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
