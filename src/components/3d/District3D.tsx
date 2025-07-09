import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { District, UserDistrict, District3DPosition } from '@/types/city3d';

interface District3DProps {
  district: District;
  userInfo?: UserDistrict;
  position: District3DPosition;
  onClick: () => void;
}

export function District3D({ district, userInfo, position, onClick }: District3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const primaryColor = district.color_primary;
  const powerLevel = district.power_level || 100;
  const isResidence = userInfo?.is_residence || false;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02 * (powerLevel / 100);
      groupRef.current.scale.setScalar(hovered ? 1.05 * scale : scale);
    }
  });

  const getDistrictArchitecture = () => {
    const theme = district.theme;
    
    switch (theme) {
      case 'criptomoedas':
        return (
          <group>
            <mesh position={[0, 6, 0]} castShadow>
              <cylinderGeometry args={[3, 2, 12, 8]} />
              <meshStandardMaterial 
                color={primaryColor}
                emissive={primaryColor}
                emissiveIntensity={0.4}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            
            {[4, 8, 12].map((height, i) => (
              <mesh key={i} position={[0, height, 0]} rotation={[0, Date.now() * 0.001 * (i + 1) * 0.2, 0]}>
                <torusGeometry args={[4, 0.2, 8, 32]} />
                <meshStandardMaterial 
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            ))}
            
            <pointLight position={[0, 12, 0]} intensity={1} color="#00ffff" distance={20} />
          </group>
        );
        
      case 'sistema_bancario':
        return (
          <group>
            <mesh position={[0, 8, 0]} castShadow>
              <boxGeometry args={[4, 16, 4]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.9}
                roughness={0.1}
                envMapIntensity={1}
              />
            </mesh>
            
            <mesh position={[-3, 5, 0]} castShadow>
              <boxGeometry args={[2, 10, 2]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            
            <mesh position={[3, 5, 0]} castShadow>
              <boxGeometry args={[2, 10, 2]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            
            {Array.from({ length: 20 }, (_, i) => (
              <mesh key={i} position={[
                (Math.random() - 0.5) * 3,
                Math.random() * 14 + 1,
                2.1
              ]}>
                <planeGeometry args={[0.3, 0.3]} />
                <meshStandardMaterial 
                  color="#ffff88"
                  emissive="#ffff88"
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
            
            <pointLight position={[0, 16, 0]} intensity={0.8} color={primaryColor} distance={25} />
          </group>
        );
        
      default:
        return (
          <group>
            <mesh position={[0, 5, 0]} castShadow>
              <boxGeometry args={[4, 10, 4]} />
              <meshStandardMaterial 
                color={primaryColor}
                emissive={primaryColor}
                emissiveIntensity={0.2}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            
            <mesh position={[0, 10.5, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 2]} />
              <meshStandardMaterial color="#888888" metalness={0.8} />
            </mesh>
            
            <pointLight position={[0, 10, 0]} intensity={0.5} color={primaryColor} distance={15} />
          </group>
        );
    }
  };

  return (
    <group 
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getDistrictArchitecture()}

      {isResidence && (
        <group>
          <mesh position={[0, 15, 0]}>
            <torusGeometry args={[5, 0.5, 8, 32]} />
            <meshStandardMaterial 
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.8}
            />
          </mesh>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI / 6) * 6,
              15 + Math.sin((Date.now() * 0.001) * 2 + i) * 0.5,
              Math.sin(i * Math.PI / 6) * 6
            ]}>
              <sphereGeometry args={[0.1]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          ))}
        </group>
      )}

      <pointLight 
        position={[0, 12, 0]} 
        intensity={hovered ? 1.2 : 0.8} 
        color={primaryColor}
        distance={25}
        decay={2}
      />

      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[6, 6, 0.5, 32]} />
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={hovered ? 0.5 : 0.3}
        />
      </mesh>

      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0, -1.2, 0]} rotation={[0, i * Math.PI / 4, 0]}>
          <planeGeometry args={[0.1, 8]} />
          <meshBasicMaterial 
            color={primaryColor}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <Text
        position={[0, -6, 0]}
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
        outlineWidth={0.1}
        outlineColor="black"
      >
        {district.name}
      </Text>
    </group>
  );
}