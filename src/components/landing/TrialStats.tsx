"use client";

import { cn } from "@/lib/utils";

export function TrialStats() {
    return (
        <section className="bg-white py-12 border-b border-slate-100">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Stat Card 1 */}
                    <div className="bg-slate-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">Total Sales</span>
                        <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            ₹2,30,00,000
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-sky-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-sky-100">
                        <span className="text-sm font-semibold uppercase tracking-wider text-sky-700 mb-2">Your Credits</span>
                        <div className="text-4xl md:text-5xl font-black text-sky-700 tracking-tight">
                            +₹2,30,000
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
