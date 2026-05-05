'use client';

import { MoleculeInput } from '@/components/discovery/MoleculeInput';
import { PredictionTable } from '@/components/discovery/PredictionTable';
import { PropertyRadar } from '@/components/visualization/PropertyRadar';
import { useDiscovery } from '@/store/discovery';
import Link from 'next/link';

export default function DashboardPage() {
  const { predictions } = useDiscovery();
  const topCandidate = predictions[0];
  const topUcb = [...predictions]
    .filter((p) => p.ucb_score !== undefined)
    .sort((a, b) => (b.ucb_score ?? 0) - (a.ucb_score ?? 0))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-8">
        <MoleculeInput />
        <PredictionTable />
      </div>

      <div className="lg:col-span-4 space-y-6">
        <PropertyRadar data={predictions} />

        <div className="glass rounded-2xl border border-border/80 p-6">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Counterfactual Hint</div>
          <p className="mt-3 text-sm text-text-primary">
            {topCandidate?.counterfactual_hint || 'Generate predictions to surface chemist-grade counterfactuals.'}
          </p>
        </div>

        <div className="glass rounded-2xl border border-border/80 p-6">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Top UCB Ranking</div>
          <div className="mt-4 space-y-3">
            {topUcb.length === 0 ? (
              <div className="text-xs text-text-tertiary font-mono">No ranking available</div>
            ) : (
              topUcb.map((p, idx) => (
                <Link
                  key={p.smiles}
                  href={`/molecules/${encodeURIComponent(p.smiles)}`}
                  className="flex items-center justify-between text-sm text-text-secondary hover:text-cyan"
                >
                  <span className="font-mono text-xs text-text-tertiary">#{idx + 1}</span>
                  <span className="flex-1 ml-3 font-mono truncate">{p.smiles}</span>
                  <span className="text-amber font-mono">{(p.ucb_score ?? 0).toFixed(2)}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
