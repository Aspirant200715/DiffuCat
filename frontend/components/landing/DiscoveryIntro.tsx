'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Stars, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const THEME_COLOR = "#0EA5E9"; // Premium Electric Blue
const CORE_COLOR = "#FFFFFF";

function NodeRays({ position, direction }: { position: [number, number, number], direction: THREE.Vector3 }) {
  // Point rays outward from the molecule center
  const lookAtPos = new THREE.Vector3().addVectors(new THREE.Vector3(...position), direction);
  
  return (
    <group position={position}>
      {[...Array(3)].map((_, i) => (
        <mesh key={i} onUpdate={(self) => self.lookAt(lookAtPos)}>
          <cylinderGeometry args={[0.001, 0.4, 40, 12, 1, true]} />
          <meshBasicMaterial 
            color={THEME_COLOR} 
            transparent 
            opacity={0.04} 
            blending={THREE.AdditiveBlending} 
          />
        </mesh>
      ))}
    </group>
  );
}

function GlowingNode({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Physical Atom (Small White Ball) */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Perfect Circular Glow Halo */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial 
          color={THEME_COLOR} 
          transparent 
          opacity={0.12} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
    </group>
  );
}

function CatalystCage() {
  const group = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.Group>(null);

  const { atoms, bonds } = useMemo(() => {
    const pts: [number, number, number][] = [];
    const bnds: [number, number][] = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices: [number, number, number][] = [
      [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
    ];
    vertices.forEach(v => pts.push([v[0] * 2, v[1] * 2, v[2] * 2]));
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i][0] - pts[j][0];
        const dy = pts[i][1] - pts[j][1];
        const dz = pts[i][2] - pts[j][2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 4.5) bnds.push([i, j]);
      }
    }
    return { atoms: pts, bonds: bnds };
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    // Unified rotation for the entire structure
    group.current.rotation.y = t * 0.15;
    group.current.rotation.z = t * 0.05;
    
    if (coreRef.current) {
        const s = 1 + Math.sin(t * 1.5) * 0.05;
        coreRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={group}>
      {/* Central Core Ball (Nucleus) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color={CORE_COLOR} />
      </mesh>
      
      {/* Refined Nucleus Rays - Synchronized with structure */}
      <group>
        {[...Array(64)].map((_, i) => {
           const phi = Math.acos(-1 + (2 * i) / 64);
           const theta = Math.sqrt(64 * Math.PI) * phi;
           return (
             <mesh 
               key={i} 
               rotation={[phi, theta, 0]}
               position={[0, 0, 0]}
             >
                <cylinderGeometry args={[0.0005, 0.5, 100, 16, 1, true]} />
                <meshBasicMaterial 
                  color="#22D3EE" 
                  transparent 
                  opacity={0.15} 
                  blending={THREE.AdditiveBlending} 
                />
             </mesh>
           );
        })}
      </group>

      {/* Atoms (Circular Circles) */}
      {atoms.map((pos, i) => (
        <GlowingNode key={i} position={pos} />
      ))}

      {/* Structural Bonds - Enhanced visibility against the chalkboard background */}
      {bonds.map(([a, b], i) => (
        <Line 
          key={i} 
          points={[atoms[a], atoms[b]]} 
          color="#FFFFFF" 
          lineWidth={2} 
          transparent 
          opacity={0.5} 
        />
      ))}
    </group>
  );
}


export default function DiscoveryIntro({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(onComplete, 8500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!mounted) return <div className="fixed inset-0 bg-void" />;

  return (
    <div className="fixed inset-0 z-[100] bg-[#010409]">
      {/* Aesthetic Catalyst Blueprint Background - Enhanced Visibility */}
      <div 
        className="absolute inset-0 z-0 opacity-40 contrast-125 brightness-95"
        style={{ 
          backgroundImage: 'url("/catalyst_blueprint_bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />
      
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} className="relative z-10" alpha={true}>
        {/* Transparent background for Canvas so the image behind shows through */}
        <CatalystCage />

        <ambientLight intensity={0.5} />
      </Canvas>

      {/* Subtle vignette to ground the UI */}
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,#010409_100%)] pointer-events-none opacity-80" />

       <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center z-50 px-8 py-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex flex-col items-center gap-2">
               <div className="text-[10px] font-mono text-sky-400 uppercase tracking-[0.8em] font-black drop-shadow-md">Initializing Catalyst Engine</div>
               <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
            </div>
            
            <button
              onClick={onComplete}
              className="px-12 py-4 rounded-full border border-sky-400/30 bg-sky-400/5 text-sky-400 font-mono text-[10px] uppercase tracking-[0.5em] hover:bg-sky-400 hover:text-black transition-all pointer-events-auto shadow-[0_0_40px_rgba(14,165,233,0.1)] active:scale-95"
            >
              Initialize System
            </button>
          </motion.div>
       </div>
    </div>
  );
}
