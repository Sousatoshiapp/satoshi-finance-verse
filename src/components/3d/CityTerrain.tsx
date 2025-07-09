import React from 'react';

export function CityTerrain() {
  return (
    <group>
      {/* Base da cidade - Concreto realista */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial 
          color="#3a3a3a"
          roughness={0.8}
          metalness={0.1}
          envMapIntensity={0.3}
        />
      </mesh>
      
      {/* Sistema de ruas principal - Asfalto realista */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]} receiveShadow>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial 
          color="#2c2c2c" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.95, 0]} receiveShadow>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Ruas secundárias */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-40 + i * 12, -1.93, 0]}>
          <planeGeometry args={[80, 4]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.93, -40 + i * 12]}>
          <planeGeometry args={[80, 4]} />
          <meshStandardMaterial 
            color="#2a2a2a"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Calçadas */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} 
          position={[
            i < 2 ? -4 : 4,
            -1.9,
            0
          ]}
        >
          <planeGeometry args={[100, 2]} />
          <meshStandardMaterial 
            color="#5a5a5a"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Faixas de pedestres */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-30 + i * 6, -1.92, 0]}>
          <planeGeometry args={[1, 6]} />
          <meshStandardMaterial 
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
      
      {/* Linhas amarelas das ruas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
        <planeGeometry args={[98, 0.3]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.9, 0]}>
        <planeGeometry args={[98, 0.3]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00" 
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Postes de luz urbanos */}
      {Array.from({ length: 16 }, (_, i) => (
        <group key={i}>
          <mesh position={[
            -45 + (i % 4) * 30,
            6,
            -45 + Math.floor(i / 4) * 30
          ]}>
            <cylinderGeometry args={[0.2, 0.2, 12]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.3} />
          </mesh>
          
          {/* Lâmpada do poste */}
          <mesh position={[
            -45 + (i % 4) * 30,
            11,
            -45 + Math.floor(i / 4) * 30
          ]}>
            <sphereGeometry args={[0.8]} />
            <meshStandardMaterial 
              color="#ffeb3b"
              emissive="#ffeb3b"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
          
          {/* Luz do poste */}
          <pointLight 
            position={[
              -45 + (i % 4) * 30,
              11,
              -45 + Math.floor(i / 4) * 30
            ]}
            intensity={1.5}
            color="#ffeb3b"
            distance={25}
            decay={2}
          />
        </group>
      ))}
      
      {/* Semáforos */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i}>
          <mesh position={[
            i === 0 || i === 3 ? -8 : 8,
            4,
            i < 2 ? -8 : 8
          ]}>
            <cylinderGeometry args={[0.1, 0.1, 8]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>
          
          <mesh position={[
            i === 0 || i === 3 ? -8 : 8,
            7,
            i < 2 ? -8 : 8
          ]}>
            <boxGeometry args={[0.8, 2, 0.4]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          
          {/* Luzes do semáforo */}
          {['red', 'yellow', 'green'].map((color, j) => (
            <mesh key={j} position={[
              i === 0 || i === 3 ? -8 : 8,
              7.5 - j * 0.5,
              i < 2 ? -8.3 : 7.7
            ]}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial 
                color={j === 2 ? '#00ff00' : color}
                emissive={j === 2 ? '#00ff00' : '#000000'}
                emissiveIntensity={j === 2 ? 0.8 : 0}
              />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Carros estacionados */}
      {Array.from({ length: 12 }, (_, i) => (
        <group key={i}>
          <mesh position={[
            -35 + (i % 6) * 14,
            0.5,
            i < 6 ? -10 : 10
          ]}>
            <boxGeometry args={[4, 1.5, 2]} />
            <meshStandardMaterial 
              color={['#ff0000', '#0000ff', '#ffffff', '#000000', '#silver', '#800080'][i % 6]}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Rodas */}
          {Array.from({ length: 4 }, (_, j) => (
            <mesh key={j} position={[
              -35 + (i % 6) * 14 + (j % 2 === 0 ? -1.5 : 1.5),
              0,
              i < 6 ? -10 : 10 + (j < 2 ? -0.8 : 0.8)
            ]}>
              <cylinderGeometry args={[0.4, 0.4, 0.3]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* Lixeiras urbanas */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[
          -40 + i * 12,
          1,
          i % 2 === 0 ? -6 : 6
        ]}>
          <cylinderGeometry args={[0.4, 0.4, 2]} />
          <meshStandardMaterial color="#2e7d32" metalness={0.1} roughness={0.9} />
        </mesh>
      ))}
      
      {/* Bueiros */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[
          -25 + i * 10,
          -1.88,
          0
        ]}>
          <circleGeometry args={[0.8, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.9}
            metalness={0.8}
          />
        </mesh>
      ))}
      
      {/* Poças d'água realistas */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[
            (Math.random() - 0.5) * 80,
            -1.88,
            (Math.random() - 0.5) * 80
          ]}
        >
          <circleGeometry args={[1 + Math.random() * 2, 16]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0}
            metalness={1}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}