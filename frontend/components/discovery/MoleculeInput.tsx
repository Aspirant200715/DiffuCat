'use client';

import { useState, useEffect } from 'react';
import { usePredict, useGenerateCandidates } from '@/hooks/useMolecule';
import { Sparkles, Terminal, Activity, Zap, Search, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const presets = [
  { label: 'Ethanol', value: 'CCO' },
  { label: 'Benzene', value: 'c1ccccc1' },
  { label: 'Aspirin', value: 'CC(=O)O' },
];

const steps = [
  "Validating Molecular Graph",
  "Running MPNN Property Predictor",
  "Calculating Uncertainty Heatmap",
  "Generating 3D Conformer"
];

export function MoleculeInput() {
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const predictMutation = usePredict();
  const generateMutation = useGenerateCandidates();

  // Simulate step progress when predicting
  useEffect(() => {
    if (predictMutation.isPending) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [predictMutation.isPending]);

  const handlePredict = () => {
    if (!input.trim()) return;
    const smilesList = input.split(',').map((s) => s.trim()).filter(Boolean);
    predictMutation.mutate(smilesList);
  };

  const handleGenerate = () => {
    generateMutation.mutate('default', {
      onSuccess: (data) => {
        if (data?.candidates?.length) {
          setInput(data.candidates.join(', '));
        }
      },
    });
  };

  const appendPreset = (value: string) => {
    setInput((prev) => (prev ? `${prev}, ${value}` : value));
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl border border-border/80 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-surface-1/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/20">
            <Terminal className="h-4 w-4 text-cyan" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-text-tertiary">Discovery Engine</div>
            <div className="text-sm font-semibold text-text-primary">Molecular Input Terminal</div>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          className="group relative inline-flex items-center gap-2 px-4 h-9 rounded-full bg-void border border-cyan/30 text-cyan hover:border-cyan hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all overflow-hidden"
          disabled={generateMutation.isPending}
        >
          <div className="absolute inset-0 bg-cyan/5 group-hover:bg-cyan/10 transition-colors" />
          <Sparkles className={`h-4 w-4 relative z-10 ${generateMutation.isPending ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
          <span className="text-xs font-mono uppercase tracking-wider relative z-10">
            {generateMutation.isPending ? 'Generating...' : 'AI Generate'}
          </span>
        </button>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
        <div className="relative">
          <div className="absolute top-4 left-4 text-cyan font-mono select-none">&gt;</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter SMILES strings separated by commas..."
            className="w-full min-h-[120px] pl-10 pr-4 py-4 bg-[#050a07] border border-cyan/20 rounded-xl font-mono text-sm text-text-primary placeholder:text-text-tertiary/50 outline-none focus:border-cyan/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all resize-none"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePredict())}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-text-tertiary cursor-help hover:text-cyan transition-colors" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-tertiary flex items-center gap-2">
             Quick Presets <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => appendPreset(preset.value)}
                className="px-4 py-2 rounded-lg bg-surface-2/30 border border-border/70 text-xs font-mono text-text-secondary hover:text-cyan hover:border-cyan/40 hover:bg-cyan/5 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {predictMutation.isPending && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-surface-2/50 border border-cyan/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan flex items-center gap-2">
                  <Activity className="h-3 w-3 animate-pulse" /> Processing Job
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${i <= currentStep ? 'bg-cyan shadow-[0_0_8px_rgba(14,165,233,0.8)]' : 'bg-surface-3'}`} />
                    <span className={`text-[11px] font-mono transition-colors duration-500 ${i === currentStep ? 'text-text-primary' : i < currentStep ? 'text-text-tertiary' : 'text-text-tertiary/40'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="h-1 w-full bg-surface-3 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 py-5 border-t border-border/70 bg-surface-1/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-mono">
          <Zap className="h-3 w-3 text-amber" /> 
          <span>Optimized for real-time GNN inference</span>
        </div>
        <button
          onClick={handlePredict}
          disabled={predictMutation.isPending || !input.trim()}
          className="relative px-8 h-11 rounded-full bg-cyan text-void font-bold uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:shadow-[0_0_35px_rgba(14,165,233,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 overflow-hidden"
        >
          <span className="relative z-10">{predictMutation.isPending ? 'Calculating...' : 'Run Engine'}</span>
          {predictMutation.isPending && (
             <motion.div 
                className="absolute inset-0 bg-white/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             />
          )}
        </button>
      </div>
    </div>
  );
}
