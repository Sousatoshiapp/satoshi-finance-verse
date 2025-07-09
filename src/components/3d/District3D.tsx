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
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.01 * (powerLevel / 100);
      groupRef.current.scale.setScalar(hovered ? 1.02 * scale : scale);
    }
  });

  const getDistrictArchitecture = () => {
    const theme = district.theme;
    
    switch (theme) {
      case 'criptomoedas':
        return (
          <group>
            {/* Torre principal - Arranha-céu futurista */}
            <mesh position={[0, 25, 0]} castShadow receiveShadow>
              <boxGeometry args={[8, 50, 8]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.9}
                roughness={0.1}
                envMapIntensity={1.5}
              />
            </mesh>
            
            {/* Detalhes arquitetônicos - Fachada */}
            {Array.from({ length: 12 }, (_, floor) => (
              <group key={floor}>
                {/* Janelas por andar */}
                {Array.from({ length: 4 }, (_, side) => (
                  <mesh key={side} 
                    position={[
                      side === 0 ? 2.1 : side === 1 ? -2.1 : 0,
                      floor * 2 + 2,
                      side === 2 ? 2.1 : side === 3 ? -2.1 : 0
                    ]}
                  >
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshStandardMaterial 
                      color="#87CEEB"
                      metalness={0.8}
                      roughness={0.1}
                      emissive="#4FC3F7"
                      emissiveIntensity={0.3}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                ))}
              </group>
            ))}
            
            {/* Antena no topo */}
            <mesh position={[0, 26, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 4]} />
              <meshStandardMaterial color="#FF6B35" emissive="#FF6B35" emissiveIntensity={0.8} />
            </mesh>
            
            {/* Hologramas cryptocurrency */}
            {[8, 16, 24].map((height, i) => (
              <mesh key={i} position={[0, height, 0]} rotation={[0, Date.now() * 0.001 * (i + 1) * 0.3, 0]}>
                <torusGeometry args={[5, 0.3, 8, 32]} />
                <meshStandardMaterial 
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={1.2}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            ))}
            
            {/* Torres auxiliares */}
            <mesh position={[-6, 8, 0]} castShadow>
              <boxGeometry args={[2.5, 16, 2.5]} />
              <meshStandardMaterial color={primaryColor} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[6, 6, 0]} castShadow>
              <boxGeometry args={[2.5, 12, 2.5]} />
              <meshStandardMaterial color={primaryColor} metalness={0.7} roughness={0.3} />
            </mesh>
            
            <pointLight position={[0, 20, 0]} intensity={2} color="#00ffff" distance={30} />
          </group>
        );
        
      case 'sistema_bancario':
        return (
          <group>
            {/* Complexo bancário - Torres principais */}
            <mesh position={[0, 20, 0]} castShadow receiveShadow>
              <boxGeometry args={[12, 40, 12]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.3}
                roughness={0.7}
                envMapIntensity={0.8}
              />
            </mesh>
            
            {/* Colunas clássicas */}
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} 
                position={[
                  Math.cos(i * Math.PI / 4) * 3.5,
                  8,
                  Math.sin(i * Math.PI / 4) * 3.5
                ]} 
                castShadow
              >
                <cylinderGeometry args={[0.3, 0.3, 16]} />
                <meshStandardMaterial 
                  color="#F5F5DC"
                  roughness={0.8}
                  metalness={0.1}
                />
              </mesh>
            ))}
            
            {/* Cúpula no topo */}
            <mesh position={[0, 21, 0]} castShadow>
              <sphereGeometry args={[3, 16, 16]} />
              <meshStandardMaterial 
                color="#DAA520"
                metalness={0.8}
                roughness={0.2}
                emissive="#DAA520"
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Janelas em grade */}
            {Array.from({ length: 48 }, (_, i) => {
              const floor = Math.floor(i / 16) + 1;
              const position = i % 16;
              const side = Math.floor(position / 4);
              const offset = position % 4;
              
              return (
                <mesh key={i} position={[
                  side === 0 ? 3.1 : side === 1 ? -3.1 : side === 2 ? -2 + offset : -2 + offset,
                  floor * 4 + 2,
                  side === 0 || side === 1 ? -2 + offset : side === 2 ? 3.1 : -3.1
                ]}>
                  <planeGeometry args={[0.8, 1.5]} />
                  <meshStandardMaterial 
                    color="#4169E1"
                    metalness={0.9}
                    roughness={0.1}
                    emissive="#FFD700"
                    emissiveIntensity={0.2}
                  />
                </mesh>
              );
            })}
            
            {/* Torres laterais */}
            <mesh position={[-8, 6, 0]} castShadow>
              <boxGeometry args={[3, 12, 3]} />
              <meshStandardMaterial color={primaryColor} metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[8, 6, 0]} castShadow>
              <boxGeometry args={[3, 12, 3]} />
              <meshStandardMaterial color={primaryColor} metalness={0.5} roughness={0.5} />
            </mesh>
            
            <pointLight position={[0, 25, 0]} intensity={1.5} color="#DAA520" distance={35} />
          </group>
        );
        
      case 'educacao_financeira':
        return (
          <group>
            {/* Campus universitário moderno */}
            <mesh position={[0, 8, 0]} castShadow receiveShadow>
              <boxGeometry args={[8, 16, 4]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.2}
                roughness={0.6}
              />
            </mesh>
            
            {/* Biblioteca central */}
            <mesh position={[0, 12, -6]} castShadow>
              <cylinderGeometry args={[4, 4, 24, 12]} />
              <meshStandardMaterial 
                color="#8B4513"
                metalness={0.1}
                roughness={0.9}
              />
            </mesh>
            
            {/* Janelas do campus */}
            {Array.from({ length: 32 }, (_, i) => (
              <mesh key={i} position={[
                -3.5 + (i % 8) * 1,
                2 + Math.floor(i / 8) * 3,
                2.1
              ]}>
                <planeGeometry args={[0.8, 2]} />
                <meshStandardMaterial 
                  color="#87CEEB"
                  metalness={0.7}
                  roughness={0.2}
                  emissive="#FFA500"
                  emissiveIntensity={0.3}
                />
              </mesh>
            ))}
            
            <pointLight position={[0, 18, 0]} intensity={1.2} color="#FFA500" distance={25} />
          </group>
        );
        
      default:
        return (
          <group>
            {/* Prédio corporativo genérico */}
            <mesh position={[0, 8, 0]} castShadow receiveShadow>
              <boxGeometry args={[5, 16, 5]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.6}
                roughness={0.4}
                envMapIntensity={1}
              />
            </mesh>
            
            {/* Fachada de vidro */}
            {Array.from({ length: 20 }, (_, i) => (
              <mesh key={i} position={[
                -2 + (i % 5) * 1,
                2 + Math.floor(i / 5) * 3,
                2.6
              ]}>
                <planeGeometry args={[0.8, 2.5]} />
                <meshStandardMaterial 
                  color="#B0C4DE"
                  metalness={0.8}
                  roughness={0.1}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            ))}
            
            {/* Antena */}
            <mesh position={[0, 17, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 2]} />
              <meshStandardMaterial color="#DC143C" emissive="#DC143C" emissiveIntensity={0.8} />
            </mesh>
            
            <pointLight position={[0, 16, 0]} intensity={1} color={primaryColor} distance={20} />
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