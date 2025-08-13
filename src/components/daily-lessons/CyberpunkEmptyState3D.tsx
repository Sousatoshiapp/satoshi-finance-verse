import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 50;
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(clock.getElapsedTime() + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#00ffff" size={0.02} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function CyberBuilding({ position, height = 1, color = "#9c27b0" }: { position: [number, number, number], height?: number, color?: string }) {
  const buildingRef = useRef<THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial>>(null);
  
  useFrame(({ clock }) => {
    if (buildingRef.current && buildingRef.current.material) {
      buildingRef.current.material.emissive.setHex(
        Math.sin(clock.getElapsedTime() * 2) > 0.5 ? 0x330066 : 0x000000
      );
    }
  });

  return (
    <mesh ref={buildingRef} position={position}>
      <boxGeometry args={[0.3, height, 0.3]} />
      <meshPhongMaterial color={color} emissive="#330066" emissiveIntensity={0.2} />
    </mesh>
  );
}

function FinancialHologram() {
  const holoRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (holoRef.current) {
      holoRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      holoRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group ref={holoRef} position={[0, 0.5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 8]} />
        <meshPhongMaterial color="#00ffff" transparent opacity={0.3} emissive="#00ffff" emissiveIntensity={0.2} />
      </mesh>
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.3}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-black.woff"
      >
        💸
      </Text>
    </group>
  );
}

function CyberpunkScene() {
  return (
    <>
      <ambientLight intensity={0.3} color="#1a1a2e" />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#00ffff" />
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#ff9800" />
      
      {/* Mini cidade */}
      <CyberBuilding position={[-1.5, 0.5, -1]} height={1} color="#9c27b0" />
      <CyberBuilding position={[1.2, 0.8, -0.5]} height={1.6} color="#00ffff" />
      <CyberBuilding position={[-0.8, 0.3, 1]} height={0.6} color="#ff9800" />
      
      {/* Chão cyberpunk */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshPhongMaterial color="#0a0a1a" transparent opacity={0.8} />
      </mesh>
      
      {/* Grade cyberpunk */}
      <gridHelper args={[4, 20, "#00ffff", "#330066"]} position={[0, -0.48, 0]} />
      
      <FloatingParticles />
      <FinancialHologram />
    </>
  );
}

export function CyberpunkEmptyState3D() {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        performance={{ min: 0.5 }}
        dpr={[1, 1.5]}
      >
        <CyberpunkScene />
      </Canvas>
      
      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
    </div>
  );
}