'use client';

import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Radar, FlaskConical } from 'lucide-react';

const features = [
  {
    title: 'Generative Candidate Engine',
    desc: 'Diffusion models propose novel catalysts aligned to target reactions.',
    icon: Sparkles,
  },
  {
    title: 'Uncertainty-Aware Prediction',
    desc: 'Multi-property oracle with calibrated uncertainty and UCB scoring.',
    icon: Radar,
  },
  {
    title: 'Explainable Chemistry',
    desc: 'Counterfactual hints and synthetic accessibility in every report.',
    icon: BrainCircuit,
  },
  {
    title: 'Active Lab Loop',
    desc: 'Queue experiments, capture feedback, retrain automatically.',
    icon: FlaskConical,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 px-6 bg-surface-1">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-tertiary">Platform Capabilities</p>
          <h2 className="text-3xl md:text-5xl font-semibold mt-4">A Chemistry Engine, Not a Demo</h2>
          <p className="text-text-secondary mt-4 max-w-2xl mx-auto">
            Every component is built for live inference, visualization, and lab feedback.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100, damping: 20 }}
              className="glass rounded-2xl p-6 border border-border/80 hover:border-cyan/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-cyan" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
