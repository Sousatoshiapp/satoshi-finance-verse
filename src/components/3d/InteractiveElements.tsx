import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { District } from '@/types/city3d';
import { District3DPosition } from '@/types/city3d';
import { Text } from '@react-three/drei';

interface InteractiveElementsProps {
  districts: District[];
  districtPositions: Record<string, District3DPosition>;
  onDistrictClick: (district: District) => void;
  playerPosition: [number, number, number];
}

export function InteractiveElements({ 
  districts, 
  districtPositions, 
  onDistrictClick, 
  playerPosition 
}: InteractiveElementsProps) {
  const interactiveGroupRef = useRef<THREE.Group>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  
  useFrame((state) => {
    if (interactiveGroupRef.current) {
      // Floating animation for interactive elements
      interactiveGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  const getDistanceToPlayer = (position: District3DPosition) => {
    const [px, py, pz] = playerPosition;
    return Math.sqrt(
      Math.pow(position.x - px, 2) + 
      Math.pow(position.z - pz, 2)
    );
  };

  const createDistrictPortal = (district: District, position: District3DPosition) => {
    const distance = getDistanceToPlayer(position);
    const isNear = distance < 30;
    const isHovered = hoveredDistrict === district.id;
    
    return (
      <group key={district.id} position={[position.x, 5, position.z]}>
        {/* Main portal ring */}
        <mesh
          onClick={() => onDistrictClick(district)}
          onPointerEnter={() => setHoveredDistrict(district.id)}
          onPointerLeave={() => setHoveredDistrict(null)}
        >
          <torusGeometry args={[8, 1, 8, 32]} />
          <meshStandardMaterial 
            color={district.color_primary}
            transparent
            opacity={isNear ? 0.8 : 0.4}
            emissive={district.color_primary}
            emissiveIntensity={isHovered ? 0.8 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Inner energy field */}
        <mesh>
          <circleGeometry args={[7]} />
          <meshStandardMaterial 
            color={district.color_secondary || district.color_primary}
            transparent
            opacity={isNear ? 0.3 : 0.1}
            emissive={district.color_secondary || district.color_primary}
            emissiveIntensity={isHovered ? 0.5 : 0.2}
          />
        </mesh>
        
        {/* District name */}
        {isNear && (
          <Text
            position={[0, 12, 0]}
            fontSize={2}
            color={district.color_primary}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.1}
            outlineColor="#000000"
          >
            {district.name}
          </Text>
        )}
        
        {/* Power level indicator */}
        {isNear && (
          <group position={[0, -3, 0]}>
            <mesh>
              <boxGeometry args={[6, 0.5, 0.2]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh scale={[(district.power_level / 100) * 6, 1, 1]} position={[0, 0, 0.1]}>
              <boxGeometry args={[1, 0.4, 0.1]} />
              <meshStandardMaterial 
                color={district.color_primary}
                emissive={district.color_primary}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        )}
        
        {/* Floating district icon/symbol */}
        <group position={[0, 8, 0]}>
          <mesh>
            <sphereGeometry args={[2]} />
            <meshStandardMaterial 
              color={district.color_primary}
              transparent
              opacity={0.7}
              emissive={district.color_primary}
              emissiveIntensity={0.4}
            />
          </mesh>
          
          {/* Theme-specific symbol */}
          {district.theme === 'criptomoedas' && (
            <mesh position={[0, 0, 2.1]}>
              <boxGeometry args={[1, 1, 0.1]} />
              <meshStandardMaterial 
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.8}
              />
            </mesh>
          )}
          
          {district.theme === 'sistema_bancario' && (
            <mesh position={[0, 0, 2.1]}>
              <cylinderGeometry args={[0.8, 0.8, 0.1, 6]} />
              <meshStandardMaterial 
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.8}
              />
            </mesh>
          )}
        </group>
        
        {/* Interaction hint */}
        {isHovered && (
          <Text
            position={[0, -8, 0]}
            fontSize={1.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.1}
            outlineColor="#000000"
          >
            Clique para entrar
          </Text>
        )}
        
        {/* Pulse effect when hovered */}
        {isHovered && (
          <mesh>
            <torusGeometry args={[12, 0.5, 8, 32]} />
            <meshStandardMaterial 
              color={district.color_primary}
              transparent
              opacity={0.2}
              emissive={district.color_primary}
              emissiveIntensity={0.6}
            />
          </mesh>
        )}
      </group>
    );
  };

  const createHolographicNPCs = () => {
    const npcs = [];
    
    // Central information kiosk
    npcs.push(
      <group key="central-kiosk" position={[0, 3, 0]}>
        <mesh>
          <cylinderGeometry args={[2, 2, 6, 8]} />
          <meshStandardMaterial 
            color="#1a1a2e"
            metalness={0.8}
            roughness={0.2}
            emissive="#00ffff"
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Holographic display */}
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[1.5]} />
          <meshStandardMaterial 
            color="#00ffff"
            transparent
            opacity={0.5}
            emissive="#00ffff"
            emissiveIntensity={0.8}
          />
        </mesh>
        
        <Text
          position={[0, -1, 0]}
          fontSize={1}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
        >
          SATOSHI CITY
        </Text>
      </group>
    );
    
    // Floating guide avatars
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      npcs.push(
        <group 
          key={`guide-${i}`} 
          position={[
            Math.cos(angle) * 80,
            15 + Math.sin(Date.now() * 0.001 + i) * 3,
            Math.sin(angle) * 80
          ]}
        >
          <mesh>
            <sphereGeometry args={[1]} />
            <meshStandardMaterial 
              color="#7c3aed"
              transparent
              opacity={0.8}
              emissive="#7c3aed"
              emissiveIntensity={0.6}
            />
          </mesh>
          
          {/* Guide light beam */}
          <mesh position={[0, -10, 0]}>
            <cylinderGeometry args={[0.1, 2, 20]} />
            <meshStandardMaterial 
              color="#7c3aed"
              transparent
              opacity={0.3}
              emissive="#7c3aed"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      );
    }
    
    return npcs;
  };

  const createAmbientHolograms = () => {
    const holograms = [];
    
    // Financial data streams
    for (let i = 0; i < 20; i++) {
      holograms.push(
        <mesh 
          key={`data-${i}`}
          position={[
            (Math.random() - 0.5) * 300,
            10 + Math.random() * 30,
            (Math.random() - 0.5) * 300
          ]}
        >
          <planeGeometry args={[4, 2]} />
          <meshStandardMaterial 
            color="#00ff41"
            transparent
            opacity={0.4}
            emissive="#00ff41"
            emissiveIntensity={0.6}
          />
        </mesh>
      );
    }
    
    // Floating advertisement boards
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      holograms.push(
        <mesh 
          key={`ad-${i}`}
          position={[
            Math.cos(angle) * 150,
            25 + Math.sin(Date.now() * 0.001 + i) * 5,
            Math.sin(angle) * 150
          ]}
          rotation={[0, angle + Math.PI, 0]}
        >
          <planeGeometry args={[12, 8]} />
          <meshStandardMaterial 
            color="#ff3366"
            transparent
            opacity={0.7}
            emissive="#ff3366"
            emissiveIntensity={0.5}
          />
        </mesh>
      );
    }
    
    return holograms;
  };

  return (
    <group ref={interactiveGroupRef}>
      {/* District portals */}
      {districts.map((district) => {
        const position = districtPositions[district.theme];
        if (!position) return null;
        
        return createDistrictPortal(district, position);
      })}
      
      {/* NPCs and guides */}
      {createHolographicNPCs()}
      
      {/* Ambient holograms */}
      {createAmbientHolograms()}
      
      {/* Interactive waypoints */}
      <group>
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh 
              key={`waypoint-${i}`}
              position={[
                Math.cos(angle) * 100,
                2,
                Math.sin(angle) * 100
              ]}
            >
              <cylinderGeometry args={[1, 1, 4]} />
              <meshStandardMaterial 
                color="#00ffff"
                transparent
                opacity={0.6}
                emissive="#00ffff"
                emissiveIntensity={0.4}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}