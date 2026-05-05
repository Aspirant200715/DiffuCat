'use client';

import { useDiscovery } from '@/store/discovery';
import { motion } from 'framer-motion';
import { 
  Activity,
  FlaskConical, 
  BrainCircuit, 
  Download, 
  Bookmark, 
  Beaker,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PredictionResultsGrid() {
  const { predictions } = useDiscovery();

  if (!predictions || predictions.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 scifi-grid opacity-10" />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="text-neon-teal/20 mb-6"
        >
          <FlaskConical className="w-24 h-24 stroke-[1px]" />
        </motion.div>
        <h3 className="text-xl font-display font-bold text-white/40 tracking-tight uppercase">Awaiting Molecular Input...</h3>
        <p className="text-xs text-text-tertiary mt-2 font-mono">Initialize simulation sequence to begin analysis</p>
      </div>
    );
  }

  const activeMolecule = predictions[0]; // For demo purposes, focus on the first result

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Molecular Summary Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-2xl space-y-4 relative group hover:neon-border transition-all"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Molecular Structure</h4>
            <Badge variant="outline" className="border-neon-teal/20 text-neon-teal bg-neon-teal/5">CID: 29481</Badge>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-4xl font-display font-black text-white tracking-tighter">
              C<sub className="text-neon-teal opacity-50 text-xl">20</sub>H<sub className="text-neon-teal opacity-50 text-xl">14</sub>O<sub className="text-neon-teal opacity-50 text-xl">4</sub>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] text-text-tertiary uppercase font-bold mb-1">Weight</p>
              <p className="text-sm font-mono text-white">318.32 g/mol</p>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase font-bold mb-1">Groups</p>
              <div className="flex flex-wrap gap-1">
                <Badge className="text-[8px] bg-white/5 hover:bg-white/10 text-white/60">CARBOXYL</Badge>
                <Badge className="text-[8px] bg-white/5 hover:bg-white/10 text-white/60">PHENYL</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. Prediction Metrics (VISUAL!) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 rounded-2xl space-y-6 relative group hover:neon-border transition-all"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Prediction Metrics</h4>
            <div className="flex items-center gap-1 text-[10px] font-mono text-neon-teal">
              <TrendingUp className="w-3 h-3" /> 98.4% CONFIDENCE
            </div>
          </div>
          
          <div className="space-y-5">
            <MetricBar label="Activity Score" value={activeMolecule.metrics?.activity ?? 0.85} color="bg-neon-teal" />
            <MetricBar label="Selectivity" value={activeMolecule.metrics?.selectivity ?? 0.42} color="bg-electric-blue" />
            <MetricBar label="Stability" value={activeMolecule.metrics?.stability ?? 0.68} color="bg-quantum-purple" />
          </div>
        </motion.div>

        {/* 3. Property Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4 relative group hover:neon-border transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 glow-bg-teal blur-[100px] opacity-20 -z-10" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Detailed Property Matrix</h4>
          
          <div className="space-y-2">
            <PropertyRow icon={<ShieldCheck className="text-emerald" />} label="Toxicity Index" value="0.12 mg/kg" status="SAFE" />
            <PropertyRow icon={<TrendingUp className="text-neon-teal" />} label="Binding Affinity" value="-8.4 kcal/mol" status="HIGH" />
            <PropertyRow icon={<Activity className="text-electric-blue" />} label="Metabolic Stability" value="1.42 hrs" status="OPTIMAL" />
          </div>
        </motion.div>

        {/* 4. AI Insight Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl md:col-span-2 bg-gradient-to-br from-neon-teal/5 to-transparent border-neon-teal/10 relative overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neon-teal text-void">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h5 className="text-xs font-black uppercase tracking-widest text-neon-teal">AI Discovery Insight</h5>
              <p className="text-sm text-text-secondary leading-relaxed">
                This molecule exhibits <span className="text-white font-bold">moderate lipophilicity</span> with an optimal binding profile for target 14-3-3 protein isoforms. The presence of the carboxyl group suggests potential as a pro-drug candidate. <span className="text-neon-teal cursor-pointer hover:underline">Read full analysis →</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* 5. Actions */}
        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button variant="ghost" className="text-text-secondary hover:text-white text-xs font-bold uppercase">
            <Bookmark className="w-4 h-4 mr-2" /> Save Molecule
          </Button>
          <Button variant="ghost" className="text-text-secondary hover:text-white text-xs font-bold uppercase">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase px-6 border border-white/10">
            <Beaker className="w-4 h-4 mr-2" /> Queue for Lab
          </Button>
        </div>

      </div>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
        <span className="text-text-secondary">{label}</span>
        <span className="text-white">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full bg-void rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        />
      </div>
    </div>
  );
}

function PropertyRow({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 cursor-default group/row">
      <div className="flex items-center gap-3">
        <div className="opacity-70 group-hover/row:opacity-100 transition-opacity">
          {icon}
        </div>
        <span className="text-xs font-medium text-text-secondary group-hover/row:text-white">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-white/80">{value}</span>
        <Badge variant="outline" className="text-[9px] border-white/10 bg-white/5 text-text-tertiary">
          {status}
        </Badge>
        <ChevronRight className="w-3 h-3 text-text-tertiary opacity-0 group-hover/row:opacity-100 transition-all -translate-x-2 group-hover/row:translate-x-0" />
      </div>
    </div>
  );
}
