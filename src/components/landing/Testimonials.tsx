"use client";

import { Quote } from "lucide-react";

const REVIEWS = [
    {
        id: 1,
        name: "SARAH J.",
        role: "CREATOR",
        quote: "The gear quality is insane. It felt like unboxing brand new equipment.",
    },
    {
        id: 2,
        name: "RAHUL V.",
        role: "DEV",
        quote: "Fastest delivery I've ever experienced. Setup was plug and play.",
    },
    {
        id: 3,
        name: "EMILY C.",
        role: "NOMAD",
        quote: "Total freedom. I rent what I need, return when I'm done. Zero clutter.",
    }
];

export function Testimonials() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Abstract Bg Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ceef00]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter text-center mb-20">
                    THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ceef00] to-green-500">COMMUNITY</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="bg-neutral-900/50 backdrop-blur-sm p-10 border border-white/5 hover:border-[#ceef00]/50 transition-colors group">
                            <Quote className="w-8 h-8 text-[#ceef00] mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <p className="text-2xl text-white font-bold italic tracking-tight mb-8 leading-tight">
                                "{review.quote}"
                            </p>

                            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-black">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white uppercase tracking-wider text-sm">{review.name}</h4>
                                    <p className="text-xs text-[#ceef00] font-mono uppercase">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
