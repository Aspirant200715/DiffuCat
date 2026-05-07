"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, ArrowRight, FlaskConical, Beaker, Sun, Moon, Sparkles, Microscope, TestTubes, Thermometer, Dna } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";


export default function LandingPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden perspective">
      {/* Dynamic Background Elements - High Visibility */}
      <div className="absolute inset-0 bg-background z-0 overflow-hidden hex-pattern-vibrant opacity-25" />
      <div className="absolute inset-0 bg-background z-0 overflow-hidden chem-bg opacity-35" />
      
      {/* Dense Orbit of 3D Atoms - NO BENZENE RINGS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Orbit */}
        <div className="absolute top-[8%] left-[15%] w-32 h-32 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-3xl shadow-2xl" style={{ '--sphere-color': '#38bdf8', '--sphere-glow': 'rgba(56, 189, 248, 0.8)' } as React.CSSProperties}>Fe</div>
        <div className="absolute top-[5%] left-[45%] w-24 h-24 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-2xl shadow-2xl" style={{ '--sphere-color': '#fbbf24', '--sphere-glow': 'rgba(251, 191, 36, 0.8)', animationDelay: '1s' } as React.CSSProperties}>Au</div>
        <div className="absolute top-[8%] right-[15%] w-32 h-32 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-3xl shadow-2xl" style={{ '--sphere-color': '#6366f1', '--sphere-glow': 'rgba(99, 102, 241, 0.8)', animationDelay: '0.5s' } as React.CSSProperties}>H</div>
        
        {/* Mid Orbit (Outer) */}
        <div className="absolute top-[40%] left-[5%] w-28 h-28 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-2xl shadow-2xl" style={{ '--sphere-color': '#ef4444', '--sphere-glow': 'rgba(239, 68, 68, 0.8)', animationDelay: '2s' } as React.CSSProperties}>Cl</div>
        <div className="absolute top-[40%] right-[5%] w-28 h-28 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-2xl shadow-2xl" style={{ '--sphere-color': '#22c55e', '--sphere-glow': 'rgba(34, 197, 94, 0.8)', animationDelay: '1.5s' } as React.CSSProperties}>Ne</div>
        
        {/* Bottom Orbit */}
        <div className="absolute bottom-[10%] left-[15%] w-30 h-30 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-2xl shadow-2xl" style={{ '--sphere-color': '#10b981', '--sphere-glow': 'rgba(16, 185, 129, 0.8)', animationDelay: '2.5s' } as React.CSSProperties}>O</div>
        <div className="absolute bottom-[5%] left-[45%] w-26 h-26 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-xl shadow-2xl" style={{ '--sphere-color': '#94a3b8', '--sphere-glow': 'rgba(148, 163, 184, 0.8)', animationDelay: '0.2s' } as React.CSSProperties}>Ag</div>
        <div className="absolute bottom-[10%] right-[15%] w-28 h-28 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-xl shadow-2xl" style={{ '--sphere-color': '#f59e0b', '--sphere-glow': 'rgba(245, 158, 11, 0.8)', animationDelay: '3s' } as React.CSSProperties}>N</div>
        <div className="absolute bottom-[35%] left-[20%] w-20 h-20 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-lg shadow-2xl" style={{ '--sphere-color': '#f97316', '--sphere-glow': 'rgba(249, 115, 22, 0.8)', animationDelay: '1.2s' } as React.CSSProperties}>P</div>
        <div className="absolute top-[35%] right-[20%] w-20 h-20 atom-sphere animate-float-fast flex items-center justify-center font-black text-white text-lg shadow-2xl" style={{ '--sphere-color': '#0ea5e9', '--sphere-glow': 'rgba(14, 165, 233, 0.8)', animationDelay: '2.8s' } as React.CSSProperties}>C</div>
      </div>

      {/* Lab Gear - Widely Spaced to absolute edges to avoid overlaps */}
      <div className="absolute top-[15%] left-[25%] text-primary/40 animate-float-fast"><FlaskConical className="w-10 h-10" /></div>
      <div className="absolute top-[15%] right-[25%] text-sky-400/40 animate-float-fast" style={{ animationDelay: '1s' }}><Thermometer className="w-8 h-8" /></div>
      <div className="absolute bottom-[20%] left-[20%] text-rose-500/40 animate-float-fast" style={{ animationDelay: '2s' }}><TestTubes className="w-10 h-10" /></div>
      <div className="absolute bottom-[20%] right-[20%] text-emerald-500/40 animate-float-fast" style={{ animationDelay: '3s' }}><Beaker className="w-12 h-12" /></div>
      <div className="absolute bottom-[5%] left-[35%] text-amber-500/40 animate-float-fast"><Microscope className="w-12 h-12" /></div>
      <div className="absolute top-[5%] right-[40%] text-indigo-400/40 animate-float-fast"><Dna className="w-10 h-10" /></div>
      <div className="absolute top-[10%] left-[45%] text-emerald-400/40 animate-float-fast" style={{ animationDelay: '2.5s' }}><Activity className="w-8 h-8" /></div>

      {/* Top Bar for Theme Toggle */}
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full hud-border bg-background/50 backdrop-blur-xl border-primary/40 hover:border-primary transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)]"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto preserve-3d card-3d">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Link href="/" className="relative w-24 h-24 mx-auto mb-10 group block">
            <div className="absolute inset-0 bg-primary/40 rounded-3xl blur-3xl group-hover:bg-primary/60 transition-all duration-500 animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-background/80 border border-primary/50 flex items-center justify-center backdrop-blur-2xl shadow-2xl molecular-glow group-hover:scale-110 transition-transform duration-500">
              <Activity className="h-12 w-12 text-primary animate-pulse" />
              {/* Mini Reaction Particles */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_15px_rgba(16,185,129,1)]" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-indigo-500 rounded-full animate-ping shadow-[0_0_15px_rgba(99,102,241,1)]" style={{ animationDelay: '1s' }} />
            </div>
          </Link>
        </div>

        <Link href="/">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-foreground mb-8 animate-fade-in-up drop-shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-105 transition-transform cursor-pointer" style={{ animationDelay: '0.2s' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400">DiffuCat</span>
          </h1>
        </Link>
        
        <p className="text-2xl md:text-4xl text-foreground font-medium mb-14 max-w-3xl animate-fade-in-up leading-relaxed drop-shadow-xl" style={{ animationDelay: '0.3s' }}>
          Accelerating <span className="text-primary font-black border-b-4 border-primary/60">Catalyst Discovery</span> with Uncertainty-Aware Generative AI
        </p>

        <div className="animate-fade-in-up flex flex-col items-center gap-6" style={{ animationDelay: '0.4s' }}>
          <Link 
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "lg" }), 
              "h-20 px-14 rounded-2xl text-2xl font-black transition-all hover:scale-110 hover:shadow-[0_0_60px_-5px_rgba(14,165,233,0.8)] uppercase tracking-[0.3em] relative overflow-hidden group/btn hud-shadow bg-primary text-white border-none"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            <span className="relative z-10 flex items-center gap-4">
              <Sparkles className="w-6 h-6 animate-pulse" />
              Initialize Engine
              <ArrowRight className="w-8 h-8 transition-transform group-hover/btn:translate-x-2" />
            </span>
          </Link>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-primary/60 animate-pulse">
            [ Authentication Protocol Alpha-9 ]
          </p>
        </div>
      </div>
    </div>
  );
}
