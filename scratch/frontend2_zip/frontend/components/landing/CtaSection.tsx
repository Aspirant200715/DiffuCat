"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ParallaxWrapper from "./ParallaxWrapper";

export default function CtaSection() {
  return (
    <section id="cta" className="min-h-screen flex items-center justify-center">
      <ParallaxWrapper speed={0.02} className="w-full max-w-4xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold mb-4">Join the green chemistry revolution</h2>
          <p className="text-sm text-foreground/80 mb-8">Start discovering catalysts with uncertainty-aware generative AI and active lab workflows.</p>
          <Link href="/dashboard" className={cn(buttonVariants({ size: 'lg' }), 'px-10 py-5 rounded-xl bg-primary text-white')}>Start Discovery →</Link>
        </div>
      </ParallaxWrapper>
    </section>
  );
}
