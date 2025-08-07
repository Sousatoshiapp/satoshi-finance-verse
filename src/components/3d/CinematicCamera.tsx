import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CinematicCameraProps {
  playerPosition: [number, number, number];
  followDistance: number;
  followHeight: number;
  lookAhead: number;
  smoothness: number;
}

export function CinematicCamera({ 
  playerPosition, 
  followDistance = 15, 
  followHeight = 8, 
  lookAhead = 10,
  smoothness = 0.05 
}: CinematicCameraProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  
  useFrame(() => {
    // Calculate desired camera position (behind and above player)
    const [px, py, pz] = playerPosition;
    
    // Camera offset behind player
    targetPosition.current.set(
      px - followDistance * Math.cos(Date.now() * 0.0005), // Slight circular motion
      py + followHeight,
      pz - followDistance * Math.sin(Date.now() * 0.0005)
    );
    
    // Look ahead of player
    targetLookAt.current.set(
      px + lookAhead * Math.cos(Date.now() * 0.001),
      py + 2,
      pz + lookAhead * Math.sin(Date.now() * 0.001)
    );
    
    // Smooth camera movement
    camera.position.lerp(targetPosition.current, smoothness);
    
    // Smooth look-at transition
    currentLookAt.current.lerp(targetLookAt.current, smoothness);
    camera.lookAt(currentLookAt.current);
    
    // Add subtle camera shake for immersion
    const shake = 0.1;
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
    camera.position.z += (Math.random() - 0.5) * shake;
  });

  return null;
}