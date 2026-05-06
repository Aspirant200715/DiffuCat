'use client';

import { MoleculeInput } from '@/components/discovery/MoleculeInput';
import { PredictionTable } from '@/components/discovery/PredictionTable';
import { PropertyRadar } from '@/components/visualization/PropertyRadar';
import { DiscoveryFeed } from '@/components/discovery/DiscoveryFeed';
import { useDiscovery } from '@/store/discovery';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Trophy, TrendingUp, Info, Download, FileText, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { exportToCSV, exportToJSON } from '@/lib/export';

const Molecule3DViewer = dynamic(() => import('@/components/visualization/Molecule3DViewer'), { ssr: false });

export default function DashboardPage() {
  const { predictions } = useDiscovery();
  const topCandidate = predictions[0];
  const topUcb = [...predictions]
    .filter((p) => p.ucb_score !== undefined)
    .sort((a, b) => (b.ucb_score ?? 0) - (a.ucb_score ?? 0))
    .slice(0, 5);

  const handleExport = (type: string) => {
    if (predictions.length === 0) {
      toast.error('No discovery data available to export.');
      return;
    }
    
    if (type === 'csv') {
      exportToCSV(predictions);
      toast.success('Discovery assets exported as CSV');
    } else {
      exportToJSON(predictions);
      toast.success('Discovery report exported as JSON');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-text-primary">Discovery Engine</h1>
           <p className="text-sm text-text-secondary">Orchestrate generative catalyst design and screening.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => handleExport('pdf')}
             className="h-10 px-4 rounded-xl border border-border/70 hover:border-cyan/50 hover:bg-cyan/5 text-xs font-mono text-text-secondary flex items-center gap-2 transition-all"
           >
              <FileText className="h-4 w-4" /> Export Report
           </button>
           <button 
             onClick={() => handleExport('csv')}
             className="h-10 px-4 rounded-xl bg-cyan text-void font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95 transition-all"
           >
              <Download className="h-4 w-4" /> Download Assets
           </button>
        </div>
      </div>

      {/* Top Section: Mission Control Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        <div className="xl:col-span-7">
           <MoleculeInput />
        </div>
        
        <div className="xl:col-span-5">
           <div className="h-full glass rounded-2xl border border-border/80 overflow-hidden shadow-2xl flex flex-col bg-surface-1/20">
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
         <div className="lg:col-span-8 space-y-8">
            <PredictionTable />
            
            <div className="glass rounded-2xl border border-border/80 p-8 flex items-center justify-between bg-gradient-to-r from-surface-1/40 to-transparent">
               <div>
                  <h3 className="text-lg font-bold text-text-primary">Ready for Lab Validation?</h3>
                  <p className="text-sm text-text-secondary mt-1">Submit your top candidates to the Experimental Forge for real DFT results.</p>
               </div>
               <Link 
                 href={`/lab?smiles=${encodeURIComponent(topUcb.map(p => p.smiles).join(', '))}`}
                 className="h-12 px-8 rounded-full border border-emerald/50 text-emerald font-bold text-xs uppercase tracking-widest hover:bg-emerald/10 transition-all flex items-center gap-3"
               >
                  Enter Experimental Forge <Share2 className="h-4 w-4" />
               </Link>
            </div>
         </div>
         
         <div className="lg:col-span-4 space-y-6">
            <DiscoveryFeed />
            
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
