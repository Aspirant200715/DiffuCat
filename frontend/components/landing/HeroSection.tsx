'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ChemBackground3D from '@/components/visualization/ChemBackground3D';
import CatalystTicker from '@/components/landing/CatalystTicker';
import ChemicalGrid from '@/components/landing/ChemicalGrid';
import FloatingFormulas from '@/components/landing/FloatingFormulas';
import { ArrowRight, Play, Beaker } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#010409]">
      {/* 3D Background - Minimalist & Elegant */}
      <ChemBackground3D />
      
      {/* Dense Chemical Name Grid */}
      <ChemicalGrid />
      
      {/* Floating Chemical Formulas - More visible drifting elements */}
      <FloatingFormulas />
      
      {/* Catalyst & Reaction Ticker */}
      <CatalystTicker />


      
      {/* Subtle Radial Gradient Overlay - Brighter center */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,255,198,0.12)_0%,transparent_60%)]" />
      
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
            <Beaker className="w-4 h-4 text-neon-teal" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
              Diffusion Discovery Engine v2.0
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="font-display font-black leading-none text-white tracking-tighter"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 7.5rem)' }}
        >
          Diffu<span className="text-neon-teal drop-shadow-[0_0_30px_rgba(0,255,198,0.5)]">Cat</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-xl md:text-3xl font-display font-black text-white tracking-tight"
        >
          Synthesizing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-emerald">Future of Catalysis</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          The world's first uncertainty-aware generative AI platform for high-throughput catalyst discovery.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          <Link 
            href="/dashboard" 
            className="group relative px-12 py-6 rounded-full bg-emerald text-void font-black uppercase tracking-[0.2em] text-lg flex items-center gap-6 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(16,185,129,0.4)]"
          >
            INITIALIZE ENGINE <ArrowRight className="h-6 w-6 stroke-[3] transition-transform group-hover:translate-x-2" />
          </Link>
          
          <Link 
            href="#pipeline" 
            className="group px-12 py-6 rounded-full border-3 border-white/20 text-white font-black uppercase tracking-[0.2em] text-lg flex items-center gap-6 bg-white/5 backdrop-blur-3xl hover:bg-white/10 hover:border-white transition-all shadow-xl"
          >
            <Play className="h-6 w-6 fill-current transition-transform group-hover:scale-125" /> 
            WATCH DEMO
          </Link>
        </motion.div>

        {/* High-Contrast Professional Metrics - Shifted Up for Clarity */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center group">
            <div className="text-6xl font-black font-sans tracking-tighter text-white group-hover:text-neon-teal transition-colors drop-shadow-[0_0_20px_rgba(0,255,198,0.2)]">99.8%</div>
            <div className="text-sm font-black uppercase tracking-[0.4em] mt-4 text-white/70">Stability Index</div>
          </div>
          <div className="flex flex-col items-center group">
            <div className="text-6xl font-black font-sans tracking-tighter text-white group-hover:text-emerald transition-colors drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">10<sup className="text-4xl">60</sup></div>
            <div className="text-sm font-black uppercase tracking-[0.4em] mt-4 text-white/70">Candidates</div>
          </div>
          <div className="flex flex-col items-center group">
            <div className="text-6xl font-black font-sans tracking-tighter text-white group-hover:text-quantum-purple transition-colors drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]">&lt;1s</div>
            <div className="text-sm font-black uppercase tracking-[0.4em] mt-4 text-white/70">Inference Speed</div>
          </div>
        </motion.div>


      </div>

      {/* Scroll Indicator Feature - Screen-Absolute Positioning (Prevents Overlap) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-50"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[14px] font-black uppercase tracking-[0.6em] text-white/60 group-hover:text-emerald transition-colors duration-300 mb-4">
          Scroll to Explore
        </span>
        <div className="relative w-8 h-12 rounded-full border-2 border-white/30 flex justify-center p-1.5 group-hover:border-emerald transition-colors duration-300">
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_12px_rgba(16,185,129,1)]"
          />
        </div>
      </motion.div>
    </section>


  );
}

