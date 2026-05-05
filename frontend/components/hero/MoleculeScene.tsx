/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

function Particles({ count = 60 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const targets = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr.push(new THREE.Vector3(x, y, z));
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const t = Math.min(1, (time - i * 0.02) / 2.5);
      const target = targets[i];
      const x = THREE.MathUtils.lerp(0, target.x, easeOutCubic(t));
      const y = THREE.MathUtils.lerp(0, target.y, easeOutCubic(t));
      const z = THREE.MathUtils.lerp(0, target.z, easeOutCubic(t));
      dummy.position.set(x, y, z);
      const scale = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(time * 2 + i));
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count] as any}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={'#10b981'} metalness={0.2} roughness={0.4} emissive={'#052e0f'} emissiveIntensity={0.6} />
    </instancedMesh>
  );
}

function computeNearestPairs(points: THREE.Vector3[], k = 3) {
  const pairs: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const dists: { idx: number; d: number }[] = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      dists.push({ idx: j, d: points[i].distanceTo(points[j]) });
    }
    dists.sort((a, b) => a.d - b.d);
    for (let n = 0; n < Math.min(k, dists.length); n++) {
      const a = i;
      const b = dists[n].idx;
      const pair: [number, number] = a < b ? ([a, b] as [number, number]) : ([b, a] as [number, number]);
      if (!pairs.some((p) => p[0] === pair[0] && p[1] === pair[1])) pairs.push(pair);
    }
  }
  return pairs;
}

function AnimatedBonds({ points }: { points: THREE.Vector3[] }) {
  const pairs = useMemo(() => computeNearestPairs(points, 3), [points]);
  const instRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!instRef.current) return;
    for (let i = 0; i < pairs.length; i++) {
      const [aIdx, bIdx] = pairs[i];
      const a = points[aIdx];
      const b = points[bIdx];
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      const diff = new THREE.Vector3().subVectors(b, a);
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, diff.clone().normalize());
      dummy.position.copy(mid);
      dummy.quaternion.copy(quat);
      dummy.scale.set(0.06, 0.001, 0.06);
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  }, [pairs, points, dummy]);

  useFrame((state) => {
    if (!instRef.current) return;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < pairs.length; i++) {
      const [aIdx, bIdx] = pairs[i];
      const a = points[aIdx];
      const b = points[bIdx];
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      const diff = new THREE.Vector3().subVectors(b, a);
      const len = diff.length();
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, diff.clone().normalize());
      const progress = Math.min(1, (t * 0.6 - i * 0.02));
      const ease = 1 - Math.pow(1 - progress, 3);
      const scaleY = THREE.MathUtils.lerp(0.001, len * 0.5, ease);
      dummy.position.copy(mid);
      dummy.quaternion.copy(quat);
      dummy.scale.set(0.06, scaleY, 0.06);
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instRef} args={[undefined as any, undefined as any, pairs.length] as any}>
      <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
      <meshStandardMaterial color={'#60a5fa'} metalness={0.1} roughness={0.8} transparent opacity={0.12} emissive={'#001429'} />
    </instancedMesh>
  );
}

function Scene() {
  const points = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < 60; i++) {
      const r = 5 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      arr.push(new THREE.Vector3(x, y, z));
    }
    return arr;
  }, []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      <Particles count={60} />
      <AnimatedBonds points={points} />
    </>
  );
}

export default function MoleculeScene() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
