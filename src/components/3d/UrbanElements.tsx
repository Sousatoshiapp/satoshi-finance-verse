import React from 'react';

export function UrbanElements() {
  return (
    <group>
      {/* Árvores urbanas */}
      {Array.from({ length: 20 }, (_, i) => (
        <group key={i}>
          {/* Tronco */}
          <mesh position={[
            (Math.random() - 0.5) * 80,
            2,
            (Math.random() - 0.5) * 80
          ]}>
            <cylinderGeometry args={[0.3, 0.4, 4]} />
            <meshStandardMaterial 
              color="#8B4513"
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          
          {/* Copa da árvore */}
          <mesh position={[
            (Math.random() - 0.5) * 80,
            5,
            (Math.random() - 0.5) * 80
          ]}>
            <sphereGeometry args={[2 + Math.random(), 8, 8]} />
            <meshStandardMaterial 
              color="#228B22"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}
      
      {/* Placas de sinalização */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i}>
          {/* Poste da placa */}
          <mesh position={[
            -30 + i * 10,
            3,
            i % 2 === 0 ? -15 : 15
          ]}>
            <cylinderGeometry args={[0.08, 0.08, 6]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          
          {/* Placa */}
          <mesh position={[
            -30 + i * 10,
            5,
            i % 2 === 0 ? -15 : 15
          ]}>
            <boxGeometry args={[2, 1, 0.1]} />
            <meshStandardMaterial 
              color="#0066cc"
              emissive="#0066cc"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      ))}
      
      {/* Bancos de praça */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i}>
          <mesh position={[
            -25 + i * 10,
            0.5,
            i % 2 === 0 ? -20 : 20
          ]}>
            <boxGeometry args={[2, 0.4, 0.6]} />
            <meshStandardMaterial 
              color="#8B4513"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
          
          {/* Encosto do banco */}
          <mesh position={[
            -25 + i * 10,
            1.2,
            i % 2 === 0 ? -20.2 : 20.2
          ]}>
            <boxGeometry args={[2, 0.8, 0.1]} />
            <meshStandardMaterial 
              color="#8B4513"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}
      
      {/* Caixas de correio */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[
          -15 + i * 10,
          1.5,
          i % 2 === 0 ? -8 : 8
        ]}>
          <boxGeometry args={[0.8, 1, 0.6]} />
          <meshStandardMaterial 
            color="#1565C0"
            metalness={0.3}
            roughness={0.6}
          />
        </mesh>
      ))}
      
      {/* Hidrantes */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[
          -20 + i * 20,
          0.8,
          i % 2 === 0 ? -12 : 12
        ]}>
          <cylinderGeometry args={[0.3, 0.3, 1.6]} />
          <meshStandardMaterial 
            color="#DC143C"
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}
      
      {/* Paradas de ônibus */}
      {Array.from({ length: 2 }, (_, i) => (
        <group key={i}>
          {/* Estrutura da parada */}
          <mesh position={[
            i === 0 ? -30 : 30,
            3,
            0
          ]}>
            <boxGeometry args={[8, 6, 2]} />
            <meshStandardMaterial 
              color="#2c2c2c"
              transparent
              opacity={0.7}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          
          {/* Banco da parada */}
          <mesh position={[
            i === 0 ? -30 : 30,
            0.5,
            0
          ]}>
            <boxGeometry args={[6, 0.4, 0.8]} />
            <meshStandardMaterial 
              color="#4a4a4a"
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}
      
      {/* Antenas de telecomunicações */}
      {Array.from({ length: 3 }, (_, i) => (
        <group key={i}>
          <mesh position={[
            -40 + i * 40,
            15,
            -40 + i * 40
          ]}>
            <cylinderGeometry args={[0.1, 0.1, 30]} />
            <meshStandardMaterial 
              color="#DC143C"
              emissive="#DC143C"
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Luz de aviso da antena */}
          <mesh position={[
            -40 + i * 40,
            28,
            -40 + i * 40
          ]}>
            <sphereGeometry args={[0.3]} />
            <meshStandardMaterial 
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.8}
            />
          </mesh>
          
          <pointLight 
            position={[
              -40 + i * 40,
              28,
              -40 + i * 40
            ]}
            intensity={1}
            color="#ff0000"
            distance={20}
          />
        </group>
      ))}
      
      {/* Painéis publicitários luminosos */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i}>
          <mesh position={[
            -25 + i * 16,
            8,
            25
          ]}>
            <boxGeometry args={[8, 4, 0.2]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Conteúdo luminoso do painel */}
          <mesh position={[
            -25 + i * 16,
            8,
            25.1
          ]}>
            <boxGeometry args={[7.5, 3.5, 0.1]} />
            <meshStandardMaterial 
              color={['#00ffff', '#ff0080', '#ffff00', '#00ff00'][i]}
              emissive={['#00ffff', '#ff0080', '#ffff00', '#00ff00'][i]}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}