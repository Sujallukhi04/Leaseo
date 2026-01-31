"use client";

export function TrialTestimonial() {
    return (
        <section className="bg-slate-50 py-24 border-y border-slate-200">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <blockquote className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-10 font-serif italic">
                    "We've tripled in size since we first started on Leaseo. It gives us the tools we need to keep pushing forward."
                </blockquote>

                <div className="flex flex-col items-center gap-1">
                    <cite className="not-italic text-lg font-bold text-slate-900">Clare Jerome</cite>
                    <span className="text-slate-500 font-medium">NEOM Wellbeing</span>
                </div>
            </div>
        </section>
    );
}
