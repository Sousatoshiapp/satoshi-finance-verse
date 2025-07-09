import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RealisticSkybox() {
  const skyboxRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (skyboxRef.current) {
      skyboxRef.current.rotation.y = state.clock.elapsedTime * 0.001;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.0005;
    }
  });

  return (
    <group>
      {/* Skybox principal - Gradiente realista de cidade noturna */}
      <mesh ref={skyboxRef} scale={[800, 800, 800]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial 
          color="#0a0a1f"
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Horizonte da cidade distante */}
      <mesh scale={[600, 80, 600]} position={[0, -10, 0]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshBasicMaterial 
          color="#1a1a2e"
          transparent
          opacity={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Nuvens volumétricas */}
      <group ref={cloudsRef}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos(i * Math.PI / 6) * 200,
              50 + Math.random() * 30,
              Math.sin(i * Math.PI / 6) * 200
            ]}
            scale={[
              20 + Math.random() * 40,
              5 + Math.random() * 10,
              20 + Math.random() * 40
            ]}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial 
              color="#2c2c4a"
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Estrelas distantes */}
      {Array.from({ length: 200 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 1000,
            Math.random() * 200 + 50,
            (Math.random() - 0.5) * 1000
          ]}
        >
          <sphereGeometry args={[0.5]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      {/* Lua realista */}
      <mesh position={[300, 150, 200]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshStandardMaterial 
          color="#e6e6fa"
          emissive="#e6e6fa"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Luzes de cidade distante no horizonte */}
      {Array.from({ length: 30 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            Math.cos(i * Math.PI / 15) * 400,
            -5 + Math.random() * 20,
            Math.sin(i * Math.PI / 15) * 400
          ]}
        >
          <sphereGeometry args={[1]} />
          <meshStandardMaterial 
            color={['#ffeb3b', '#ff9800', '#2196f3', '#9c27b0'][i % 4]}
            emissive={['#ffeb3b', '#ff9800', '#2196f3', '#9c27b0'][i % 4]}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
      
      {/* Aviões no céu com luzes piscantes */}
      {Array.from({ length: 2 }, (_, i) => (
        <group 
          key={i}
          position={[
            200 + i * 400,
            100 + i * 50,
            -300 + i * 200
          ]}
        >
          <mesh>
            <boxGeometry args={[8, 1, 2]} />
            <meshBasicMaterial color="#c0c0c0" />
          </mesh>
          
          {/* Luzes do avião */}
          <mesh position={[4, 0, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={Math.sin(Date.now() * 0.01) > 0 ? 1 : 0}
            />
          </mesh>
          
          <mesh position={[-4, 0, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={Math.sin(Date.now() * 0.01) > 0 ? 1 : 0}
            />
          </mesh>
        </group>
      ))}
      
      {/* Neblina atmosférica volumétrica */}
      <fog attach="fog" args={['#1a1a2e', 50, 300]} />
    </group>
  );
}