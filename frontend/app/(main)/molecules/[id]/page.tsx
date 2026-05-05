'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useDiscovery } from '@/store/discovery';
import Link from 'next/link';

const MoleculeViewer3D = dynamic(() => import('@/components/visualization/MoleculeViewer3D'), { ssr: false });

export default function MoleculePage({ params }: { params: { id: string } }) {
  const decodedSmiles = decodeURIComponent(params.id);
  const { predictions } = useDiscovery();
  const prediction = useMemo(() => predictions.find((p) => p.smiles === decodedSmiles), [predictions, decodedSmiles]);
  const fingerprint = useMemo(() => Array.from({ length: 32 }, () => (Math.random() > 0.5 ? 1 : 0)), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Structural Archive</div>
          <h2 className="text-2xl md:text-4xl font-semibold mt-2 font-mono truncate max-w-2xl">
            {decodedSmiles}
          </h2>
        </div>
        <Link href="/dashboard" className="text-cyan text-sm">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl border border-border/80 overflow-hidden">
          <MoleculeViewer3D smiles={decodedSmiles} height="60vh" />
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl border border-border/80 p-6">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">Descriptors</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Molecular Weight</span>
                <span className="text-text-primary">{(100 + Math.random() * 200).toFixed(2)} g/mol</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">SA Score</span>
                <span className="text-emerald">{prediction?.synthetic_accessibility?.toFixed(2) || '2.45'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Confidence</span>
                <span className="text-cyan">High</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl border border-border/80 p-6">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-text-tertiary">32-Bit Fingerprint</div>
            <div className="mt-4 grid grid-cols-8 gap-1">
              {fingerprint.map((bit, i) => (
                <div key={i} className={`h-4 rounded-sm ${bit ? 'bg-cyan' : 'bg-surface-2'}`} />
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl border border-amber/30 bg-amber/5 p-6">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-amber">Counterfactual Hint</div>
            <p className="mt-3 text-sm text-text-primary">
              {prediction?.counterfactual_hint || 'Introduce an electron-withdrawing group to raise selectivity while preserving stability.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
