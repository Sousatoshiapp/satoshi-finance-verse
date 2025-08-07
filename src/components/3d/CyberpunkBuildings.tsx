import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { District3DPosition } from '@/types/city3d';
import { District } from '@/types/city3d';

interface CyberpunkBuildingsProps {
  districts: District[];
  districtPositions: Record<string, District3DPosition>;
}

export function CyberpunkBuildings({ districts, districtPositions }: CyberpunkBuildingsProps) {
  const buildingsGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (buildingsGroupRef.current) {
      // Subtle floating animation for all buildings
      buildingsGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const createBuildingsByTheme = (theme: string, position: District3DPosition, district: District) => {
    const baseHeight = 25 + Math.random() * 35;
    const buildingCount = 8 + Math.random() * 12;
    const buildings = [];

    for (let i = 0; i < buildingCount; i++) {
      const angle = (i / buildingCount) * Math.PI * 2;
      const radius = 15 + Math.random() * 25;
      const height = baseHeight + (Math.random() - 0.5) * 20;
      
      const x = position.x + Math.cos(angle) * radius;
      const z = position.z + Math.sin(angle) * radius;
      const y = height / 2;

      // Different building styles based on theme
      let buildingStyle;
      switch (theme) {
        case 'criptomoedas':
          buildingStyle = createCryptoBuilding(x, y, z, height, i, district);
          break;
        case 'sistema_bancario':
          buildingStyle = createBankingBuilding(x, y, z, height, i, district);
          break;
        case 'fintech':
          buildingStyle = createFintechBuilding(x, y, z, height, i, district);
          break;
        case 'renda_variavel':
          buildingStyle = createTradingBuilding(x, y, z, height, i, district);
          break;
        case 'educacao_financeira':
          buildingStyle = createEducationBuilding(x, y, z, height, i, district);
          break;
        default:
          buildingStyle = createDefaultBuilding(x, y, z, height, i, district);
          break;
      }
      
      buildings.push(buildingStyle);
    }
    
    return buildings;
  };

  const createCryptoBuilding = (x: number, y: number, z: number, height: number, index: number, district: District) => (
    <group key={`crypto-${index}`} position={[x, y, z]}>
      {/* Main building structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3 + Math.random() * 2, height, 3 + Math.random() * 2]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
          emissive="#00ffff"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Holographic display */}
      <mesh position={[0, height * 0.3, 2.5]}>
        <planeGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color="#00ffff"
          transparent
          opacity={0.7}
          emissive="#00ffff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Neon strips */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * (height / 4), 1.6]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial 
            color="#ff9800"
            emissive="#ff9800"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      {/* Floating data cubes */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 8,
            height + 5 + i * 2,
            (Math.random() - 0.5) * 8
          ]}
        >
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color="#9c27b0"
            transparent
            opacity={0.8}
            emissive="#9c27b0"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );

  const createBankingBuilding = (x: number, y: number, z: number, height: number, index: number, district: District) => (
    <group key={`banking-${index}`} position={[x, y, z]}>
      {/* Classical banking tower */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2, 4, height, 8]} />
        <meshStandardMaterial 
          color="#2c5282"
          metalness={0.6}
          roughness={0.3}
          emissive="#4a90e2"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Golden accents */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * (height / 5), 3]}>
          <boxGeometry args={[0.2, 2, 0.2]} />
          <meshStandardMaterial 
            color="#ffd700"
            metalness={0.9}
            roughness={0.1}
            emissive="#ffd700"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      
      {/* Bank logo projection */}
      <mesh position={[0, height * 0.8, 3.5]}>
        <circleGeometry args={[1.5]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.9}
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );

  const createFintechBuilding = (x: number, y: number, z: number, height: number, index: number, district: District) => (
    <group key={`fintech-${index}`} position={[x, y, z]}>
      {/* Modern glass tower */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, height, 4]} />
        <meshStandardMaterial 
          color="#0f172a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
          emissive="#7c3aed"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* LED grid pattern */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            -1.5 + (i % 4) * 1,
            -height/2 + Math.floor(i / 4) * (height / 5),
            2.1
          ]}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#00ff41"
            emissive="#00ff41"
            emissiveIntensity={Math.sin(Date.now() * 0.005 + i) > 0 ? 1 : 0.2}
          />
        </mesh>
      ))}
      
      {/* Floating tech spheres */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 10,
            height + 3 + i * 3,
            (Math.random() - 0.5) * 10
          ]}
        >
          <sphereGeometry args={[0.8]} />
          <meshStandardMaterial 
            color="#7c3aed"
            transparent
            opacity={0.6}
            emissive="#7c3aed"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );

  const createTradingBuilding = (x: number, y: number, z: number, height: number, index: number, district: District) => (
    <group key={`trading-${index}`} position={[x, y, z]}>
      {/* Trading tower with screens */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.5, height, 3.5]} />
        <meshStandardMaterial 
          color="#1a202c"
          metalness={0.7}
          roughness={0.3}
          emissive="#e53e3e"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Market screens */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            i === 0 ? 1.8 : i === 1 ? -1.8 : 0,
            height * 0.7,
            i === 2 ? 1.8 : i === 3 ? -1.8 : 0
          ]}
          rotation={[0, i * Math.PI / 2, 0]}
        >
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial 
            color="#0f0f23"
            emissive={Math.random() > 0.5 ? "#22c55e" : "#ef4444"}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
      
      {/* Stock ticker */}
      <mesh position={[0, height + 2, 0]}>
        <boxGeometry args={[6, 0.5, 0.2]} />
        <meshStandardMaterial 
          color="#000000"
          emissive="#ffff00"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );

  const createEducationBuilding = (x: number, y: number, z: number, height: number, index: number, district: District) => (
    <group key={`education-${index}`} position={[x, y, z]}>
      {/* Educational complex */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, height * 0.8, 6]} />
        <meshStandardMaterial 
          color="#2d3748"
          metalness={0.3}
          roughness={0.7}
          emissive="#4299e1"
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Knowledge orbs */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * Math.PI / 3) * 8,
            height + 2 + Math.sin(i) * 3,
            Math.sin(i * Math.PI / 3) * 8
          ]}
        >
          <sphereGeometry args={[1]} />
          <meshStandardMaterial 
            color="#4299e1"
            transparent
            opacity={0.7}
            emissive="#4299e1"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      
      {/* Book projections */}
      <mesh position={[0, height * 0.6, 3.5]}>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );

  const createDefaultBuilding = (x: number, y: number, z: number, height: number, index: number, district: District) => (
    <group key={`default-${index}`} position={[x, y, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial 
          color="#4a5568"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      
      {/* Simple neon accent */}
      <mesh position={[0, height * 0.5, 1.6]}>
        <boxGeometry args={[0.1, height * 0.8, 0.1]} />
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );

  return (
    <group ref={buildingsGroupRef}>
      {districts.map((district) => {
        const position = districtPositions[district.theme];
        if (!position) return null;
        
        return createBuildingsByTheme(district.theme, position, district);
      })}
      
      {/* Ground plane with grid */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
          color="#0a0a0a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Cyberpunk grid overlay */}
      {Array.from({ length: 50 }, (_, i) => (
        <mesh key={`grid-x-${i}`} position={[i * 20 - 500, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.1, 1000]} />
          <meshStandardMaterial 
            color="#00ffff"
            transparent
            opacity={0.1}
            emissive="#00ffff"
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}
      
      {Array.from({ length: 50 }, (_, i) => (
        <mesh key={`grid-z-${i}`} position={[0, 0.1, i * 20 - 500]}>
          <boxGeometry args={[1000, 0.1, 0.1]} />
          <meshStandardMaterial 
            color="#00ffff"
            transparent
            opacity={0.1}
            emissive="#00ffff"
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}