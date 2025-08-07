import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function AtmosphericParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const rainRef = useRef<THREE.Points>(null);
  const neonParticlesRef = useRef<THREE.Points>(null);
  const particleCount = 2000;
  const rainCount = 1200;
  const neonCount = 500;
  
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 120;
      temp[i * 3 + 1] = Math.random() * 60;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    return temp;
  }, []);

  const rainParticles = useMemo(() => {
    const temp = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 150;
      temp[i * 3 + 1] = Math.random() * 100 + 20;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    return temp;
  }, []);

  const neonParticles = useMemo(() => {
    const temp = new Float32Array(neonCount * 3);
    for (let i = 0; i < neonCount; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 200;
      temp[i * 3 + 1] = Math.random() * 50 + 10;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.002;
        positions[i] += Math.cos(state.clock.elapsedTime + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.8;
        if (positions[i + 1] < -5) {
          positions[i + 1] = 100;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (neonParticlesRef.current) {
      neonParticlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      
      const positions = neonParticlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.elapsedTime * 3 + i) * 0.01;
        positions[i] += Math.cos(state.clock.elapsedTime * 0.5 + i) * 0.005;
        positions[i + 2] += Math.sin(state.clock.elapsedTime * 0.8 + i) * 0.005;
      }
      neonParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Partículas atmosféricas */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#4fc3f7"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* Chuva cyberpunk intensa */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={rainCount}
            array={rainParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#00ffff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Partículas néon cyberpunk */}
      <points ref={neonParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={neonCount}
            array={neonParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#ff00ff"
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
    </group>
  );
}