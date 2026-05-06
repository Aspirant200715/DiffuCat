'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ChemBackground3D from '@/components/visualization/ChemBackground3D';
import CatalystTicker from '@/components/landing/CatalystTicker';
import ChemicalGrid from '@/components/landing/ChemicalGrid';
import FloatingFormulas from '@/components/landing/FloatingFormulas';
import { ArrowRight, Play, Beaker, Zap } from 'lucide-react';
import QuantumMeshBackground from '@/components/landing/QuantumMeshBackground';
import DiscoveryIntro from '@/components/landing/DiscoveryIntro';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const [stage, setStage] = useState<'intro' | 'overlay' | 'final'>('intro');

  useEffect(() => {
    // Phase 1: Intro only for 4 seconds
    const overlayTimer = setTimeout(() => setStage('overlay'), 4000);
    // Phase 2: Overlay for 4.5 seconds, then finalize (extended slightly for better text read time)
    const finalTimer = setTimeout(() => setStage('final'), 8500);
    
    return () => {
      clearTimeout(overlayTimer);
      clearTimeout(finalTimer);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#010409]">
      {/* 3D Intro Animation Layer */}
      <AnimatePresence>
        {stage !== 'final' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-[50]"
          >
            <DiscoveryIntro onComplete={() => setStage('overlay')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Layered Masterpiece Background */}
      <div className="absolute inset-0 z-0">
        {/* Layer 1: High-Detail Crystalline & Data Stream Texture */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={stage !== 'intro' ? { opacity: 0.6 } : { opacity: 0 }}
          transition={{ duration: 2.5 }}
          className="absolute inset-0 contrast-110 brightness-105"
          style={{ 
            backgroundImage: 'url("/next_gen_chem_bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'screen'
          }}
        />
        
        {/* Layer 2: Subtle 3D Floating Chemistry (Parallax) */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={stage !== 'intro' ? { opacity: 0.2 } : { opacity: 0 }}
           transition={{ duration: 3, delay: 1 }}
           className="absolute inset-0"
        >
          <ChemBackground3D />
        </motion.div>

        {/* Layer 3: Ultra-Deep Radial Vignette */}
        <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#010409_100%)] opacity-90" />
      </div>
      
      <motion.div 
        className="relative z-[60] text-center px-6 max-w-5xl pointer-events-none"
        initial="hidden"
        animate={stage !== 'intro' ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.3,
              delayChildren: 0.5,
            }
          }
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
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
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 }
          }}
          className="font-display font-black leading-[0.9] tracking-tighter drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
          style={{ fontSize: 'clamp(4rem, 12vw, 9rem)' }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-sky-400">
            DiffuCat
          </span>
        </motion.h1>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          animate={{ color: stage === 'overlay' ? '#38BDF8' : '#FFFFFF' }}
          transition={{ duration: 0.8 }}
          className="mt-4 text-xl md:text-3xl font-display font-black tracking-tight"
        >
          Synthesizing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-teal to-emerald">Future of Catalysis</span>
        </motion.div>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="mt-8 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-bold text-white drop-shadow-[0_2px_15px_rgba(0,0,0,1)] bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5"
        >
          The world's first uncertainty-aware generative AI platform for high-throughput catalyst discovery.
        </motion.p>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 pointer-events-auto"
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

        {/* High-Contrast Professional Metrics */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center group">
            <div className="text-6xl font-black font-sans tracking-tighter text-white group-hover:text-neon-teal transition-colors drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">99.8%</div>
            <div className="text-sm font-black uppercase tracking-[0.4em] mt-4 text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">Stability Index</div>
          </div>
          <div className="flex flex-col items-center group">
            <div className="text-6xl font-black font-sans tracking-tighter text-white group-hover:text-emerald transition-colors drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">10<sup className="text-4xl">60</sup></div>
            <div className="text-sm font-black uppercase tracking-[0.4em] mt-4 text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">Candidates</div>
          </div>
          <div className="flex flex-col items-center group">
            <div className="text-6xl font-black font-sans tracking-tighter text-white group-hover:text-quantum-purple transition-colors drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">&lt;1s</div>
            <div className="text-sm font-black uppercase tracking-[0.4em] mt-4 text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">Inference Speed</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator Feature */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={stage === 'final' ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
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
