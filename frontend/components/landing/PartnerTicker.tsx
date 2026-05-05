'use client';

import { motion } from 'framer-motion';

const partners = [
  { name: 'PHARMA', accent: 'CORP', color: 'text-neon-teal' },
  { name: 'BIO', accent: 'LABS', color: 'text-electric-blue' },
  { name: 'CATALYST', accent: 'ONE', color: 'text-quantum-purple' },
  { name: 'QUANTUM', accent: 'CHEM', color: 'text-neon-teal' },
  { name: 'NOVA', accent: 'SYNTH', color: 'text-electric-blue' },
];

export default function PartnerTicker() {
  return (
    <div className="relative w-full py-12 bg-void border-b border-white/5 overflow-hidden group">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-void to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-void to-transparent z-10" />
      
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
        className="flex whitespace-nowrap gap-24 items-center"
      >
        {[...partners, ...partners, ...partners, ...partners].map((partner, i) => (
          <div 
            key={i} 
            className="text-2xl font-black font-display tracking-tighter text-white opacity-60 hover:opacity-100 transition-opacity flex items-center"
          >
            {partner.name}<span className={partner.color}>{partner.accent}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
