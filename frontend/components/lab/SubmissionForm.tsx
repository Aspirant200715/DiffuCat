'use client';

import { useState, useEffect } from 'react';
import { useSubmitLabJob } from '@/hooks/useLabJobs';
import { useSearchParams } from 'next/navigation';

export function SubmissionForm() {
  const [input, setInput] = useState('');
  const searchParams = useSearchParams();
  const submitMutation = useSubmitLabJob();

  useEffect(() => {
    const smiles = searchParams.get('smiles');
    if (smiles) {
      setInput(smiles);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const candidates = input.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (candidates.length) {
      submitMutation.mutate(candidates, { onSuccess: () => setInput('') });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl border border-border/80 p-6 space-y-4">
      <div>
        <div className="text-[13px] font-mono uppercase tracking-[0.4em] text-white/70 font-black">New Lab Job</div>
        <h3 className="text-3xl font-black mt-4 text-white tracking-tighter">Experimental Forge</h3>
        <p className="text-base font-bold text-white/80 mt-4 leading-relaxed">Submit high-confidence candidates for synthesis.</p>
      </div>

      <div>
        <label className="block text-sm font-mono uppercase tracking-[0.4em] text-white/60 mb-4 font-black">Candidate SMILES</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="CCO, c1ccccc1, CC(=O)O..."
          className="w-full min-h-[180px] rounded-[28px] bg-void/50 border border-white/10 p-6 text-base font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-cyan/40 focus:bg-void/80 transition-all resize-none font-bold"
        />
      </div>

      <button
        type="submit"
        disabled={submitMutation.isPending || !input.trim()}
        className="w-full h-16 rounded-full bg-cyan text-void font-black uppercase tracking-[0.2em] text-base shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
      >
        {submitMutation.isPending ? 'Submitting...' : 'Queue for Synthesis'}
      </button>
    </form>
  );
}
