'use client';

import { useState } from 'react';
import { useSubmitLabJob } from '@/hooks/useLabJobs';

export function SubmissionForm() {
  const [input, setInput] = useState('');
  const submitMutation = useSubmitLabJob();

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
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">New Lab Job</div>
        <h3 className="text-lg font-semibold mt-2">Experimental Forge</h3>
        <p className="text-sm text-text-secondary mt-2">Submit high-confidence candidates for synthesis.</p>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary mb-2">Candidate SMILES</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="CCO, c1ccccc1, CC(=O)O"
          className="w-full min-h-[140px] rounded-xl bg-surface-1/80 border border-border/70 p-3 text-sm font-mono text-text-primary focus:outline-none focus:border-cyan/60"
        />
      </div>

      <button
        type="submit"
        disabled={submitMutation.isPending || !input.trim()}
        className="w-full h-11 rounded-full bg-cyan text-void font-semibold shadow-[0_0_20px_rgba(14,165,233,0.35)]"
      >
        {submitMutation.isPending ? 'Submitting…' : 'Queue for Synthesis'}
      </button>
    </form>
  );
}
