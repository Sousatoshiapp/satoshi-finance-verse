import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RealisticSkyscraperProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  districtTheme: string;
  windowLights?: boolean;
}

export function RealisticSkyscraper({
  position,
  height,
  width,
  depth,
  color,
  districtTheme,
  windowLights = true
}: RealisticSkyscraperProps) {
  const buildingRef = useRef<THREE.Group>(null);

  // Geometria base do prédio
  const buildingGeometry = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);
  
  // Material base com texturas realistas
  const buildingMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.7,
      envMapIntensity: 0.5
    });
  }, [color]);

  // Gerar janelas por andar
  const floors = Math.floor(height / 4);
  const windowsPerFloor = Math.max(2, Math.floor(width / 2));

  const windows = useMemo(() => {
    const windowElements = [];
    
    for (let floor = 0; floor < floors; floor++) {
      for (let window = 0; window < windowsPerFloor; window++) {
        // Janelas na frente
        windowElements.push({
          position: [
            -width/2 + (window + 0.5) * (width/windowsPerFloor),
            -height/2 + (floor + 0.5) * (height/floors),
            depth/2 + 0.1
          ],
          face: 'front'
        });
        
        // Janelas atrás
        windowElements.push({
          position: [
            -width/2 + (window + 0.5) * (width/windowsPerFloor),
            -height/2 + (floor + 0.5) * (height/floors),
            -depth/2 - 0.1
          ],
          face: 'back'
        });
      }
      
      // Janelas laterais
      for (let window = 0; window < Math.floor(depth / 2); window++) {
        // Lateral esquerda
        windowElements.push({
          position: [
            -width/2 - 0.1,
            -height/2 + (floor + 0.5) * (height/floors),
            -depth/2 + (window + 0.5) * (depth/Math.floor(depth / 2))
          ],
          face: 'left'
        });
        
        // Lateral direita
        windowElements.push({
          position: [
            width/2 + 0.1,
            -height/2 + (floor + 0.5) * (height/floors),
            -depth/2 + (window + 0.5) * (depth/Math.floor(depth / 2))
          ],
          face: 'right'
        });
      }
    }
    
    return windowElements;
  }, [width, height, depth, floors, windowsPerFloor]);

  // Material das janelas
  const windowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#87CEEB',
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
      emissive: windowLights ? '#4FC3F7' : '#000000',
      emissiveIntensity: windowLights ? 0.3 : 0
    });
  }, [windowLights]);

  // Antena no topo
  const antennaGeometry = useMemo(() => new THREE.CylinderGeometry(0.1, 0.1, height * 0.1), [height]);
  const antennaMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#DC143C',
    emissive: '#DC143C',
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2
  }), []);

  // Elementos específicos por tema do distrito
  const themeElements = useMemo(() => {
    switch (districtTheme) {
      case 'criptomoedas':
        return {
          topColor: '#00ffff',
          glowIntensity: 1.2,
          hasHologram: true
        };
      case 'sistema_bancario':
        return {
          topColor: '#DAA520',
          glowIntensity: 0.8,
          hasClassicalTop: true
        };
      case 'educacao_financeira':
        return {
          topColor: '#FFA500',
          glowIntensity: 0.6,
          hasLibraryTop: true
        };
      default:
        return {
          topColor: color,
          glowIntensity: 0.4,
          hasSimpleTop: true
        };
    }
  }, [districtTheme, color]);

  // Animação suave
  useFrame((state) => {
    if (buildingRef.current) {
      buildingRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.005;
    }
  });

  return (
    <group ref={buildingRef} position={position}>
      {/* Prédio principal */}
      <mesh geometry={buildingGeometry} material={buildingMaterial} castShadow receiveShadow>
        <meshStandardMaterial 
          attach="material" 
          color={color}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Janelas */}
      {windows.map((window, index) => (
        <mesh key={index} position={window.position as [number, number, number]}>
          <planeGeometry args={[1.2, 1.8]} />
          <primitive object={windowMaterial} />
        </mesh>
      ))}

      {/* Antena */}
      <mesh 
        position={[0, height/2 + height * 0.05, 0]} 
        geometry={antennaGeometry} 
        material={antennaMaterial} 
      />

      {/* Luz no topo da antena */}
      <mesh position={[0, height/2 + height * 0.1, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Elementos temáticos no topo */}
      {themeElements.hasHologram && (
        <mesh position={[0, height/2 + 2, 0]} rotation={[0, Date.now() * 0.001, 0]}>
          <torusGeometry args={[width * 0.6, 0.3, 8, 32]} />
          <meshStandardMaterial
            color={themeElements.topColor}
            emissive={themeElements.topColor}
            emissiveIntensity={themeElements.glowIntensity}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {themeElements.hasClassicalTop && (
        <mesh position={[0, height/2 + 1, 0]}>
          <sphereGeometry args={[width * 0.4, 16, 16]} />
          <meshStandardMaterial
            color={themeElements.topColor}
            metalness={0.8}
            roughness={0.2}
            emissive={themeElements.topColor}
            emissiveIntensity={themeElements.glowIntensity}
          />
        </mesh>
      )}

      {/* Luzes pontuais para iluminação */}
      <pointLight 
        position={[0, height/2, 0]} 
        intensity={themeElements.glowIntensity} 
        color={themeElements.topColor}
        distance={height}
        decay={2}
      />

      {/* Base do prédio */}
      <mesh position={[0, -height/2 - 0.5, 0]}>
        <cylinderGeometry args={[width * 0.8, width * 0.8, 1, 8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}