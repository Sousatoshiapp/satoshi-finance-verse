import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { District } from '@/types/city3d';
import { District3DPosition } from '@/types/city3d';

interface DistrictEffectsProps {
  districts: District[];
  districtPositions: Record<string, District3DPosition>;
  activeCrisis?: boolean;
}

export function DistrictEffects({ districts, districtPositions, activeCrisis }: DistrictEffectsProps) {
  const effectsGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (effectsGroupRef.current) {
      // Rotate all effects slowly
      effectsGroupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  const createDistrictEffect = (district: District, position: District3DPosition) => {
    const effects = [];
    const baseKey = `effect-${district.id}`;
    
    // Power level visualization
    const powerLevel = district.power_level / 100;
    const effectColor = activeCrisis ? '#ef4444' : district.color_primary;
    
    // Energy pillar
    effects.push(
      <mesh key={`${baseKey}-pillar`} position={[position.x, 20 + powerLevel * 30, position.z]}>
        <cylinderGeometry args={[2, 4, 40 + powerLevel * 20, 8]} />
        <meshStandardMaterial 
          color={effectColor}
          transparent
          opacity={0.3}
          emissive={effectColor}
          emissiveIntensity={0.5 + powerLevel * 0.5}
        />
      </mesh>
    );
    
    // Floating energy orbs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 20 + powerLevel * 10;
      const height = 10 + Math.sin(Date.now() * 0.001 + i) * 5;
      
      effects.push(
        <mesh 
          key={`${baseKey}-orb-${i}`} 
          position={[
            position.x + Math.cos(angle + Date.now() * 0.001) * radius,
            height,
            position.z + Math.sin(angle + Date.now() * 0.001) * radius
          ]}
        >
          <sphereGeometry args={[0.5 + powerLevel]} />
          <meshStandardMaterial 
            color={effectColor}
            transparent
            opacity={0.7}
            emissive={effectColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      );
    }
    
    // Theme-specific effects
    switch (district.theme) {
      case 'criptomoedas':
        // Digital rain effect
        for (let i = 0; i < 20; i++) {
          effects.push(
            <mesh 
              key={`${baseKey}-rain-${i}`}
              position={[
                position.x + (Math.random() - 0.5) * 40,
                50 - (Date.now() * 0.01 + i * 5) % 60,
                position.z + (Math.random() - 0.5) * 40
              ]}
            >
              <boxGeometry args={[0.1, 2, 0.1]} />
              <meshStandardMaterial 
                color="#00ff41"
                emissive="#00ff41"
                emissiveIntensity={0.9}
              />
            </mesh>
          );
        }
        break;
        
      case 'sistema_bancario':
        // Golden particles
        for (let i = 0; i < 15; i++) {
          const particleAngle = (i / 15) * Math.PI * 2;
          const particleRadius = 15 + Math.sin(Date.now() * 0.002 + i) * 10;
          
          effects.push(
            <mesh 
              key={`${baseKey}-gold-${i}`}
              position={[
                position.x + Math.cos(particleAngle) * particleRadius,
                15 + Math.sin(Date.now() * 0.003 + i) * 8,
                position.z + Math.sin(particleAngle) * particleRadius
              ]}
            >
              <sphereGeometry args={[0.3]} />
              <meshStandardMaterial 
                color="#ffd700"
                metalness={0.9}
                roughness={0.1}
                emissive="#ffd700"
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        }
        break;
        
      case 'fintech':
        // Code streams
        for (let i = 0; i < 12; i++) {
          effects.push(
            <mesh 
              key={`${baseKey}-code-${i}`}
              position={[
                position.x + (Math.random() - 0.5) * 30,
                5 + i * 3,
                position.z + (Math.random() - 0.5) * 30
              ]}
            >
              <planeGeometry args={[8, 0.5]} />
              <meshStandardMaterial 
                color="#7c3aed"
                transparent
                opacity={0.8}
                emissive="#7c3aed"
                emissiveIntensity={0.6}
              />
            </mesh>
          );
        }
        break;
        
      case 'renda_variavel':
        // Stock chart projections
        for (let i = 0; i < 6; i++) {
          const chartAngle = (i / 6) * Math.PI * 2;
          effects.push(
            <mesh 
              key={`${baseKey}-chart-${i}`}
              position={[
                position.x + Math.cos(chartAngle) * 25,
                20 + Math.sin(Date.now() * 0.001 + i) * 5,
                position.z + Math.sin(chartAngle) * 25
              ]}
              rotation={[0, chartAngle, 0]}
            >
              <planeGeometry args={[6, 4]} />
              <meshStandardMaterial 
                color={Math.random() > 0.5 ? "#22c55e" : "#ef4444"}
                transparent
                opacity={0.7}
                emissive={Math.random() > 0.5 ? "#22c55e" : "#ef4444"}
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        }
        break;
        
      case 'educacao_financeira':
        // Knowledge symbols
        for (let i = 0; i < 10; i++) {
          const symbolAngle = (i / 10) * Math.PI * 2;
          effects.push(
            <mesh 
              key={`${baseKey}-symbol-${i}`}
              position={[
                position.x + Math.cos(symbolAngle + Date.now() * 0.0005) * 20,
                25 + Math.sin(Date.now() * 0.002 + i) * 8,
                position.z + Math.sin(symbolAngle + Date.now() * 0.0005) * 20
              ]}
            >
              <sphereGeometry args={[1]} />
              <meshStandardMaterial 
                color="#4299e1"
                transparent
                opacity={0.6}
                emissive="#4299e1"
                emissiveIntensity={0.7}
              />
            </mesh>
          );
        }
        break;
    }
    
    // Crisis override effects
    if (activeCrisis) {
      // Red warning pulses
      effects.push(
        <mesh key={`${baseKey}-crisis`} position={[position.x, 30, position.z]}>
          <cylinderGeometry args={[30, 30, 1, 32]} />
          <meshStandardMaterial 
            color="#ef4444"
            transparent
            opacity={0.1 + Math.sin(Date.now() * 0.01) * 0.1}
            emissive="#ef4444"
            emissiveIntensity={0.3 + Math.sin(Date.now() * 0.01) * 0.3}
          />
        </mesh>
      );
    }
    
    return effects;
  };

  return (
    <group ref={effectsGroupRef}>
      {districts.map((district) => {
        const position = districtPositions[district.theme];
        if (!position) return null;
        
        return (
          <group key={district.id}>
            {createDistrictEffect(district, position)}
          </group>
        );
      })}
      
      {/* Global atmospheric effects */}
      <group>
        {/* Energy streams connecting districts */}
        {districts.map((district, index) => {
          const nextDistrict = districts[(index + 1) % districts.length];
          const pos1 = districtPositions[district.theme];
          const pos2 = districtPositions[nextDistrict.theme];
          
          if (!pos1 || !pos2) return null;
          
          const midPoint = {
            x: (pos1.x + pos2.x) / 2,
            y: 15,
            z: (pos1.z + pos2.z) / 2
          };
          
          return (
            <mesh 
              key={`stream-${district.id}-${nextDistrict.id}`}
              position={[midPoint.x, midPoint.y, midPoint.z]}
            >
              <boxGeometry args={[
                Math.abs(pos2.x - pos1.x) * 0.1, 
                0.2, 
                Math.abs(pos2.z - pos1.z) * 0.1
              ]} />
              <meshStandardMaterial 
                color="#00ffff"
                transparent
                opacity={0.3}
                emissive="#00ffff"
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        })}
        
        {/* Ambient energy particles */}
        {Array.from({ length: 100 }, (_, i) => (
          <mesh 
            key={`ambient-${i}`}
            position={[
              (Math.random() - 0.5) * 200,
              Math.random() * 100 + 10,
              (Math.random() - 0.5) * 200
            ]}
          >
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={Math.sin(Date.now() * 0.01 + i) * 0.5 + 0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}