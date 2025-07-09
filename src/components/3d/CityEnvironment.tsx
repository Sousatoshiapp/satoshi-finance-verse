import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { AtmosphericParticles } from './AtmosphericParticles';

export function CityEnvironment() {
  const skyboxRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (skyboxRef.current) {
      skyboxRef.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
  });

  return (
    <>
      <Environment preset="night" />
      
      {/* Skybox com gradiente cyberpunk */}
      <mesh ref={skyboxRef} scale={[500, 500, 500]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#0a0a1f"
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Neblina volumétrica */}
      <fog attach="fog" args={['#1a1a2e', 30, 200]} />
      
      {/* Iluminação ambiente melhorada */}
      <ambientLight intensity={0.3} color="#4a4a8a" />
      
      {/* Luz principal da lua */}
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        color="#b8c5ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Partículas atmosféricas */}
      <AtmosphericParticles />
    </>
  );
}