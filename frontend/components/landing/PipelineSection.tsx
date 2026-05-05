'use client';

import { motion } from 'framer-motion';
import { Network, Database, Activity, Wand2, FlaskConical, RefreshCw } from 'lucide-react';

const nodes = [
  { title: 'Generative', desc: 'Diffusion Latent Sampling', icon: Wand2, color: 'text-neon-teal' },
  { title: 'Predictive', desc: 'Multi-property Oracle', icon: Database, color: 'text-electric-blue' },
  { title: 'Bayesian', desc: 'Confidence Calibration', icon: Activity, color: 'text-quantum-purple' },
  { title: 'Pareto', desc: 'Multi-objective Ranking', icon: Network, color: 'text-neon-teal' },
  { title: 'Validation', desc: 'Wet-lab Orchestration', icon: FlaskConical, color: 'text-electric-blue' },
  { title: 'Optimization', desc: 'Online Model Retraining', icon: RefreshCw, color: 'text-quantum-purple' },
];

export default function PipelineSection() {
  return (
    <section id="pipeline" className="py-32 px-6 bg-void relative overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-teal/5 via-transparent to-electric-blue/5 opacity-50" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-neon-teal mb-4"
          >
            Orchestration Workflow
          </motion.p>
          <h2 className="text-4xl md:text-6xl font-black font-display text-white tracking-tight">The Discovery Pipeline</h2>
          <p className="text-text-secondary mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Generate, rank, validate, retrain. Every stage of catalyst discovery is orchestrated through our unified intelligence layer.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {nodes.map((node, i) => (
            <motion.div
              key={node.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6">
                <div className={`h-24 w-24 rounded-3xl bg-void border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-neon-teal/50 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,198,0.2)]`}>
                  <node.icon className={`h-10 w-10 ${node.color} transition-transform group-hover:rotate-12`} />
                </div>
                
                {/* Node Number */}
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-void border border-white/20 flex items-center justify-center text-[10px] font-black font-mono text-text-tertiary">
                  0{i + 1}
                </div>
              </div>

              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-neon-teal transition-colors">{node.title}</h3>
              <p className="text-text-tertiary text-[11px] leading-relaxed max-w-[140px] font-mono uppercase tracking-wider">
                {node.desc}
              </p>
              
              {/* Desktop Arrow */}
              {i < nodes.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 translate-x-1/2 z-20">
                  <div className="h-1 w-1 rounded-full bg-white/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

