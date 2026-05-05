'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import * as THREE from 'three';

function GlowingAtom({ position, size = 0.2, color = "#00FFC6" }: { position: [number, number, number], size?: number, color?: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh position={position} ref={mesh}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

function Molecule({ position, type, scale = 1, color = "#00FFC6" }: { position: [number, number, number], type: 'benzene' | 'water' | 'methane' | 'ring' | 'chain', scale?: number, color?: string }) {
  const group = useRef<THREE.Group>(null);
  
  const structure = useMemo(() => {
    const atoms: [number, number, number][] = [];
    const bonds: [number, number][] = [];

    if (type === 'benzene' || type === 'ring') {
      const sides = type === 'benzene' ? 6 : 8;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        atoms.push([Math.cos(a) * 2, Math.sin(a) * 2, 0]);
        bonds.push([i, (i + 1) % sides]);
      }
    } else if (type === 'water') {
      atoms.push([0, 0, 0], [1.2, 0.8, 0], [-1.2, 0.8, 0]);
      bonds.push([0, 1], [0, 2]);
    } else if (type === 'methane') {
      atoms.push([0, 0, 0], [1, 1, 1], [-1, -1, 1], [1, -1, -1], [-1, 1, -1]);
      bonds.push([0, 1], [0, 2], [0, 3], [0, 4]);
    } else if (type === 'chain') {
      for (let i = 0; i < 4; i++) {
        atoms.push([i * 1.5 - 2, Math.sin(i) * 0.5, 0]);
        if (i > 0) bonds.push([i - 1, i]);
      }
    }
    return { atoms, bonds };
  }, [type]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.1;
    group.current.rotation.z = t * 0.05;
    group.current.position.y = position[1] + Math.sin(t * 0.4 + position[0]) * 0.6;
  });

  return (
    <group position={position} scale={scale} ref={group}>
      {structure.atoms.map((pos, i) => (
        <GlowingAtom key={i} position={pos} size={i === 0 && type !== 'benzene' && type !== 'ring' ? 0.35 : 0.2} color={i === 0 && type !== 'benzene' && type !== 'ring' ? '#FFFFFF' : color} />
      ))}
      {structure.bonds.map(([a, b], i) => (
        <Line key={i} points={[structure.atoms[a], structure.atoms[b]]} color="#FFFFFF" lineWidth={1.5} transparent opacity={0.2} />
      ))}
    </group>
  );
}

export default function ChemBackground3D() {
  const moleculeTypes: ('benzene' | 'methane' | 'ring')[] = ['benzene', 'methane', 'ring', 'methane', 'methane']; // Weighted towards methane
  const colors = ["#00FFC6", "#3B82F6", "#8B5CF6"];

  const denseMolecules = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 90,
        (Math.random() - 0.5) * 70,
        -15 - Math.random() * 40
      ] as [number, number, number],
      type: moleculeTypes[Math.floor(Math.random() * moleculeTypes.length)],
      scale: 0.2 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, []);


  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
        <color attach="background" args={['#010409']} />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00FFC6" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#3B82F6" />
        
        <group>
          {/* Main Focused Molecules (Peripheral Clusters) */}
          <Molecule type="benzene" position={[-18, 10, -5]} scale={1} color="#00FFC6" />
          <Molecule type="methane" position={[-20, -10, -8]} scale={1.2} color="#8B5CF6" />
          <Molecule type="benzene" position={[18, -12, -6]} scale={1.1} color="#3B82F6" />
          <Molecule type="methane" position={[22, 12, -10]} scale={1.4} color="#00FFC6" />

          {/* High Density Molecular Field - Fills the screen */}
          {denseMolecules.map((m, i) => (
            <Molecule key={i} {...m} />
          ))}
        </group>
      </Canvas>
    </div>
  );
}
