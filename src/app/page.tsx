import { TrialHero } from "@/components/landing/TrialHero";
import { TrialStats } from "@/components/landing/TrialStats";
import { TrialFeatures } from "@/components/landing/TrialFeatures";
import { TrialTestimonial } from "@/components/landing/TrialTestimonial";
import { TrialFAQ } from "@/components/landing/TrialFAQ";
import { TrialFooter } from "@/components/landing/TrialFooter";
import { TrialNavbar } from "@/components/landing/TrialNavbar";
import { FloatingTrialCTA } from "@/components/landing/FloatingTrialCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-sky-200 selection:text-sky-900">
      <TrialNavbar />
      <FloatingTrialCTA />

      <TrialHero />
      <TrialStats />
      <TrialFeatures />
      <TrialTestimonial />
      <TrialFAQ />
      <TrialFooter />
    </main>
  );
}
