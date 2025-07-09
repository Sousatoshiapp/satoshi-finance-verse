import React from 'react';
import * as THREE from 'three';
import { cityConfig } from '@/constants/city3d';

export function UrbanInfrastructure() {
  // Sistema de avenidas principais
  const mainAvenues = [
    { start: [-400, -1.9, 0], end: [400, -1.9, 0], width: 12 }, // Avenida horizontal
    { start: [0, -1.9, -400], end: [0, -1.9, 400], width: 12 }, // Avenida vertical
  ];

  // Ruas secundárias
  const secondaryStreets = [];
  for (let i = -300; i <= 300; i += 80) {
    if (Math.abs(i) > 20) { // Evitar sobreposição com avenidas principais
      secondaryStreets.push(
        { start: [i, -1.95, -400], end: [i, -1.95, 400], width: 6 }, // Verticais
        { start: [-400, -1.95, i], end: [400, -1.95, i], width: 6 }  // Horizontais
      );
    }
  }

  // Quarteirões residenciais/comerciais
  const cityBlocks = [];
  for (let x = -360; x <= 360; x += 80) {
    for (let z = -360; z <= 360; z += 80) {
      // Pular área central (onde ficam os distritos principais)
      if (Math.abs(x) < 80 && Math.abs(z) < 80) continue;
      
      cityBlocks.push({
        position: [x, 1, z],
        size: [60, 2 + Math.random() * 8, 60],
        type: Math.random() > 0.7 ? 'commercial' : 'residential'
      });
    }
  }

  // Postes de luz ao longo das avenidas
  const streetLights = [];
  for (let i = -400; i <= 400; i += 25) {
    streetLights.push(
      { position: [i, 8, 8], type: 'main' },
      { position: [i, 8, -8], type: 'main' },
      { position: [8, 8, i], type: 'main' },
      { position: [-8, 8, i], type: 'main' }
    );
  }

  // Carros em movimento (posicionamento estático para performance)
  const trafficCars = [];
  for (let i = 0; i < 50; i++) {
    const isMainRoad = Math.random() > 0.5;
    const x = isMainRoad ? 
      (Math.random() - 0.5) * 800 : 
      Math.floor((Math.random() - 0.5) * 10) * 80;
    const z = isMainRoad ? 
      (Math.random() > 0.5 ? 4 : -4) : 
      (Math.random() - 0.5) * 800;
    
    trafficCars.push({
      position: [x, 0.8, z],
      rotation: isMainRoad ? 0 : Math.PI / 2,
      color: ['#ff0000', '#0000ff', '#ffffff', '#000000', '#silver', '#800080'][Math.floor(Math.random() * 6)]
    });
  }

  // Vegetação urbana
  const urbanTrees = [];
  for (let i = 0; i < 100; i++) {
    const x = (Math.random() - 0.5) * 600;
    const z = (Math.random() - 0.5) * 600;
    
    // Evitar colocar árvores nas ruas
    const isOnStreet = (Math.abs(x) < 6 && Math.abs(z) < 400) || 
                      (Math.abs(z) < 6 && Math.abs(x) < 400) ||
                      (Math.abs(x % 80) < 6) || (Math.abs(z % 80) < 6);
    
    if (!isOnStreet) {
      urbanTrees.push({
        position: [x, 3, z],
        height: 4 + Math.random() * 3,
        radius: 1.5 + Math.random() * 1
      });
    }
  }

  return (
    <group>
      {/* Base da cidade expandida */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Avenidas principais */}
      {mainAvenues.map((avenue, index) => (
        <mesh 
          key={`main-${index}`}
          rotation={[-Math.PI / 2, 0, avenue.start[0] === avenue.end[0] ? Math.PI / 2 : 0]} 
          position={[
            (avenue.start[0] + avenue.end[0]) / 2,
            avenue.start[1],
            (avenue.start[2] + avenue.end[2]) / 2
          ]}
          receiveShadow
        >
          <planeGeometry args={[800, avenue.width]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Ruas secundárias */}
      {secondaryStreets.map((street, index) => (
        <mesh 
          key={`street-${index}`}
          rotation={[-Math.PI / 2, 0, street.start[0] === street.end[0] ? Math.PI / 2 : 0]} 
          position={[
            (street.start[0] + street.end[0]) / 2,
            street.start[1],
            (street.start[2] + street.end[2]) / 2
          ]}
        >
          <planeGeometry args={[800, street.width]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Quarteirões da cidade */}
      {cityBlocks.map((block, index) => (
        <group key={`block-${index}`}>
          <mesh position={block.position as [number, number, number]} castShadow>
            <boxGeometry args={block.size as [number, number, number]} />
            <meshStandardMaterial 
              color={block.type === 'commercial' ? '#4a4a5a' : '#3a3a4a'}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          
          {/* Janelas aleatórias nos quarteirões */}
          {Array.from({ length: 8 }, (_, i) => (
            <mesh 
              key={i}
              position={[
                block.position[0] + (Math.random() - 0.5) * 50,
                block.position[1] + block.size[1]/2 + 1,
                block.position[2] + (Math.random() - 0.5) * 50
              ]}
            >
              <planeGeometry args={[2, 2]} />
              <meshStandardMaterial 
                color="#ffeb3b"
                emissive="#ffeb3b"
                emissiveIntensity={Math.random() > 0.7 ? 0.5 : 0}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Postes de luz */}
      {streetLights.map((light, index) => (
        <group key={`light-${index}`}>
          <mesh position={light.position as [number, number, number]}>
            <cylinderGeometry args={[0.2, 0.2, 16]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
          </mesh>
          
          <mesh position={[light.position[0], light.position[1] + 3, light.position[2]]}>
            <sphereGeometry args={[0.8]} />
            <meshStandardMaterial 
              color="#ffeb3b"
              emissive="#ffeb3b"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
          
          <pointLight 
            position={light.position as [number, number, number]}
            intensity={2}
            color="#ffeb3b"
            distance={40}
            decay={2}
          />
        </group>
      ))}

      {/* Carros no trânsito */}
      {trafficCars.map((car, index) => (
        <group key={`car-${index}`} rotation={[0, car.rotation, 0]}>
          <mesh position={car.position as [number, number, number]} castShadow>
            <boxGeometry args={[4, 1.5, 2]} />
            <meshStandardMaterial 
              color={car.color}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Rodas */}
          {[[-1.5, -0.5, -0.8], [1.5, -0.5, -0.8], [-1.5, -0.5, 0.8], [1.5, -0.5, 0.8]].map((wheelPos, i) => (
            <mesh 
              key={i}
              position={[
                car.position[0] + wheelPos[0],
                car.position[1] + wheelPos[1],
                car.position[2] + wheelPos[2]
              ]}
            >
              <cylinderGeometry args={[0.4, 0.4, 0.3]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}
          
          {/* Faróis */}
          <mesh position={[car.position[0] + 2, car.position[1], car.position[2]]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Árvores urbanas */}
      {urbanTrees.map((tree, index) => (
        <group key={`tree-${index}`}>
          {/* Tronco */}
          <mesh position={tree.position as [number, number, number]}>
            <cylinderGeometry args={[0.3, 0.4, tree.height]} />
            <meshStandardMaterial 
              color="#8B4513"
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          
          {/* Copa */}
          <mesh position={[tree.position[0], tree.position[1] + tree.height/2, tree.position[2]]}>
            <sphereGeometry args={[tree.radius, 8, 8]} />
            <meshStandardMaterial 
              color="#228B22"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Calçadas ao longo das avenidas principais */}
      {[
        { position: [0, -1.88, 10], size: [800, 4] },
        { position: [0, -1.88, -10], size: [800, 4] },
        { position: [10, -1.88, 0], size: [4, 800] },
        { position: [-10, -1.88, 0], size: [4, 800] }
      ].map((sidewalk, index) => (
        <mesh 
          key={`sidewalk-${index}`}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={sidewalk.position as [number, number, number]}
        >
          <planeGeometry args={sidewalk.size as [number, number]} />
          <meshStandardMaterial 
            color="#5a5a5a"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Faixas de pedestres nos cruzamentos principais */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh 
          key={`crosswalk-${i}`}
          rotation={[-Math.PI / 2, 0, i % 2 === 0 ? 0 : Math.PI / 2]} 
          position={[
            i % 2 === 0 ? -60 + i * 6 : 0,
            -1.89,
            i % 2 === 0 ? 0 : -60 + i * 6
          ]}
        >
          <planeGeometry args={[2, 12]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}