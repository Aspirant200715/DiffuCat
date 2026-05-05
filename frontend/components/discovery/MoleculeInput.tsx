'use client';

import { useState } from 'react';
import { usePredict, useGenerateCandidates } from '@/hooks/useMolecule';
import { Sparkles } from 'lucide-react';

const presets = [
  { label: 'Ethanol', value: 'CCO' },
  { label: 'Benzene', value: 'c1ccccc1' },
  { label: 'Aspirin', value: 'CC(=O)O' },
];

export function MoleculeInput() {
  const [input, setInput] = useState('');
  const predictMutation = usePredict();
  const generateMutation = useGenerateCandidates();

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
    <div className="glass rounded-2xl border border-border/80 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-surface-1/60">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-text-tertiary">SMILES Input Terminal</div>
          <div className="text-sm text-text-secondary">Paste or generate candidates</div>
        </div>
        <button
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full border border-cyan/40 text-cyan hover:bg-cyan/10"
          disabled={generateMutation.isPending}
        >
          <Sparkles className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          {generateMutation.isPending ? 'Generating' : 'AI Generate'}
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="relative bg-[#050a07] border border-cyan/20 rounded-xl p-4 font-mono text-sm">
          <span className="absolute left-4 top-4 text-cyan">&gt;</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="CCO, c1ccccc1, CC(=O)O"
            className="w-full pl-6 pr-2 bg-transparent text-text-primary outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
          />
          <span className="absolute right-4 top-4 h-4 w-2 bg-cyan/60 cursor-blink" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-tertiary">Presets</span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => appendPreset(preset.value)}
              className="px-3 py-1.5 rounded-full border border-border/70 text-xs font-mono text-text-secondary hover:text-cyan hover:border-cyan/40"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 border-t border-border/70 flex items-center justify-between">
        <div className="text-xs text-text-tertiary font-mono">Max 12 candidates recommended for live demos</div>
        <button
          onClick={handlePredict}
          disabled={predictMutation.isPending || !input.trim()}
          className="px-6 h-11 rounded-full bg-cyan text-void font-semibold shadow-[0_0_20px_rgba(14,165,233,0.35)]"
        >
          {predictMutation.isPending ? 'Running...' : 'Run Calculation'}
        </button>
      </div>
    </div>
  );
}
