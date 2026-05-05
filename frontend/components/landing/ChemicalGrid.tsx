'use client';

import { motion } from 'framer-motion';

const formulas = [
  'NaOH', 'O2', 'CO2', 'CH4', 'H2O', 'NaCl', 'HCl', 'H2SO4', 'NH3', 'C6H6',
  'C2H5OH', 'C6H12O6', 'NO2', 'SO2', 'CaCO3', 'NaHCO3', 'KMnO4', 'CH3COOH',
  'LiOH', 'KOH', 'Mg(OH)2', 'Fe2O3', 'Al2O3', 'SiO2', 'TiO2', 'AgNO3', 'CuSO4',
  'N2', 'H2', 'Cl2', 'Br2', 'I2', 'P4', 'S8', 'K2Cr2O7', 'Na2S2O3', 'C2H2'
];

export default function ChemicalGrid() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      <div className="grid grid-cols-6 md:grid-cols-12 gap-10 p-10 rotate-[-5deg] scale-150">
        {Array.from({ length: 180 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.05 }}
            animate={{ 
              opacity: [0.05, 0.25, 0.05],
              scale: [1, 1.1, 1],
              textShadow: [
                '0 0 0px rgba(0,255,198,0)',
                '0 0 10px rgba(0,255,198,0.5)',
                '0 0 0px rgba(0,255,198,0)'
              ]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              ease: 'easeInOut',
              delay: Math.random() * -10
            }}
            className="text-[10px] font-mono font-black uppercase tracking-widest text-neon-teal/60 whitespace-nowrap"
          >
            {formulas[i % formulas.length]}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
