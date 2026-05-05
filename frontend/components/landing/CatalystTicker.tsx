'use client';

import { motion } from 'framer-motion';

const catalysts = [
  'Grubbs Catalyst', 'Wilkinson\'s Catalyst', 'Ziegler-Natta', 'Adams\' Catalyst',
  'Raney Nickel', 'Palladium on Carbon', 'Lindlar Catalyst', 'Pearlman\'s Catalyst',
  'N2 + 3H2 → 2NH3', '2H2 + O2 → 2H2O', 'CO + 2H2 → CH3OH', 'CH4 + H2O → CO + 3H2',
  'ΔG = ΔH - TΔS', 'PV = nRT', 'Ka = [H+][A-] / [HA]', 'E = E° - (RT/nF)lnQ'
];

export default function CatalystTicker() {
  return (
    <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden opacity-[0.07] select-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%',
            opacity: 0 
          }}
          animate={{ 
            y: [null, '-20vh'],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 15 + Math.random() * 15, 
            repeat: Infinity, 
            ease: 'linear',
            delay: Math.random() * -30
          }}
          className="absolute text-[10px] font-mono font-bold tracking-widest text-white whitespace-nowrap"
        >
          {catalysts[i % catalysts.length]}
        </motion.div>
      ))}
    </div>
  );
}
