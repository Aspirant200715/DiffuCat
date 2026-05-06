'use client';

import { useState, useEffect } from 'react';
import { useDiscovery } from '@/store/discovery';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Binary, ChevronRight, Activity } from 'lucide-react';

const LOG_MESSAGES = [
  "Initializing Active Learning loop...",
  "Extracting feature vectors from Lab results...",
  "Calculating loss gradients for GNN weights...",
  "Performing backpropagation (Learning rate: 0.001)...",
  "Updating structural embeddings...",
  "Validating against test set (MAE: 0.042)...",
  "New model weights committed to local storage.",
  "Engine hot-swap complete. Ready for inference."
];

export function OptimizationConsole() {
  const { isTraining } = useDiscovery();
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isTraining) {
      setLogs([]);
      setCurrentIndex(0);
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < LOG_MESSAGES.length) {
            setLogs((l) => [...l, LOG_MESSAGES[prev]]);
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  return (
    <AnimatePresence>
      {isTraining && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-2xl border border-cyan/40 bg-void/80 p-6 overflow-hidden mb-8 shadow-[0_0_30px_rgba(14,165,233,0.15)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/30">
                <Cpu className="h-4 w-4 text-cyan animate-spin" />
              </div>
              <div>
                 <div className="text-[12px] font-mono uppercase tracking-[0.4em] text-cyan font-black">Active Optimization</div>
                 <div className="text-xl font-black text-white tracking-tight">GNN Retraining Console</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[11px] font-mono text-white/60 font-black uppercase tracking-[0.2em]">Engine: V2.1-AL</span>
               <div className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_10px_rgba(14,165,233,0.5)] animate-pulse" />
            </div>
          </div>

          <div className="bg-black/40 rounded-xl border border-white/10 p-6 font-mono text-[13px] h-[180px] overflow-y-auto space-y-2 scrollbar-hide">
            {logs.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="flex items-start gap-3 text-emerald/90 font-bold"
              >
                <ChevronRight className="h-4 w-4 mt-0.5 text-cyan shrink-0" />
                <span>{log}</span>
              </motion.div>
            ))}
            <div className="flex items-center gap-3 text-cyan animate-pulse mt-4 font-black">
               <Binary className="h-4 w-4" />
               <span>SYSTEM BUSY...</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
             <div className="flex gap-2">
                <div className="h-1 w-8 rounded-full bg-cyan" />
                <div className="h-1 w-8 rounded-full bg-cyan/40" />
                <div className="h-1 w-8 rounded-full bg-cyan/20" />
             </div>
             <div className="text-[11px] font-mono text-white/50 uppercase tracking-[0.2em] font-black">
                Optimizing Weights based on Job Results
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
