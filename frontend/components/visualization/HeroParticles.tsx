'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function ParticleField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const positions = useMemo(() => {
    // Generate hexagonal lattice of 200 positions in 3D sphere
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 200; i++) {
      const r = 5 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }
    return pts;
  }, []);

  const bonds = useMemo(() => {
    const points = positions.map((p) => p.clone());
    const segments: number[] = [];
    points.forEach((p, i) => {
      const distances = points
        .map((q, idx) => ({ idx, d: p.distanceTo(q) }))
        .filter((v) => v.idx !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      distances.forEach((n) => {
        const q = points[n.idx];
        segments.push(p.x, p.y, p.z, q.x, q.y, q.z);
      });
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
    return geometry;
  }, [positions]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.set(
        pos.x + Math.sin(t * 0.3 + i) * 0.1,
        pos.y + Math.cos(t * 0.2 + i) * 0.1,
        pos.z
      );
      dummy.scale.setScalar(0.6 + 0.4 * Math.sin(t + i * 0.5));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y = t * 0.05;
    if (linesRef.current) {
      linesRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, 200]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#052e0f"
          emissiveIntensity={1.2}
          metalness={0.3}
          roughness={0.4}
        />
      </instancedMesh>
      <lineSegments ref={linesRef} geometry={bonds}>
        <lineBasicMaterial color="#0EA5E9" transparent opacity={0.18} />
      </lineSegments>
    </group>
  );
}

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#0EA5E9" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10B981" />
        <ParticleField />
      </Canvas>
    </div>
  );
}
