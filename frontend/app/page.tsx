import HeroSection from '@/components/landing/HeroSection';
import PipelineSection from '@/components/landing/PipelineSection';
import MoleculeFeatureSection from '@/components/landing/MoleculeFeatureSection';
import LiveDemoSection from '@/components/landing/LiveDemoSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import PartnerTicker from '@/components/landing/PartnerTicker';
import { DiffusionViz } from '@/components/visualization/DiffusionViz';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="bg-void text-text-primary selection:bg-neon-teal selection:text-void">
      <HeroSection />
      
      {/* Partners / Trust Section - Animated Ticker */}
      <PartnerTicker />


      <div className="relative">
        <StatsSection />
        <PipelineSection />
      </div>

      <MoleculeFeatureSection />

      <section className="py-32 px-6 bg-void relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-blue/5 blur-[120px] rounded-full" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-neon-teal" />
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-neon-teal">Latent Diffusion</p>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-display text-white tracking-tight">From Noise to <br />Catalyst</h2>
            <p className="text-text-secondary mt-8 text-lg leading-relaxed max-w-md">
              Watch our proprietary denoising process transform a random latent vector into a high-performance catalytic lattice in real-time.
            </p>
          </div>
          <div className="glass rounded-[32px] p-2 border border-white/5 shadow-2xl">
            <div className="rounded-[28px] overflow-hidden bg-void/50 aspect-square flex items-center justify-center p-8">
              <DiffusionViz />
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-void">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-electric-blue mb-4">Interactive Preview</p>
          <h2 className="text-4xl md:text-6xl font-black font-display text-white tracking-tight">Inference Oracle</h2>
          <p className="text-text-secondary mt-6 text-lg max-w-2xl mx-auto">
            Test the live discovery model. Enter any catalytic substrate and observe the predicted activity metrics.
          </p>
        </div>
        <LiveDemoSection />
      </section>

      <FeaturesSection />

      <section className="py-40 px-6 bg-void relative overflow-hidden text-center">
        {/* Dramatic CTA Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-neon-teal/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/5 blur-[160px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mb-12">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-teal animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Limited Beta Access</span>
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black font-display text-white tracking-tighter leading-[0.9]">
            Initialize the <br />Discovery Engine
          </h2>
          
          <p className="text-text-secondary mt-10 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            Deploy DiffuCat to your infrastructure and orchestrate the full discovery loop in production.
          </p>
          
          <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link 
              href="/dashboard" 
              className="group h-16 px-12 rounded-full bg-white text-void font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
            >
              Start Discovering <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link 
              href="/contact" 
              className="h-16 px-12 rounded-full border border-white/10 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white/5 transition-all"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Startup Footer */}
      <footer className="py-20 px-6 bg-void border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-2xl font-black font-display text-white tracking-tighter">Diffu<span className="text-neon-teal">Cat</span></div>
            <p className="text-text-tertiary text-xs font-mono tracking-widest">© 2026 DIFFUCAT AI. ALL RIGHTS RESERVED.</p>
          </div>
          
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">
            <Link href="#" className="hover:text-neon-teal transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-neon-teal transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-neon-teal transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-neon-teal transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
