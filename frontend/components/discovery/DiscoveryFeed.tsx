'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Atom, FlaskConical, Zap, CheckCircle2 } from 'lucide-react';

const EVENT_TEMPLATES = [
  { icon: Atom, color: 'text-cyan', text: 'New architecture generated: [SMILES]' },
  { icon: Activity, color: 'text-emerald', text: 'GNN Inference complete for [SMILES]' },
  { icon: FlaskConical, color: 'text-amber', text: 'Candidate [SMILES] submitted to Lab' },
  { icon: Zap, color: 'text-purple-400', text: 'Active Learning loop optimized weights' },
  { icon: CheckCircle2, color: 'text-emerald', text: 'DFT Validation result ingested for [SMILES]' },
];

const SMILES_EXAMPLES = ['CCO', 'c1ccccc1', 'CC(=O)O', 'CNC(=O)OC1=CC=CC2=C1OCO2', 'C1=CC=C(C=C1)C=O'];

export function DiscoveryFeed() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Initial events
    setEvents([
      { id: 1, ...EVENT_TEMPLATES[0], smiles: 'CCO', time: 'Just now' },
      { id: 2, ...EVENT_TEMPLATES[1], smiles: 'c1ccccc1', time: '2m ago' },
    ]);

    const interval = setInterval(() => {
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const smiles = SMILES_EXAMPLES[Math.floor(Math.random() * SMILES_EXAMPLES.length)];
      const newEvent = {
        id: Date.now(),
        ...template,
        smiles,
        time: 'Just now',
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 5));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl border border-border/80 p-6 bg-surface-1/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-text-tertiary">Live Discovery Feed</span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative pl-6 pb-4 border-l border-border/60 last:pb-0"
            >
              <div className="absolute left-[-5px] top-0 h-2 w-2 rounded-full bg-surface-2 border border-border" />
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-md bg-surface-2 border border-border/50 ${event.color}`}>
                  <event.icon className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {event.text.replace('[SMILES]', '')}
                    <span className="font-mono text-cyan ml-1">{event.smiles}</span>
                  </p>
                  <span className="text-[9px] font-mono text-text-tertiary uppercase mt-1 block tracking-wider">{event.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
