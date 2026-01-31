"use client";

import Link from "next/link";

export function TrialFooter() {
    return (
        <footer className="bg-white py-12 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-slate-500 font-medium">
                <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-slate-900 transition-colors">Sitemap</Link>
                <Link href="#" className="hover:text-slate-900 transition-colors">Your Privacy Choices</Link>
            </div>
        </footer>
    );
}
