'use client';

import { useMemo, useState } from 'react';
import { useDiscovery } from '@/store/discovery';
import { UncertaintyBar } from '@/components/visualization/UncertaintyBar';
import { ParetoBadge } from '@/components/discovery/ParetoBadge';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

type SortKey = 'activity' | 'selectivity' | 'stability' | 'ucb';

export function PredictionTable() {
  const { predictions } = useDiscovery();
  const [sortKey, setSortKey] = useState<SortKey>('ucb');
  const [paretoOnly, setParetoOnly] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

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
      <div className="h-64 flex items-center justify-center border border-dashed border-border/70 rounded-xl bg-surface-0/60">
        <p className="text-text-tertiary font-mono text-sm">Waiting for prediction results</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl border border-border/80 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
        <div className="text-sm font-semibold">Prediction Results</div>
        <button
          onClick={() => setParetoOnly((v) => !v)}
          className="text-xs font-mono uppercase tracking-[0.3em] text-cyan"
        >
          {paretoOnly ? 'Showing Pareto' : 'Filter Pareto'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] font-mono uppercase tracking-[0.3em] text-text-tertiary">
            <tr>
              <th className="px-6 py-3 text-left">SMILES</th>
              <HeaderCell label="Activity" onClick={() => setSortKey('activity')} active={sortKey === 'activity'} />
              <HeaderCell label="Selectivity" onClick={() => setSortKey('selectivity')} active={sortKey === 'selectivity'} />
              <HeaderCell label="Stability" onClick={() => setSortKey('stability')} active={sortKey === 'stability'} />
              <HeaderCell label="UCB" onClick={() => setSortKey('ucb')} active={sortKey === 'ucb'} align="right" />
              <th className="px-6 py-3 text-center">Pareto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sorted.map((p) => (
              <tr
                key={p.smiles}
                className="group hover:bg-surface-1/40 cursor-pointer"
                onClick={() => setExpanded(expanded === p.smiles ? null : p.smiles)}
              >
                <td className="px-6 py-4 font-mono text-cyan truncate max-w-[200px]">
                  {p.smiles}
                </td>
                <MetricCell value={p.metrics?.activity ?? 0} unc={p.uncertainty?.activity ?? 0} color="bg-cyan" />
                <MetricCell value={p.metrics?.selectivity ?? 0} unc={p.uncertainty?.selectivity ?? 0} color="bg-emerald" />
                <MetricCell value={p.metrics?.stability ?? 0} unc={p.uncertainty?.stability ?? 0} color="bg-amber" />
                <td className="px-6 py-4 text-right font-mono text-amber">
                  {(p.ucb_score ?? 0).toFixed(3)}
                </td>
                <td className="px-6 py-4 text-center">
                  <ParetoBadge optimal={p.pareto_optimal} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expanded && (
        <div className="border-t border-border/60 bg-surface-1/60 px-6 py-4 text-sm">
          {(() => {
            const p = predictions.find((row) => row.smiles === expanded);
            if (!p) return null;
            return (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-text-secondary">
                  <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Counterfactual Hint</div>
                  <div className="mt-2 text-text-primary">{p.counterfactual_hint || 'No counterfactual hint available.'}</div>
                </div>
                <Link
                  href={`/molecules/${encodeURIComponent(p.smiles)}`}
                  className="inline-flex items-center gap-2 text-cyan font-mono text-xs uppercase tracking-[0.2em]"
                >
                  View 3D Structure
                </Link>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function HeaderCell({ label, onClick, active, align = 'left' }: { label: string; onClick: () => void; active: boolean; align?: 'left' | 'right' }) {
  return (
    <th className={`px-6 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button onClick={onClick} className="inline-flex items-center gap-1">
        {label}
        <ChevronDown className={`h-3 w-3 ${active ? 'text-cyan' : 'text-text-tertiary'}`} />
      </button>
    </th>
  );
}

function MetricCell({ value, unc, color }: { value: number; unc: number; color: string }) {
  return (
    <td className="px-6 py-4">
      <div className="flex flex-col gap-1 w-28">
        <span className="text-text-primary text-xs">
          {value.toFixed(3)} <span className="text-text-tertiary">±{unc.toFixed(3)}</span>
        </span>
        <UncertaintyBar value={value} uncertainty={unc} color={color} />
      </div>
    </td>
  );
}
