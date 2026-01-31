"use client";

import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
    return (
        <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image / Texture */}
            <div className="absolute inset-0 z-0 opacity-60">
                <img
                    src="https://images.unsplash.com/photo-1635072051606-c56306863110?q=80&w=2670&auto=format&fit=crop"
                    alt="Dark Geometric Background"
                    className="w-full h-full object-cover grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
            </div>

            {/* Content Content */}
            <div className="relative z-20 w-full max-w-7xl px-6 flex flex-col items-center text-center">
                {/* Pre-title */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-[2px] w-12 bg-[#ceef00]" />
                    <span className="text-[#ceef00] font-bold tracking-[0.3em] text-sm uppercase">The Future of Access</span>
                    <div className="h-[2px] w-12 bg-[#ceef00]" />
                </div>

                {/* Main Title - Huge & Italic */}
                <h1 className="text-6xl md:text-9xl font-black text-white italic tracking-tighter mb-8 leading-[0.9]">
                    OWN THE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">MOMENT</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl font-light tracking-wide">
                    Rent premium gear. Experience everything. <br />
                    <span className="text-white font-medium">No commitments. Just speed.</span>
                </p>

                {/* Buttons */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <button className="group relative px-8 py-4 bg-[#ceef00] text-black font-bold text-lg uppercase tracking-wider overflow-hidden clip-path-slant min-w-[200px]">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Start Renting <ArrowRight className="w-5 h-5" />
                        </span>
                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    </button>

                    <button className="px-8 py-4 border border-white/20 text-white font-bold text-lg uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-sm">
                        <Play className="w-5 h-5 fill-current" /> Watch Film
                    </button>
                </div>
            </div>

            {/* Bottom Scroller / Ticker */}
            <div className="absolute bottom-10 left-0 right-0 z-20 border-t border-white/10 pt-4 overflow-hidden">
                <div className="flex justify-center items-center gap-12 text-white/30 font-bold text-sm tracking-[0.2em] uppercase">
                    <span>Gaming</span>
                    <span className="w-1 h-1 bg-[#ceef00] rounded-full" />
                    <span>Cameras</span>
                    <span className="w-1 h-1 bg-[#ceef00] rounded-full" />
                    <span>Drones</span>
                    <span className="w-1 h-1 bg-[#ceef00] rounded-full" />
                    <span>Travel</span>
                    <span className="w-1 h-1 bg-[#ceef00] rounded-full" />
                    <span>Fitness</span>
                </div>
            </div>
        </div>
    );
}
