'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Stars, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const THEME_COLOR = "#0EA5E9"; // Premium Electric Blue
const CORE_COLOR = "#FFFFFF";

function NodeRays({ position }: { position: [number, number, number] }) {
  const raysRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (raysRef.current) {
      raysRef.current.rotation.x += 0.01;
      raysRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position} ref={raysRef}>
      {[...Array(4)].map((_, i) => (
        <mesh key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <cylinderGeometry args={[0.01, 0.4, 2, 16, 1, true]} />
          <meshBasicMaterial 
            color={THEME_COLOR} 
            transparent 
            opacity={0.1} 
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
      {/* Physical Atom */}
      <mesh shadow={true}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive={THEME_COLOR}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Node Glow */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial 
          color={THEME_COLOR} 
          transparent 
          opacity={0.2} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* Rays coming out of the ball (atom) */}
      <NodeRays position={[0, 0, 0]} />
    </group>
  );
}

function CatalystCage() {
  const group = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.Mesh>(null);

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
    group.current.rotation.y = t * 0.15;
    group.current.rotation.z = t * 0.05;
    
    if (coreRef.current) {
        const s = 1 + Math.sin(t * 2) * 0.1;
        coreRef.current.scale.set(s, s, s);
    }
    if (coreGlowRef.current) {
        coreGlowRef.current.rotation.y = -t * 0.2;
    }
  });

  return (
    <group ref={group}>
      {/* Central Core Ball */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={CORE_COLOR} />
      </mesh>
      
      {/* Core Rays - Coming directly out of the central ball */}
      <group ref={coreGlowRef}>
        {[...Array(16)].map((_, i) => {
           const theta = Math.random() * Math.PI * 2;
           const phi = Math.random() * Math.PI;
           return (
             <mesh 
               key={i} 
               rotation={[phi, theta, 0]}
               position={[0, 0, 0]}
             >
                <cylinderGeometry args={[0.01, 0.2, 20, 16, 1, true]} />
                <meshBasicMaterial 
                  color={THEME_COLOR} 
                  transparent 
                  opacity={0.08} 
                  blending={THREE.AdditiveBlending} 
                />
             </mesh>
           );
        })}
      </group>

      {atoms.map((pos, i) => (
        <GlowingNode key={i} position={pos} />
      ))}

      {bonds.map(([a, b], i) => (
        <Line 
          key={i} 
          points={[atoms[a], atoms[b]]} 
          color={THEME_COLOR} 
          lineWidth={1.5} 
          transparent 
          opacity={0.4} 
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
    <div className="fixed inset-0 z-[100] bg-void">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <color attach="background" args={['#010409']} />
        
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <CatalystCage />
        </Float>

        <Stars radius={120} depth={50} count={6000} factor={4} saturation={0} fade speed={1.2} />
        <ambientLight intensity={0.5} />
      </Canvas>

      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-void pointer-events-none" />

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center z-50">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 3 }}
           className="flex flex-col items-center gap-6"
         >
           <div className="flex flex-col items-center gap-2">
              <div className="text-[10px] font-mono text-sky-400 uppercase tracking-[0.8em] animate-pulse">Initializing Catalyst Engine</div>
              <div className="h-[1px] w-56 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
           </div>
           
           <button
             onClick={onComplete}
             className="px-12 py-4 rounded-full border border-sky-400/20 bg-void/40 backdrop-blur-3xl text-sky-400 font-mono text-[10px] uppercase tracking-[0.5em] hover:bg-sky-400/10 hover:border-sky-400/50 transition-all pointer-events-auto shadow-[0_0_40px_rgba(14,165,233,0.1)] active:scale-95"
           >
             Initialize System
           </button>
         </motion.div>
      </div>
    </div>
  );
}
