"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ParallaxWrapper from "./ParallaxWrapper";

export default function FeaturesSection() {
  return (
    <section id="features" className="min-h-screen flex items-center justify-center">
      <ParallaxWrapper speed={0.04} className="w-full max-w-4xl px-6">
        <Card className="glass-panel hud-border">
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Multi-objective optimization, uncertainty quantification, explainability</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <li className="p-3 rounded-md bg-muted/20">Generative proposals</li>
              <li className="p-3 rounded-md bg-muted/20">Predictive uncertainty</li>
              <li className="p-3 rounded-md bg-muted/20">Active learning prioritization</li>
            </ul>
          </CardContent>
        </Card>
      </ParallaxWrapper>
    </section>
  );
}
