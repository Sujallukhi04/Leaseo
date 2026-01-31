"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all bg-transparent duration-300 py-4 px-6 md:px-12 flex items-center justify-between",
                scrolled || mobileMenuOpen ? "bg-black/90 backdrop-blur-md border-b border-white/10" : "bg-transparent"
            )}
        >
            {/* Logo - Neon/Bold */}
            <div className="flex items-center gap-2 z-50">
                <span className="text-2xl font-extrabold tracking-tighter text-white italic">
                    LEASEO<span className="text-[#ceef00]">.</span>
                </span>
            </div>

            {/* Desktop Links - Minimalist */}
            <div className="hidden md:flex items-center gap-12">
                {["GEAR", "DROPS", "ABOUT", "LOGIN"].map((link) => (
                    <Link
                        key={link}
                        href="#"
                        className="text-sm font-bold tracking-widest text-white/70 hover:text-[#ceef00] transition-colors uppercase"
                    >
                        {link}
                    </Link>
                ))}
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-[#ceef00] transition-colors group">
                    <span className="text-black font-bold group-hover:text-black">GO</span>
                </div>
            </div>

            {/* Mobile Toggle */}
            <button
                className="md:hidden text-white z-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-8 z-40">
                    {["GEAR", "DROPS", "ABOUT", "LOGIN"].map((link) => (
                        <Link
                            key={link}
                            href="#"
                            className="text-4xl font-black italic text-white hover:text-[#ceef00] transition-colors uppercase tracking-tighter"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
