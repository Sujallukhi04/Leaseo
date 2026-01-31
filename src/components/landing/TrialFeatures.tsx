"use client";

import { Palette, PiggyBank, Sparkles, LifeBuoy } from "lucide-react";

const FEATURES = [
    {
        icon: Palette,
        title: "Create a stunning store in seconds",
        description: "Pre-built designs make it fast and easy to kickstart your brand."
    },
    {
        icon: PiggyBank,
        title: "Your plan can pay for itself",
        description: "Turn sales into savings with 0.5% back as subscription credits."
    },
    {
        icon: Sparkles,
        title: "Level up with an AI assistant",
        description: "Selling is easy with a built-in business partner who can help scale your vision."
    },
    {
        icon: LifeBuoy,
        title: "Support whenever you need it",
        description: "Leaseo offers help 24/7 so your business never stops running smoothly."
    }
];

export function TrialFeatures() {
    return (
        <section className="bg-white py-24">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
                    {FEATURES.map((feature, index) => (
                        <div key={index} className="flex flex-col items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center mb-2">
                                <feature.icon className="w-6 h-6 text-sky-500" />
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                                {feature.title}
                            </h3>
                            <p className="text-xl text-slate-600 font-medium leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
