'use client';

import { useState } from 'react';
import { Settings, Cpu, Globe, Database, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [compute, setCompute] = useState('a100');
  const [precision, setPrecision] = useState('high');

  const handleComputeChange = (mode: string) => {
    setCompute(mode);
    toast.success(`Compute engine switched to ${mode === 'a100' ? 'NVIDIA A100' : 'H100 Cluster'}`);
  };

  const handlePrecisionChange = (mode: string) => {
    setPrecision(mode);
    toast.success(`Precision mode set to ${mode === 'standard' ? 'Standard' : 'High Fidelity'}`);
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="absolute inset-0 -z-10 molecular-grid-bg opacity-20 pointer-events-none" />
      
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-text-primary mb-2">Global Settings</h1>
        <p className="text-lg text-text-secondary max-w-2xl">Configure engine parameters and laboratory orchestration settings.</p>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-3xl border border-border/80 p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <Cpu className="h-6 w-6 text-cyan" />
                 <div>
                    <h3 className="text-xl font-bold">Compute Engine</h3>
                    <p className="text-sm text-text-tertiary">Select the hardware backend for GNN inference.</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={() => handleComputeChange('a100')}
                   className={cn(
                     "px-6 py-2 rounded-xl font-bold text-xs transition-all",
                     compute === 'a100' ? "bg-cyan text-void shadow-[0_0_20px_rgba(14,165,233,0.3)]" : "bg-surface-2 border border-border/60 text-text-secondary hover:text-text-primary"
                   )}
                 >
                   NVIDIA A100
                 </button>
                 <button 
                   onClick={() => handleComputeChange('h100')}
                   className={cn(
                     "px-6 py-2 rounded-xl font-bold text-xs transition-all",
                     compute === 'h100' ? "bg-cyan text-void shadow-[0_0_20px_rgba(14,165,233,0.3)]" : "bg-surface-2 border border-border/60 text-text-secondary hover:text-text-primary"
                   )}
                 >
                   H100 Cluster
                 </button>
              </div>
           </div>

           <div className="flex items-center justify-between pt-8 border-t border-border/40">
              <div className="flex items-center gap-4">
                 <Zap className="h-6 w-6 text-amber" />
                 <div>
                    <h3 className="text-xl font-bold">Precision Mode</h3>
                    <p className="text-sm text-text-tertiary">Balance speed vs prediction accuracy.</p>
                 </div>
              </div>
              <div className="flex bg-void/50 p-1 rounded-xl border border-border/40">
                 <button 
                   onClick={() => handlePrecisionChange('standard')}
                   className={cn(
                     "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                     precision === 'standard' ? "bg-surface-2 text-text-primary shadow-lg" : "text-text-tertiary hover:text-text-secondary"
                   )}
                 >
                   Standard
                 </button>
                 <button 
                   onClick={() => handlePrecisionChange('high')}
                   className={cn(
                     "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                     precision === 'high' ? "bg-surface-2 text-amber shadow-lg" : "text-text-tertiary hover:text-text-secondary"
                   )}
                 >
                   High Fidelity
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
