"use client";

import { ArrowUpRight } from "lucide-react";

// Mock Data
const PRODUCTS = [
    {
        id: 1,
        title: "MACBOOK PRO M3",
        category: "COMPUTE",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=2526&auto=format&fit=crop",
        price: "1999"
    },
    {
        id: 2,
        title: "CANON EOS R5",
        category: "CAPTURE",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2200&auto=format&fit=crop",
        price: "1499"
    },
    {
        id: 3,
        title: "AERON CHAIR",
        category: "COMFORT",
        image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=2618&auto=format&fit=crop",
        price: "499"
    },
    {
        id: 4,
        title: "EXPEDITION TENT",
        category: "EXPLORE",
        image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2670&auto=format&fit=crop",
        price: "299"
    }
];

export function FeaturedSection() {
    return (
        <section className="py-24 bg-black">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-8">
                    <div>
                        <span className="text-[#ceef00] font-mono mb-2 block">// TRENDING</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                            LATEST DROPS
                        </h2>
                    </div>
                    <button className="hidden md:flex items-center gap-2 text-white font-bold hover:text-[#ceef00] transition-colors uppercase tracking-widest text-sm">
                        View Full Collection <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PRODUCTS.map((product) => (
                        <div key={product.id} className="group relative block cursor-pointer">
                            {/* Image Container */}
                            <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden mb-4">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                                <div className="absolute top-4 left-4 bg-[#ceef00] text-black text-xs font-bold px-3 py-1 uppercase tracking-wider">
                                    {product.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-1 group-hover:text-[#ceef00] transition-colors">
                                    {product.title}
                                </h3>
                                <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                    <span className="text-neutral-500 font-mono text-sm">RENTAL PRICE</span>
                                    <span className="text-white font-bold text-lg">₹{product.price}<span className="text-xs text-neutral-500 font-normal">/mo</span></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <button className="px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-wider w-full">
                        View All
                    </button>
                </div>
            </div>
        </section>
    );
}
