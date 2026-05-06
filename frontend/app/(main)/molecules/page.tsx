'use client';

import { useState } from 'react';
import { useDiscovery } from '@/store/discovery';
import { Database, Filter, Search, ArrowUpRight, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function MoleculesPage() {
  const { predictions } = useDiscovery();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'activity' | 'selectivity' | 'stability'>('activity');

  const filtered = predictions
    .filter(p => p.smiles.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const valA = a.metrics?.[sortBy] || 0;
      const valB = b.metrics?.[sortBy] || 0;
      return valB - valA;
    });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Structural Archive</h1>
           <p className="text-lg md:text-xl text-white/70 max-w-3xl leading-relaxed font-bold">Browse and filter the complete database of discovered catalyst architectures.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input 
                type="text" 
                placeholder="Search SMILES..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 pr-6 rounded-[20px] bg-white/5 border border-white/10 text-base font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-cyan/40 w-[320px] transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2 bg-white/5 p-1 rounded-[22px] border border-white/10">
              {(['activity', 'selectivity', 'stability'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSortBy(metric)}
                  className={cn(
                    "h-12 px-6 rounded-full text-xs font-mono font-black uppercase tracking-wider transition-all",
                    sortBy === metric 
                      ? "bg-cyan text-void shadow-[0_0_20px_rgba(14,165,233,0.3)]" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  {metric}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full h-[400px] border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center text-center p-12 bg-white/5 backdrop-blur-sm group hover:border-cyan/30 transition-all duration-700">
             <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-cyan/40 transition-all duration-500">
               <Database className="h-10 w-10 text-white/20 group-hover:text-cyan transition-all" />
             </div>
             <h3 className="text-3xl font-black text-white tracking-tight">No Assets Archived</h3>
             <p className="text-lg text-white/60 mt-4 max-w-[420px] leading-relaxed font-bold">Screen candidates on the dashboard to populate the structural database.</p>
          </div>
        ) : (
          filtered.map((p) => (
            <Link 
              key={p.smiles}
              href={`/molecules/${encodeURIComponent(p.smiles)}`}
              className="glass group rounded-[32px] border border-white/10 p-8 bg-white/5 hover:border-cyan/40 hover:bg-white/10 transition-all shadow-2xl hover:shadow-cyan/10"
            >
              <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                 <ArrowUpRight className="h-4 w-4 text-text-tertiary group-hover:text-cyan transition-all" />
              </div>
              
              <div className="mt-10">
                 <div className="text-[13px] font-mono uppercase tracking-[0.4em] text-white/60 font-black">Architecture</div>
                 <div className="text-xl font-mono text-white mt-3 truncate font-black">{p.smiles}</div>
              </div>

              <div className="grid grid-cols-3 gap-8 mt-12 pt-10 border-t border-white/20">
                 <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/50 font-black">Activity</div>
                    <div className="text-lg font-black text-cyan mt-2">{p.metrics?.activity?.toFixed(3) || '0.000'}</div>
                 </div>
                 <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/50 font-black">Selectivity</div>
                    <div className="text-lg font-black text-emerald mt-2">{p.metrics?.selectivity?.toFixed(1) || '0.0'}%</div>
                 </div>
                 <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/50 font-black">Stability</div>
                    <div className="text-lg font-black text-amber mt-2">{p.metrics?.stability?.toFixed(3) || '0.000'}</div>
                 </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

