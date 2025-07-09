import React from 'react';

export function CityTerrain() {
  return (
    <group>
      {/* Chão principal da cidade com reflexos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#2a2a3a"
          roughness={0.3}
          metalness={0.7}
          envMapIntensity={0.5}
        />
      </mesh>
      
      {/* Ruas conectando distritos com reflexos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[80, 4]} />
        <meshStandardMaterial 
          color="#404040" 
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[80, 4]} />
        <meshStandardMaterial 
          color="#404040"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Linhas amarelas das ruas com brilho */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
        <planeGeometry args={[76, 0.2]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.85, 0]}>
        <planeGeometry args={[76, 0.2]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00" 
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Poças d'água para reflexos */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[
            (Math.random() - 0.5) * 60,
            -1.85,
            (Math.random() - 0.5) * 60
          ]}
        >
          <circleGeometry args={[2 + Math.random() * 3, 16]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0}
            metalness={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}