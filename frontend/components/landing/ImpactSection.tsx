"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ParallaxWrapper from "./ParallaxWrapper";

export default function ImpactSection() {
  return (
    <section id="impact" className="min-h-screen flex items-center justify-center">
      <ParallaxWrapper speed={0.03} className="w-full max-w-4xl px-6">
        <Card className="glass-panel hud-border">
          <CardHeader>
            <CardTitle>Impact</CardTitle>
            <CardDescription>Scaling sustainable chemistry</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80">Every efficient catalyst discovered can meaningfully reduce emissions or enable greener processes at scale. DiffuCat aims to accelerate those discoveries by orders of magnitude.</p>
          </CardContent>
        </Card>
      </ParallaxWrapper>
    </section>
  );
}
