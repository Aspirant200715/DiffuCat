"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ParallaxWrapper from "./ParallaxWrapper";

export default function ProblemSection() {
  return (
    <section id="problem" className="min-h-screen flex items-center justify-center">
      <ParallaxWrapper speed={0.08} className="w-full max-w-4xl px-6">
        <Card className="glass-panel hud-border">
          <CardHeader>
            <CardTitle>The Problem</CardTitle>
            <CardDescription>Years of trial-and-error slow down discovery.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80">Catalyst discovery traditionally requires multiple iterations and expensive lab runs. DiffuCat compresses the iterate-predict-validate loop using generative models, uncertainty quantification, and active learning.</p>
          </CardContent>
        </Card>
      </ParallaxWrapper>
    </section>
  );
}
