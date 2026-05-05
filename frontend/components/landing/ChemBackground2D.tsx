'use client';

import { motion } from 'framer-motion';

const molecules = [
  { id: 1, path: 'M 50 20 L 80 40 L 80 70 L 50 90 L 20 70 L 20 40 Z', top: '15%', left: '10%', delay: 0 },
  { id: 2, path: 'M 50 20 L 80 40 L 80 70 L 50 90 L 20 70 L 20 40 Z', top: '70%', left: '80%', delay: 2 },
  { id: 3, path: 'M 50 20 L 80 40 L 80 70 L 50 90 L 20 70 L 20 40 Z', top: '40%', left: '85%', delay: 4 },
  { id: 4, path: 'M 50 20 L 80 40 L 80 70 L 50 90 L 20 70 L 20 40 Z', top: '80%', left: '15%', delay: 6 },
];

export default function ChemBackground2D() {
  return (
    <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
      {molecules.map((mol) => (
        <motion.div
          key={mol.id}
          className="absolute opacity-10"
          style={{ top: mol.top, left: mol.left }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: mol.delay,
            ease: 'easeInOut',
          }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" className="fill-none stroke-neon-teal stroke-[0.5]">
            <path d={mol.path} />
            <circle cx="50" cy="20" r="2" className="fill-neon-teal" />
            <circle cx="80" cy="40" r="2" className="fill-electric-blue" />
            <circle cx="80" cy="70" r="2" className="fill-neon-teal" />
            <circle cx="50" cy="90" r="2" className="fill-quantum-purple" />
            <circle cx="20" cy="70" r="2" className="fill-neon-teal" />
            <circle cx="20" cy="40" r="2" className="fill-electric-blue" />
            
            {/* Double Bonds */}
            <path d="M 50 28 L 72 43" className="stroke-neon-teal/50" />
            <path d="M 80 62 L 58 77" className="stroke-neon-teal/50" />
            <path d="M 28 43 L 42 33" className="stroke-neon-teal/50" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
