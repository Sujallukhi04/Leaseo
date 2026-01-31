"use client";

import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-black py-20 border-t border-white/10">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Top Section: CTA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 border-b border-white/10 pb-20">
                    <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase max-w-2xl">
                        READY TO <br /><span className="text-neutral-800">START?</span>
                    </h2>

                    <div className="mt-8 md:mt-0">
                        <p className="text-neutral-400 mb-6 max-w-sm">Join the rental revolution. Access verified premium gear today.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="ENTER EMAIL"
                                className="bg-white/5 border border-white/10 px-6 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-[#ceef00] w-full md:w-80 font-mono text-sm"
                            />
                            <button className="bg-[#ceef00] px-6 py-4 text-black hover:bg-white transition-colors">
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
                    {[
                        { title: "PLATFORM", links: ["Browse Gear", "How it Works", "Pricing", "Insurance"] },
                        { title: "COMPANY", links: ["About Us", "Careers", "Press", "Contact"] },
                        { title: "COMMUNITY", links: ["Blog", "Events", "Referral", "Merch"] },
                        { title: "LEGAL", links: ["Privacy", "Terms", "Sitemap", "Cookies"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-neutral-500 hover:text-[#ceef00] transition-colors font-medium text-sm uppercase">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-white italic">LEASEO</span>
                        <span className="text-neutral-600 text-sm">© 2026</span>
                    </div>

                    <div className="flex gap-6">
                        {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="text-neutral-600 hover:text-white transition-colors">
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
