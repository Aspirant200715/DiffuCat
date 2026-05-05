'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Points, PointMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

function LatentConvergence() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;

  const [positions, targets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const tar = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Chaotic Noise State (Spherical cloud)
      const r = 2.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Target Lattice State (Grid/Crystal structure)
      const x = (i % 15) - 7.5;
      const y = (Math.floor(i / 15) % 15) - 7.5;
      const z = (Math.floor(i / 225) % 15) - 7.5;
      tar[i * 3] = x * 0.3;
      tar[i * 3 + 1] = y * 0.3;
      tar[i * 3 + 2] = z * 0.3;
    }
    return [pos, tar];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = (Math.sin(state.clock.getElapsedTime() * 0.5) + 1) / 2; // 0 to 1 loop
    const currentPos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count * 3; i++) {
      // Interpolate between noise and target
      currentPos[i] = THREE.MathUtils.lerp(positions[i], targets[i], t);
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.002;
    pointsRef.current.rotation.x += 0.001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#00FFC6"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function DiffusionViz() {
  return (
    <div className="relative h-[450px] w-full rounded-[32px] overflow-hidden bg-void">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,198,0.1),transparent_70%)]" />
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <LatentConvergence />
      </Canvas>
      
      {/* Decorative Overlays */}
      <div className="absolute top-6 left-6 flex flex-col gap-1">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-teal">Signal-to-Noise</div>
        <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: ['20%', '100%', '20%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full bg-neon-teal shadow-[0_0_8px_rgba(0,255,198,0.8)]"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center">
        <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
            Molecular Crystal Convergence Loop
          </div>
        </div>
      </div>
    </div>
  );
}
