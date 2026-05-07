"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dna, Info } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Molecule3DViewer = dynamic(
  () => import("@/components/visualization/Molecule3DViewer"),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">Loading 3D Context...</div> }
);

export default function MoleculePage({ params }: { params: { id: string } }) {
  const smiles = decodeURIComponent(params.id);

  // Deterministic simulation for dynamic scores
  const getScore = (salt: string) => {
    const sum = smiles.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + salt.length;
    return (sum % 100) / 100;
  };

  const saScore = getScore("sa");
  const confidence = 85 + (getScore("conf") * 14);
  const mw = 100 + (getScore("mw") * 400);

  return (
    <div className="container max-w-screen-2xl py-6 space-y-6 flex flex-col h-full relative">
      <div className="absolute top-0 left-0 w-full h-full hex-pattern opacity-10 pointer-events-none -z-10" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 font-mono">
                {smiles}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-primary/60 font-mono text-[10px] uppercase tracking-[0.2em]">[3D Conformation Analysis]</span>
              <Badge variant="outline" className="text-[9px] border-primary/20 text-primary/60 px-1.5 h-4">ACTIVE_STREAM</Badge>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Molecular Weight</p>
            <p className="text-lg font-bold font-mono">{mw.toFixed(2)} <span className="text-xs text-muted-foreground">g/mol</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        <div className="lg:col-span-3">
          <Card className="h-full min-h-[600px] border-primary/20 shadow-2xl glass-panel flex flex-col overflow-hidden relative group hud-border">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] -z-10 rounded-full" />
            <CardHeader className="absolute top-0 w-full z-10 bg-gradient-to-b from-background/90 to-transparent border-none pb-12 pointer-events-none backdrop-blur-[2px]">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xs font-mono uppercase tracking-[0.3em] flex items-center gap-2 pointer-events-auto text-primary/70">
                  <Dna className="w-4 h-4 text-primary animate-pulse" />
                  Structure // HUD Output
                </CardTitle>
                <div className="flex gap-2 pointer-events-auto">
                  <div className="flex items-center gap-4 mr-4 text-[10px] font-mono text-primary/40 hidden xl:flex">
                    <span>X: 124.02</span>
                    <span>Y: -12.44</span>
                    <span>Z: 0.00</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-background/50 backdrop-blur border-primary/20 font-mono text-primary/70 uppercase">Right-Click to Pan</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <Molecule3DViewer smiles={smiles} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-xl glass-panel relative overflow-hidden hud-border">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -z-10 rounded-full" />
            <CardHeader className="border-b border-primary/10 bg-muted/30">
              <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3 text-primary" />
                Structural Descriptors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span>Synthetic Accessibility</span>
                  <span className="text-primary">{saScore > 0.7 ? 'High' : saScore > 0.4 ? 'Moderate' : 'Complex'}</span>
                </div>
                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden hud-border">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-1000" 
                    style={{ width: `${saScore * 100}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span>Confidence Index</span>
                  <span className="energy-text-neutral font-bold">{confidence.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden hud-border">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000" 
                    style={{ width: `${confidence}%` }} 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-primary/10">
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-3">Counterfactual Hint</p>
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-start gap-3 group hover:bg-primary/10 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 animate-ping" />
                  <p className="text-xs font-medium text-primary/90 leading-relaxed">
                    {saScore > 0.5 ? `Consider substituting functional group at C${Math.floor(saScore * 10)} to optimize binding energy.` : 'Structure shows high stability; focus on selectivity tuning.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-xl glass-panel relative overflow-hidden hud-border">
            <CardHeader className="border-b border-primary/10 bg-muted/30">
              <CardTitle className="text-xs font-mono uppercase tracking-widest">Molecular Signature</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-8 gap-1.5">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-full aspect-square rounded-[2px] transition-all duration-500",
                      (getScore(`bit-${i}`) > 0.5) ? "bg-primary shadow-[0_0_8px_rgba(14,165,233,0.4)]" : "bg-muted/20"
                    )} 
                  />
                ))}
              </div>
              <p className="mt-4 text-[9px] font-mono text-muted-foreground uppercase text-center tracking-widest">
                Latent Representation Hash [32-BIT]
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="space-y-4 pt-6 border-t border-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-[0.3em] text-primary/70">Similar Candidates // Recommendations</h3>
          <div className="h-px flex-1 mx-6 bg-gradient-to-r from-primary/30 to-transparent" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { name: "Propanol", smiles: "CCCO" },
            { name: "Methane", smiles: "C" },
            { name: "Toluene", smiles: "Cc1ccccc1" },
            { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
            { name: "Ibuprofen", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" }
          ].map((mol, i) => (
            <Link 
              key={i}
              href={`/molecules/${encodeURIComponent(mol.smiles)}`}
              className="group relative glass-panel border-primary/10 hud-border p-4 hover:border-primary/40 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{mol.name}</span>
                <span className="text-xs font-mono text-primary/80 truncate">{mol.smiles}</span>
                <div className="mt-2 flex justify-between items-center">
                  <div className="h-1 w-12 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40" style={{ width: `${40 + Math.random() * 50}%` }} />
                  </div>
                  <ArrowLeft className="w-3 h-3 rotate-180 text-primary/0 group-hover:text-primary transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
