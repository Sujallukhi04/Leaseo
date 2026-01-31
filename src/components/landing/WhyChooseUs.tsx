"use client";

import { Shield, Zap, RefreshCcw, Box } from "lucide-react";

export function WhyChooseUs() {
    return (
        <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
            <div className="max-w-[1400px] mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                    {[
                        { icon: Shield, title: "VERIFIED", desc: "100% Quality Checked" },
                        { icon: Zap, title: "INSTANT", desc: "Book in Seconds" },
                        { icon: Box, title: "DELIVERED", desc: "Straight to Doorstep" },
                        { icon: RefreshCcw, title: "FLEXIBLE", desc: "Upgrade Anytime" }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-black p-10 flex flex-col items-center text-center group hover:bg-[#ceef00] transition-colors duration-300">
                            <item.icon className="w-12 h-12 text-white mb-6 group-hover:text-black transition-colors" />
                            <h3 className="text-xl font-black text-white italic uppercase tracking-widest mb-2 group-hover:text-black">
                                {item.title}
                            </h3>
                            <p className="text-neutral-500 font-mono text-sm group-hover:text-black/80">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
