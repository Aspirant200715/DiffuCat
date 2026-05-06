'use client';

import { useState, useEffect } from 'react';
import { usePredict, useGenerateCandidates } from '@/hooks/useMolecule';
import { Sparkles, Terminal, Activity, Zap, Search, HelpCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const presets = [
  { label: 'Ethanol', value: 'CCO', desc: 'Simple alcohol base' },
  { label: 'Benzene', value: 'c1ccccc1', desc: 'Aromatic ring structure' },
  { label: 'Aspirin', value: 'CC(=O)Oc1ccccc1C(=O)O', desc: 'Complex medicinal architecture' },
];

const steps = [
  { title: "Graph Validation", desc: "Verifying molecular connectivity and valency." },
  { title: "GNN Inference", desc: "Running the Graph Neural Network to predict properties." },
  { title: "Uncertainty Mapping", desc: "Calculating the model's confidence in this specific structure." },
  { title: "Conformer Generation", desc: "Building the optimized 3D physical structure." }
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
    <TooltipProvider>
      <div className="flex flex-col h-full glass rounded-2xl border border-border/80 overflow-hidden shadow-2xl group">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-surface-1/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-cyan/10 border border-cyan/20 group-hover:bg-cyan/20 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all">
              <Terminal className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <div className="text-sm font-mono uppercase tracking-[0.4em] text-text-tertiary">Control Interface</div>
              <div className="text-xl font-black tracking-tight text-text-primary">Molecular Architecture Terminal</div>
            </div>
          </div>
          
          <Tooltip>
            <TooltipTrigger>
              <div
                onClick={handleGenerate}
                className="group relative inline-flex items-center gap-4 px-8 h-14 rounded-2xl bg-void border border-cyan/30 text-cyan hover:border-cyan hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-cyan/5 group-hover:bg-cyan/10 transition-colors" />
                <Sparkles className={`h-6 w-6 relative z-10 ${generateMutation.isPending ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                <span className="text-base font-black uppercase tracking-[0.2em] relative z-10">
                  {generateMutation.isPending ? 'Generating...' : 'AI Generate'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white border-white text-xs text-black font-medium max-w-[200px] shadow-2xl">
               Let the AI propose novel catalyst structures based on learned patterns.
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">
          <div className="relative">
            <div className="absolute top-6 left-6 text-cyan/40 font-mono select-none text-base">&gt;_</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter SMILES notation (e.g., CCO, c1ccccc1)..."
              className="w-full min-h-[200px] pl-16 pr-4 py-6 bg-void/50 border border-cyan/10 rounded-[32px] font-mono text-lg text-text-primary placeholder:text-text-tertiary/40 outline-none focus:border-cyan/40 focus:bg-void/80 transition-all resize-none shadow-inner"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePredict())}
            />
            <div className="absolute bottom-6 right-6">
              <Tooltip>
                <TooltipTrigger>
                  <div className="p-1.5 rounded-full hover:bg-cyan/10 transition-colors cursor-help">
                    <HelpCircle className="h-4 w-4 text-text-tertiary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4 bg-white border-white shadow-2xl">
                  <div className="space-y-2">
                    <p className="text-xs font-black text-cyan uppercase tracking-[0.2em]">What is SMILES?</p>
                    <p className="text-[11px] leading-relaxed text-black font-medium">
                      Simplified Molecular Input Line Entry System. It's a notation for representing chemical structures as text strings. 
                      <br/><br/>
                      Example: <span className="text-cyan font-bold font-mono">C1=CC=CC=C1</span> represents Benzene.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-tertiary flex items-center gap-2">
               Educational Presets <div className="h-px flex-1 bg-border/40" />
            </div>
            <div className="flex flex-wrap gap-3">
              {presets.map((preset) => (
                <Tooltip key={preset.label}>
                  <TooltipTrigger>
                    <div
                      onClick={() => appendPreset(preset.value)}
                      className="px-4 py-2.5 rounded-xl bg-surface-2/30 border border-border/70 text-xs font-mono text-text-secondary hover:text-cyan hover:border-cyan/40 hover:bg-cyan/5 transition-all flex flex-col items-start gap-1 cursor-pointer"
                    >
                      <span className="font-bold text-[10px] text-text-primary">{preset.label}</span>
                      <span className="text-[9px] opacity-60">{preset.value}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white border-white shadow-2xl">
                    <span className="text-[11px] text-black font-medium">{preset.desc}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {predictMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-cyan/5 border border-cyan/20 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-cyan animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan font-bold">Inference Engine Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`h-2 w-2 rounded-full transition-all duration-700 ${i <= currentStep ? 'bg-cyan shadow-[0_0_10px_rgba(14,165,233,1)]' : 'bg-surface-3 opacity-30'}`} />
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-bold tracking-tight transition-colors duration-500 ${i === currentStep ? 'text-text-primary' : i < currentStep ? 'text-text-tertiary' : 'text-text-tertiary/30'}`}>
                          {step.title}
                        </span>
                        {i === currentStep && (
                          <motion.span 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-[9px] text-cyan/70 font-mono mt-0.5"
                          >
                            {step.desc}
                          </motion.span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="h-1.5 w-full bg-void rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan/40 via-cyan to-cyan/40 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 1.5 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-8 py-6 border-t border-border/70 bg-surface-1/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-3 w-3 rounded-full bg-emerald shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">NVIDIA A100 GPU: ACTIVE</span>
          </div>
          <button
            onClick={handlePredict}
            disabled={predictMutation.isPending || !input.trim()}
            className="relative px-12 h-16 rounded-full bg-cyan text-void font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:shadow-[0_0_50px_rgba(14,165,233,0.7)] hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center gap-4">
              {predictMutation.isPending ? 'Synthesizing...' : 'Run Discovery Engine'} 
              <Zap className="h-5 w-5" />
            </span>
            {predictMutation.isPending && (
               <motion.div 
                  className="absolute inset-0 bg-white/30"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
               />
            )}
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
}
