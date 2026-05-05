'use client';

import { motion } from 'framer-motion';

const formulas = [
  'C6H6', 'H2O', 'CO2', 'CH4', 'NH3', 'C2H5OH', 'C6H12O6', 'H2SO4',
  'NaCl', 'HCl', 'NaOH', 'CaCO3', 'O2', 'N2', 'Fe2O3', 'CuSO4',
  'SMILES: C1=CC=CC=C1', 'SMILES: CC(=O)O', 'SMILES: CCN(CC)CC',
  'ΔG < 0', 'pKa: 4.76', 'mol_weight: 180.16', 'logP: 1.25'
];

export default function ChemicalGenome() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03] select-none">
      <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4">
        {Array.from({ length: 48 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 1 }}
            className="text-[10px] font-mono font-bold tracking-widest text-white whitespace-nowrap rotate-[-15deg]"
          >
            {formulas[i % formulas.length]}
          </motion.div>
        ))}
      </div>
      
      {/* Floating SMILES Stream */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-around">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`stream-${i}`}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 20 + Math.random() * 20, 
              repeat: Infinity, 
              ease: 'linear',
              delay: Math.random() * -20
            }}
            className="text-[8px] font-mono text-neon-teal whitespace-nowrap opacity-50"
          >
            SMILES: CC(=O)OC1=CC=CC=C1C(=O)O | CC(C)CC1=CC=C(C=C1)C(C)C(=O)O | CN1C=NC2=C1C(=O)N(C(=O)N2C)C
          </motion.div>
        ))}
      </div>
    </div>
  );
}
