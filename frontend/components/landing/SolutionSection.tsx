"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ParallaxWrapper from "./ParallaxWrapper";

export default function SolutionSection() {
  return (
    <section id="solution" className="min-h-screen flex items-center justify-center">
      <ParallaxWrapper speed={0.06} className="w-full max-w-4xl px-6">
        <Card className="glass-panel hud-border">
          <CardHeader>
            <CardTitle>Our Solution</CardTitle>
            <CardDescription>Generate → Predict → Validate → Learn</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80">An end-to-end pipeline: generative models propose candidates, predictive models estimate multi-objective metrics with uncertainties, then lab jobs validate top candidates. The loop is closed with active learning to prioritize experiments.</p>
          </CardContent>
        </Card>
      </ParallaxWrapper>
    </section>
  );
}
