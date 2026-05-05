'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ACTIVITIES = [
  "Analyzing bond energies...",
  "Running diffusion steps...",
  "Predicting toxicity profile...",
  "Calculating binding affinity...",
  "Optimizing geometry...",
  "Sampling latent space...",
  "Evaluating drug-likeness...",
  "Scanning functional groups..."
];

export function AIActivityFeed() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        if (next.length > 5) next.shift();
        const available = ACTIVITIES.filter(a => !next.includes(a));
        const newItem = available[Math.floor(Math.random() * available.length)];
        return [...next, newItem];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
          <Zap className="w-3 h-3 text-neon-teal" /> AI Activity Stream
        </h4>
        <div className="w-1.5 h-1.5 rounded-full bg-neon-teal animate-pulse shadow-[0_0_8px_var(--teal-glow)]" />
      </div>
      
      <div className="space-y-3 min-h-[180px]">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 text-[11px] font-mono"
            >
              <div className="w-1 h-1 rounded-full bg-neon-teal/40" />
              <span className="text-text-secondary">{item}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <p className="text-[10px] font-mono text-text-tertiary italic">Stream idle...</p>
        )}
      </div>
    </div>
  );
}

export function LiveAnalysisPanel() {
  return (
    <div className="glass-panel p-5 rounded-2xl space-y-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
        <Activity className="w-3 h-3 text-electric-blue" /> Live Telemetry
      </h4>

      <div className="space-y-6">
        {/* Simulation Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
            <span className="text-text-tertiary">Simulation Depth</span>
            <span className="text-electric-blue">84%</span>
          </div>
          <div className="h-1 w-full bg-void rounded-full overflow-hidden border border-white/5">
            <motion.div 
              animate={{ width: "84%" }}
              className="h-full bg-electric-blue shadow-[0_0_10px_var(--blue-glow)]"
            />
          </div>
        </div>

        {/* Energy Graph Placeholder */}
        <div className="aspect-[2/1] bg-void/50 rounded-xl border border-white/5 relative overflow-hidden flex items-end">
          <div className="absolute inset-0 scifi-grid opacity-10" />
          <motion.div 
            animate={{ 
              d: [
                "M0 50 Q 25 40 50 50 T 100 50",
                "M0 50 Q 25 60 50 50 T 100 50",
                "M0 50 Q 25 40 50 50 T 100 50"
              ] 
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-full h-full"
          >
            <svg className="w-full h-full">
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                d="M-10 40 L20 35 L40 45 L60 25 L80 35 L110 30"
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="2" 
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00FFC6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <div className="absolute bottom-2 right-2 text-[8px] font-mono text-text-tertiary uppercase">Free Energy (ΔG)</div>
        </div>

        {/* Stability Indicator */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-void/30 border border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neon-teal" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Stability</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-1 h-3 rounded-full ${i < 5 ? 'bg-neon-teal shadow-[0_0_5px_var(--teal-glow)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
