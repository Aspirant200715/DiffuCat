'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const MoleculeViewer3D = dynamic(() => import('@/components/visualization/MoleculeViewer3D'), { ssr: false });

export default function MoleculeFeatureSection() {
  return (
    <section className="py-28 px-6 bg-surface-1">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-tertiary">3D Molecular Archive</p>
          <h2 className="text-3xl md:text-5xl font-semibold mt-4">Interactive Structures, Real Time</h2>
          <p className="text-text-secondary mt-4 leading-relaxed">
            Inspect geometry, infer steric strain, and validate electronic features before a single drop hits the lab.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-text-primary">
            {['PubChem 3D SDF streaming', 'Auto-spin with hover pause', 'Multiple rendering modes'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-emerald" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/molecules/c1ccccc1" className="inline-flex items-center mt-8 px-6 h-11 rounded-full border border-cyan/40 text-cyan hover:bg-cyan/10">
            Explore Molecules
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-2xl overflow-hidden border border-cyan/20 shadow-[0_0_40px_rgba(14,165,233,0.2)]"
        >
          <MoleculeViewer3D smiles="c1ccccc1" height="420px" />
        </motion.div>
      </div>
    </section>
  );
}
