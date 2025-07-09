import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerAvatarProps {
  position: [number, number, number];
  rotation: number;
}

export function PlayerAvatar({ position, rotation }: PlayerAvatarProps) {
  const avatarRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (avatarRef.current) {
      avatarRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      avatarRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={avatarRef} position={position}>
      {/* Corpo do avatar */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
        <meshStandardMaterial color="#4a90e2" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Cabeça */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Capacete futurista */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.3}
          emissive="#00ffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Braços */}
      <mesh position={[-0.6, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      <mesh position={[0.6, 1.2, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      
      {/* Pernas */}
      <mesh position={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2c5282" />
      </mesh>
      <mesh position={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2c5282" />
      </mesh>
      
      {/* Efeito de energia ao redor */}
      <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#00ffff" distance={5} />
    </group>
  );
}