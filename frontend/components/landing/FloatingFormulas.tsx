'use client';

import { motion } from 'framer-motion';

const formulas = [
  'H2O', 'CO2', 'NaCl', 'CH4', 'C6H12O6', 'NH3', 'HCl', 'H2SO4', 'C2H5OH', 'C6H6',
  'NO2', 'SO2', 'CaCO3', 'NaHCO3', 'KMnO4', 'CH3COOH', 'C8H10N4O2', 'O2', 'N2', 'H2'
];

export default function FloatingFormulas() {
  return (
    <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden select-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%',
            opacity: 0,
            scale: 1 + Math.random() * 0.5
          }}
          animate={{ 
            y: [null, '-30vh'],
            opacity: [0, 0.9, 0.9, 0],
            x: [null, (Math.random() - 0.5) * 100 + 'px']
          }}
          transition={{ 
            duration: 12 + Math.random() * 12, 
            repeat: Infinity, 
            ease: 'linear',
            delay: Math.random() * -24
          }}
          className="absolute text-[18px] font-mono font-black text-neon-teal drop-shadow-[0_0_15px_rgba(0,255,198,0.8)]"
        >
          {formulas[i % formulas.length]}
        </motion.div>


      ))}
    </div>
  );
}
