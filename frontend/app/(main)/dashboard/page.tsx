'use client';

import { MoleculeInput } from '@/components/discovery/MoleculeInput';
import { PredictionTable } from '@/components/discovery/PredictionTable';
import { PropertyRadar } from '@/components/visualization/PropertyRadar';
import { useDiscovery } from '@/store/discovery';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Trophy, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Molecule3DViewer = dynamic(() => import('@/components/visualization/Molecule3DViewer'), { ssr: false });

export default function DashboardPage() {
  const { predictions } = useDiscovery();
  const topCandidate = predictions[0];
  const topUcb = [...predictions]
    .filter((p) => p.ucb_score !== undefined)
    .sort((a, b) => (b.ucb_score ?? 0) - (a.ucb_score ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Section: Mission Control Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        <div className="xl:col-span-7">
           <MoleculeInput />
        </div>
        
        <div className="xl:col-span-5">
           <div className="h-full glass rounded-2xl border border-border/80 overflow-hidden shadow-2xl flex flex-col">
              <div className="px-6 py-4 border-b border-border/70 bg-surface-1/40 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald" />
                    <span className="text-sm font-bold">Active Structure Analysis</span>
                 </div>
                 {topCandidate && (
                   <div className="text-[10px] font-mono text-text-tertiary truncate max-w-[200px]">
                      SMILES: {topCandidate.smiles}
                   </div>
                 )}
              </div>
              <div className="flex-1 min-h-[300px] relative">
                {topCandidate ? (
                   <Molecule3DViewer data={topCandidate} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-void/40 backdrop-blur-sm">
                     <div className="w-12 h-12 rounded-xl border border-dashed border-border/60 flex items-center justify-center mb-4">
                        <Info className="h-6 w-6 text-text-tertiary opacity-30" />
                     </div>
                     <p className="text-xs font-mono text-text-tertiary max-w-[200px]">
                        Render engine standby. Input architecture to view 3D topology.
                     </p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Middle Section: Insights & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-9">
            <PredictionTable />
         </div>
         
         <div className="lg:col-span-3 space-y-6">
            <PropertyRadar data={predictions} />

            {/* Leaderboard Card */}
            <div className="glass rounded-2xl border border-border/80 p-6 bg-surface-1/40">
              <div className="flex items-center gap-2 mb-6">
                 <Trophy className="h-4 w-4 text-amber" />
                 <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-tertiary">Top UCB Ranking</div>
              </div>
              <div className="space-y-4">
                {topUcb.length === 0 ? (
                  <div className="py-4 text-center border border-dashed border-border/40 rounded-xl">
                     <span className="text-[10px] font-mono text-text-tertiary">Waiting for data...</span>
                  </div>
                ) : (
                  topUcb.map((p, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={p.smiles}
                    >
                      <Link
                        href={`/molecules/${encodeURIComponent(p.smiles)}`}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-cyan/5 border border-transparent hover:border-cyan/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold text-text-tertiary group-hover:text-cyan transition-colors">0{idx + 1}</span>
                           <span className="font-mono text-[11px] text-text-secondary truncate max-w-[100px] group-hover:text-text-primary">{p.smiles}</span>
                        </div>
                        <span className="text-amber font-mono text-xs font-bold">{(p.ucb_score ?? 0).toFixed(2)}</span>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
