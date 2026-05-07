"use client";

import Hero from "@/components/hero/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ImpactSection from "@/components/landing/ImpactSection";
import CtaSection from "@/components/landing/CtaSection";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <div className="bg-background/0">
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ImpactSection />
        <CtaSection />
      </div>
    </main>
  );
}
