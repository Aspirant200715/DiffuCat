'use client';

import { useDiscovery } from '@/store/discovery';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Trophy, TrendingUp, Info, Download, FileText, Share2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { exportToCSV, exportToJSON } from '@/lib/export';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MoleculeInput = dynamic(() => import('@/components/discovery/MoleculeInput').then(mod => mod.MoleculeInput), { ssr: false });
const PredictionTable = dynamic(() => import('@/components/discovery/PredictionTable').then(mod => mod.PredictionTable), { ssr: false });
const PropertyRadar = dynamic(() => import('@/components/visualization/PropertyRadar').then(mod => mod.PropertyRadar), { ssr: false });
const DiscoveryFeed = dynamic(() => import('@/components/discovery/DiscoveryFeed').then(mod => mod.DiscoveryFeed), { ssr: false });
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
    <TooltipProvider>
      <div className="space-y-8 pb-20 relative">
        {/* Cinematic Background Layer */}
        <div className="absolute inset-0 -z-10 blueprint-bg opacity-30 pointer-events-none" />
        
        {/* Header with educational subtext */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <motion.h1 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-4xl md:text-5xl font-black tracking-tighter text-text-primary bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan to-white/80"
               >
                 Discovery Engine
               </motion.h1>
               <Tooltip>
                 <TooltipTrigger>
                   <div className="p-2 cursor-help bg-cyan/5 rounded-full border border-cyan/10 hover:bg-cyan/20 transition-all">
                     <HelpCircle className="h-5 w-5 text-cyan" />
                   </div>
                 </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-md bg-white border-white p-5 shadow-2xl">
                    <p className="text-sm leading-relaxed font-bold text-black">
                      The Discovery Engine uses advanced <span className="text-cyan font-black">Graph Neural Networks (GNN)</span> to simulate and predict the catalytic efficiency of molecular architectures in milliseconds.
                    </p>
                  </TooltipContent>
               </Tooltip>
            </div>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl leading-relaxed font-medium">
              Architect the next generation of catalysts. Our AI orchestrates high-fidelity predictions for activity, selectivity, and stability.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <button 
              onClick={() => handleExport('pdf')}
              className="h-14 px-8 rounded-2xl border border-border/70 hover:border-cyan/50 hover:bg-cyan/5 text-base font-mono text-text-secondary flex items-center gap-3 transition-all group backdrop-blur-xl"
            >
               <FileText className="h-6 w-6 group-hover:text-cyan transition-colors" /> Export Intelligence
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="h-14 px-10 rounded-2xl bg-cyan text-void font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] hover:scale-105 active:scale-95 transition-all"
            >
               <Download className="h-6 w-6" /> Deploy Assets
            </button>
          </div>
        </div>

        {/* Top Section: Mission Control Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          <div className="xl:col-span-7">
             <MoleculeInput />
          </div>
          
          <div className="xl:col-span-5">
             <div className="h-full glass rounded-2xl border border-border/80 overflow-hidden shadow-2xl flex flex-col bg-surface-1/20 group">
                <div className="px-6 py-4 border-b border-border/70 bg-surface-1/40 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald animate-pulse" />
                      <span className="text-sm font-bold">Structural Analysis</span>
                   </div>
                   {topCandidate && (
                     <div className="text-[10px] font-mono text-cyan truncate max-w-[200px] bg-cyan/5 px-2 py-1 rounded">
                        SMILES: {topCandidate.smiles}
                     </div>
                   )}
                </div>
                <div className="flex-1 min-h-[300px] relative">
                  {topCandidate ? (
                     <Molecule3DViewer data={topCandidate} />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-void/40 backdrop-blur-sm">
                       <div className="w-16 h-16 rounded-2xl border border-dashed border-border/60 flex items-center justify-center mb-6 group-hover:border-cyan/40 transition-all duration-500">
                          <Info className="h-8 w-8 text-text-tertiary opacity-30 group-hover:text-cyan group-hover:opacity-100 transition-all" />
                       </div>
                       <h3 className="text-sm font-bold text-text-primary mb-2">Renderer Standby</h3>
                       <p className="text-xs font-mono text-text-tertiary max-w-[240px] leading-relaxed">
                          Input molecular SMILES in the terminal to visualize 3D conformers and uncertainty heatmaps.
                       </p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-3 bg-surface-1/40 border-t border-border/70 flex items-center justify-between">
                   <span className="text-[9px] font-mono uppercase tracking-widest text-text-tertiary">3D Conformer Projection</span>
                   <div className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-emerald" />
                      <span className="text-[9px] font-mono text-emerald">Ready</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Middle Section: Insights & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              <PredictionTable />
              
              <div className="glass rounded-2xl border border-emerald/30 p-8 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-emerald/5 to-transparent gap-6">
                 <div className="text-center md:text-left space-y-2">
                    <h3 className="text-3xl font-black text-text-primary tracking-tight">Ready for Lab Validation?</h3>
                    <p className="text-lg text-text-secondary max-w-3xl leading-relaxed font-medium">
                      Our GNN predictions provide the digital blueprint. Submit your top candidates to the **Experimental Forge** for atomic-scale validation.
                    </p>
                 </div>
                 <Link 
                   href={`/lab?smiles=${encodeURIComponent(topUcb.map(p => p.smiles).join(', '))}`}
                   className="h-16 px-12 rounded-full border-2 border-emerald text-emerald font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald/10 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.2)] shrink-0 group"
                 >
                    Enter Experimental Forge 
                    <Share2 className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </div>
           
           <div className="lg:col-span-4 space-y-6">
              <DiscoveryFeed />
              
              <PropertyRadar data={predictions} />

              {/* Leaderboard Card */}
              <div className="glass rounded-2xl border border-border/80 p-6 bg-surface-1/40">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber" />
                      <div className="text-xs font-mono uppercase tracking-[0.2em] text-text-tertiary">Discovery Rankings</div>
                   </div>
                   <span className="text-[9px] font-mono text-amber font-bold">UCB OPTIMIZED</span>
                </div>
                <div className="space-y-3">
                  {topUcb.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-border/40 rounded-xl bg-void/20">
                       <span className="text-[10px] font-mono text-text-tertiary">Waiting for engine output...</span>
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
                          className="group flex items-center justify-between p-3.5 rounded-xl hover:bg-cyan/5 border border-transparent hover:border-cyan/20 transition-all bg-void/30"
                        >
                          <div className="flex items-center gap-3">
                             <div className="w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center text-[10px] font-bold text-text-tertiary group-hover:text-cyan transition-colors">
                                {idx + 1}
                             </div>
                             <span className="font-mono text-[11px] text-text-secondary truncate max-w-[120px] group-hover:text-text-primary">{p.smiles}</span>
                          </div>
                          <div className="text-right">
                             <div className="text-amber font-mono text-xs font-bold">{(p.ucb_score ?? 0).toFixed(3)}</div>
                             <div className="text-[8px] font-mono uppercase text-text-tertiary">UCB SCORE</div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
