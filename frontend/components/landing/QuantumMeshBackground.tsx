'use client';

import { motion } from 'framer-motion';

export default function QuantumMeshBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-void">
      {/* Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan/10 blur-[120px] animate-pulse" 
          style={{ animationDuration: '8s' }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald/10 blur-[120px] animate-pulse" 
          style={{ animationDuration: '12s' }}
        />
        <div 
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-quantum-purple/5 blur-[120px] animate-pulse" 
          style={{ animationDuration: '10s' }}
        />
      </div>

      {/* Discovery Beam - Central Focus */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-radial-gradient from-cyan/20 via-transparent to-transparent" />
      </div>

      {/* Scifi Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #00FFC6 1px, transparent 1px), linear-gradient(to bottom, #00FFC6 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
        }}
      />

      {/* Floating Discovery Nodes (GNN Inspired) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan/40"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{ 
              y: [null, '-=40px', '+=40px'],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{ 
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Bottom Blur Overlay for Content Clarity */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-void to-transparent z-20" />
    </div>
  );
}
