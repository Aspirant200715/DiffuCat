'use client';

import { useDiscovery } from '@/store/discovery';
import { Database, Filter, Search, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function MoleculesPage() {
  const { predictions } = useDiscovery();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-text-primary">Structural Archive</h1>
           <p className="text-sm text-text-secondary">Browse and filter the complete database of discovered catalyst architectures.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input 
                type="text" 
                placeholder="Search SMILES..." 
                className="h-10 pl-10 pr-4 rounded-xl bg-surface-1/60 border border-border/70 text-sm focus:outline-none focus:border-cyan/50 w-[240px]"
              />
           </div>
           <button className="h-10 px-4 rounded-xl border border-border/70 text-xs font-mono text-text-secondary flex items-center gap-2 hover:bg-surface-2/40 transition-all">
              <Filter className="h-4 w-4" /> Filters
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {predictions.length === 0 ? (
          <div className="col-span-full h-64 border-2 border-dashed border-border/40 rounded-3xl flex flex-col items-center justify-center text-center p-8">
             <Database className="h-12 w-12 text-text-tertiary mb-4 opacity-30" />
             <h3 className="text-lg font-semibold text-text-primary">No Assets Archived</h3>
             <p className="text-sm text-text-secondary mt-2">Screen candidates on the dashboard to populate the structural database.</p>
          </div>
        ) : (
          predictions.map((p) => (
            <Link 
              key={p.smiles}
              href={`/molecules/${encodeURIComponent(p.smiles)}`}
              className="glass group rounded-[24px] border border-border/80 p-6 bg-surface-1/30 hover:border-cyan/40 hover:bg-surface-1/50 transition-all shadow-lg hover:shadow-cyan/5"
            >
              <div className="flex items-start justify-between">
                 <div className="h-10 w-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
                    <Atom className="h-5 w-5" />
                 </div>
                 <ArrowUpRight className="h-4 w-4 text-text-tertiary group-hover:text-cyan transition-all" />
              </div>
              
              <div className="mt-6">
                 <div className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary">Architecture</div>
                 <div className="text-sm font-mono text-text-primary mt-1 truncate">{p.smiles}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/40">
                 <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-text-tertiary">Activity</div>
                    <div className="text-xs font-bold text-cyan mt-1">{p.metrics?.activity?.toFixed(3) || '0.000'}</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-text-tertiary">Selectivity</div>
                    <div className="text-xs font-bold text-emerald mt-1">{p.metrics?.selectivity?.toFixed(1) || '0.0'}%</div>
                 </div>
                 <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-text-tertiary">Stability</div>
                    <div className="text-xs font-bold text-amber mt-1">{p.metrics?.stability?.toFixed(3) || '0.000'}</div>
                 </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

import { Atom } from 'lucide-react';
