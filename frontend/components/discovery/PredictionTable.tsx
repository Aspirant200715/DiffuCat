'use client';

import { useMemo, useState } from 'react';
import { useDiscovery } from '@/store/discovery';
import { UncertaintyBar } from '@/components/visualization/UncertaintyBar';
import { ParetoBadge } from '@/components/discovery/ParetoBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { ChevronDown, FlaskConical, Info, Database, Layers } from 'lucide-react';
import { useSubmitLabJob, usePredict } from '@/hooks/useLabJobs'; // Wait, predict is in useMolecule
// Correction: predict is in useMolecule
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SortKey = 'activity' | 'selectivity' | 'stability' | 'ucb';

export function PredictionTable() {
  const { predictions } = useDiscovery();
  const [sortKey, setSortKey] = useState<SortKey>('ucb');
  const [paretoOnly, setParetoOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const submitLabMutation = useSubmitLabJob();

  const sorted = useMemo(() => {
    const rows = paretoOnly ? predictions.filter((p) => p.pareto_optimal) : [...predictions];
    return rows.sort((a, b) => {
      const metric = (p: any) => {
        if (sortKey === 'ucb') return p.ucb_score ?? 0;
        return p.metrics?.[sortKey] ?? 0;
      };
      return metric(b) - metric(a);
    });
  }, [predictions, sortKey, paretoOnly]);

  if (!predictions.length) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-2xl bg-surface-1/30 backdrop-blur-sm p-12 text-center group">
        <div className="w-16 h-16 rounded-full bg-surface-2 border border-border/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-cyan/50 transition-all duration-500">
           <Database className="h-8 w-8 text-text-tertiary group-hover:text-cyan transition-colors" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Candidates Screened</h3>
        <p className="text-sm text-white/70 max-w-sm mb-8">
          Enter a SMILES string or use the AI Generator in the terminal above to start the discovery process.
        </p>
        <div className="flex gap-4">
           <div className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-mono text-white/60">
              1. Input SMILES
           </div>
           <div className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-mono text-white/60">
              2. Run Engine
           </div>
           <div className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-mono text-white/60">
              3. View Results
           </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="glass rounded-2xl border border-border/80 overflow-hidden shadow-xl bg-surface-1/40">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-surface-1/60">
          <div className="flex items-center gap-3">
             <Layers className="h-4 w-4 text-cyan" />
             <div className="text-sm font-bold tracking-tight">Catalyst Screening Results</div>
          </div>
          <button
            onClick={() => setParetoOnly((v) => !v)}
            className={`text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-all ${paretoOnly ? 'bg-cyan/10 border-cyan text-cyan' : 'border-border/70 text-white/40 hover:border-cyan/50 hover:text-cyan'}`}
          >
            {paretoOnly ? 'Showing Pareto Front Only' : 'Show Pareto Front'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 bg-surface-1/30">
              <tr>
                <th className="px-6 py-4 text-left font-bold">SMILES Architecture</th>
                <HeaderCell 
                  label="Activity" 
                  onClick={() => setSortKey('activity')} 
                  active={sortKey === 'activity'} 
                  tooltip="Predicted reaction rate (k_cat/K_m)"
                />
                <HeaderCell 
                  label="Selectivity" 
                  onClick={() => setSortKey('selectivity')} 
                  active={sortKey === 'selectivity'} 
                  tooltip="Product purity percentage (ee%)"
                />
                <HeaderCell 
                  label="Stability" 
                  onClick={() => setSortKey('stability')} 
                  active={sortKey === 'stability'} 
                  tooltip="Thermal & oxidative stability score"
                />
                <HeaderCell 
                  label="UCB Score" 
                  onClick={() => setSortKey('ucb')} 
                  active={sortKey === 'ucb'} 
                  align="right" 
                  tooltip="Upper Confidence Bound (weighted activity + uncertainty)"
                />
                <th className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    Pareto <Info className="h-3 w-3 text-text-tertiary" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sorted.map((p) => (
                <tr
                  key={p.smiles}
                  className={`group transition-all ${expanded === p.smiles ? 'bg-cyan/5' : 'hover:bg-surface-1/40 cursor-pointer'}`}
                  onClick={() => setExpanded(expanded === p.smiles ? null : p.smiles)}
                >
                  <td className="px-6 py-6 font-mono text-cyan transition-all group-hover:pl-8 text-sm">
                    <div className="flex items-center gap-3">
                       <span className="h-1.5 w-0 group-hover:w-3 bg-cyan transition-all rounded-full" />
                       <span className="truncate max-w-[200px] lg:max-w-[320px]">{p.smiles}</span>
                    </div>
                  </td>
                  <MetricCell value={p.metrics?.activity ?? 0} unc={p.uncertainty?.activity ?? 0} color="bg-cyan" />
                  <MetricCell value={p.metrics?.selectivity ?? 0} unc={p.uncertainty?.selectivity ?? 0} color="bg-emerald" />
                  <MetricCell value={p.metrics?.stability ?? 0} unc={p.uncertainty?.stability ?? 0} color="bg-amber" />
                  <td className="px-6 py-6 text-right font-mono font-bold text-amber text-sm">
                    {(p.ucb_score ?? 0).toFixed(3)}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <ParetoBadge optimal={p.pareto_optimal} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/60 bg-surface-2/30"
            >
              <div className="px-8 py-6 text-sm">
                {(() => {
                  const p = predictions.find((row) => row.smiles === expanded);
                  if (!p) return null;
                  return (
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-tertiary">Counterfactual Reasoning</div>
                          <div className="mt-2 text-text-primary leading-relaxed bg-black/20 p-4 rounded-xl border border-border/40 italic">
                            "{p.counterfactual_hint || 'No counterfactual hint available for this architecture.'}"
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-white/30">
                           <span>Graph Hash: {p.smiles.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 7).toString(16).substring(0, 8)}</span>
                           <span>|</span>
                           <span className="text-cyan">Confidence: {(100 - (p.uncertainty?.activity || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[220px]">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            submitLabMutation.mutate([p.smiles]);
                          }}
                          disabled={submitLabMutation.isPending}
                          className="w-full h-11 rounded-xl border-emerald/30 bg-emerald/5 text-emerald hover:bg-emerald/10 hover:border-emerald/50 gap-3 font-mono text-[10px] uppercase tracking-widest shadow-sm transition-all"
                        >
                          <FlaskConical className={`h-4 w-4 ${submitLabMutation.isPending ? 'animate-bounce' : ''}`} />
                          {submitLabMutation.isPending ? 'Ingesting...' : 'Submit to Lab'}
                        </Button>
                        <Link
                          href={`/molecules/${encodeURIComponent(p.smiles)}`}
                          className="w-full h-11 rounded-xl border border-cyan/30 flex items-center justify-center gap-3 text-cyan font-mono text-[10px] uppercase tracking-widest hover:bg-cyan/10 transition-all"
                        >
                          Analysis Details
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function HeaderCell({ label, onClick, active, tooltip, align = 'left' }: { label: string; onClick: () => void; active: boolean; tooltip: string; align?: 'left' | 'right' }) {
  return (
    <th className={`px-6 py-4 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <Tooltip>
        <TooltipTrigger>
          <div onClick={onClick} className="inline-flex items-center gap-2 group cursor-pointer">
            <span className={active ? 'text-cyan font-bold' : 'group-hover:text-text-primary'}>{label}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${active ? 'text-cyan rotate-180' : 'text-text-tertiary group-hover:text-cyan'}`} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-surface-2 border-border text-text-primary font-mono text-[10px] px-3 py-2">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </th>
  );
}

function MetricCell({ value, unc, color }: { value: number; unc: number; color: string }) {
  return (
    <td className="px-6 py-6">
      <div className="flex flex-col gap-2 w-36">
        <div className="flex items-center justify-between">
           <span className="text-text-primary text-sm font-mono font-semibold">
            {value.toFixed(3)}
          </span>
          <span className="text-text-tertiary text-xs font-mono">
            ±{unc.toFixed(2)}
          </span>
        </div>
        <UncertaintyBar value={value} uncertainty={unc} color={color} />
      </div>
    </td>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
