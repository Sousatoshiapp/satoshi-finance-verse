import React, { Suspense, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Eye, Crown, Map } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// Extend three.js to include Line component
extend({ Line_: THREE.Line });

interface District {
  id: string;
  name: string;
  description: string;
  theme: string;
  color_primary: string;
  color_secondary: string;
  level_required: number;
  is_active: boolean;
  power_level: number;
  battles_won: number;
  battles_lost: number;
  sponsor_company: string;
  sponsor_logo_url: string;
  referral_link: string;
  special_power: string;
}

interface UserDistrict {
  district_id: string;
  level: number;
  xp: number;
  is_residence: boolean;
  residence_started_at: string | null;
  daily_streak: number;
  last_activity_date: string;
}

// Avatar do jogador 3D
function PlayerAvatar({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const avatarRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (avatarRef.current) {
      // Animação suave de respiração
      avatarRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      avatarRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={avatarRef} position={position}>
      {/* Corpo do avatar */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
        <meshStandardMaterial color="#4a90e2" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Cabeça */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Capacete futurista */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.3}
          emissive="#00ffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Braços */}
      <mesh position={[-0.6, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      <mesh position={[0.6, 1.2, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      
      {/* Pernas */}
      <mesh position={[-0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2c5282" />
      </mesh>
      <mesh position={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
        <meshStandardMaterial color="#2c5282" />
      </mesh>
      
      {/* Efeito de energia ao redor */}
      <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#00ffff" distance={5} />
    </group>
  );
}

// Sistema de caminhos entre distritos simplificado
function DistrictPaths({ districts }: { districts: District[] }) {
  return (
    <group>
      {districts.map((district, index) => {
        const currentPos = district3DPositions[district.theme as keyof typeof district3DPositions];
        if (!currentPos) return null;
        
        // Conectar apenas com distritos próximos usando mesh tubes
        return districts.slice(index + 1).map((otherDistrict, otherIndex) => {
          const otherPos = district3DPositions[otherDistrict.theme as keyof typeof district3DPositions];
          if (!otherPos) return null;
          
          const distance = Math.sqrt(
            Math.pow(currentPos.x - otherPos.x, 2) + 
            Math.pow(currentPos.z - otherPos.z, 2)
          );
          
          // Só conectar distritos próximos
          if (distance > 30) return null;
          
          // Calcular posição e rotação do tubo
          const midX = (currentPos.x + otherPos.x) / 2;
          const midZ = (currentPos.z + otherPos.z) / 2;
          const angle = Math.atan2(otherPos.z - currentPos.z, otherPos.x - currentPos.x);
          
          return (
            <mesh 
              key={`${district.id}-${otherDistrict.id}`}
              position={[midX, -1.8, midZ]}
              rotation={[0, angle, 0]}
            >
              <cylinderGeometry args={[0.1, 0.1, distance, 8]} />
              <meshStandardMaterial 
                color="#00ffff" 
                transparent 
                opacity={0.6}
                emissive="#00ffff"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        });
      })}
    </group>
  );
}

// Hook para controles de movimento
function useMovementControls() {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false
  });
  
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 15]);
  const [playerRotation, setPlayerRotation] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in keys || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        setKeys(prev => ({ ...prev, [event.key]: true }));
        event.preventDefault();
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in keys || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        setKeys(prev => ({ ...prev, [event.key]: false }));
        event.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const speed = 0.3;
      let newX = playerPosition[0];
      let newZ = playerPosition[2];
      let newRotation = playerRotation;
      
      // Movimento frente/trás
      if (keys.w || keys.ArrowUp) {
        newX += Math.sin(playerRotation) * speed;
        newZ += Math.cos(playerRotation) * speed;
      }
      if (keys.s || keys.ArrowDown) {
        newX -= Math.sin(playerRotation) * speed;
        newZ -= Math.cos(playerRotation) * speed;
      }
      
      // Rotação esquerda/direita
      if (keys.a || keys.ArrowLeft) {
        newRotation -= 0.05;
      }
      if (keys.d || keys.ArrowRight) {
        newRotation += 0.05;
      }
      
      // Limitar movimento dentro da cidade
      newX = Math.max(-40, Math.min(40, newX));
      newZ = Math.max(-40, Math.min(40, newZ));
      
      setPlayerPosition([newX, 0, newZ]);
      setPlayerRotation(newRotation);
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [keys, playerPosition, playerRotation]);
  
  return { playerPosition, playerRotation };
}

// Componente de câmera que segue o jogador
function FollowCamera({ playerPosition }: { playerPosition: [number, number, number] }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Câmera em terceira pessoa
    const cameraOffset = { x: 0, y: 15, z: 10 };
    camera.position.lerp(
      new THREE.Vector3(
        playerPosition[0] + cameraOffset.x,
        playerPosition[1] + cameraOffset.y,
        playerPosition[2] + cameraOffset.z
      ),
      0.1
    );
    
    // Olhar para o jogador
    camera.lookAt(playerPosition[0], playerPosition[1] + 2, playerPosition[2]);
  });
  
  return null;
}
const district3DPositions = {
  renda_variavel: { x: -15, y: 0, z: -10 },
  educacao_financeira: { x: 15, y: 0, z: -10 },
  criptomoedas: { x: -20, y: 0, z: 10 },
  sistema_bancario: { x: 0, y: 0, z: 0 },
  fundos_imobiliarios: { x: 20, y: 0, z: 10 },
  mercado_internacional: { x: -10, y: 0, z: -20 },
  fintech: { x: 10, y: 0, z: 20 },
};

// Sistema de partículas atmosféricas
function AtmosphericParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 1000;
  
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 100;
      temp[i * 3 + 1] = Math.random() * 50;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Movimento vertical das partículas
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Sistema de iluminação dinâmica por distrito
function DistrictLighting({ districts }: { districts: District[] }) {
  return (
    <>
      {districts.map((district, index) => {
        const position = district3DPositions[district.theme as keyof typeof district3DPositions];
        if (!position) return null;
        
        return (
          <group key={district.id}>
            {/* Luz principal do distrito */}
            <spotLight
              position={[position.x, 25, position.z]}
              target-position={[position.x, 0, position.z]}
              angle={0.3}
              penumbra={0.5}
              intensity={1.5}
              color={district.color_primary}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            
            {/* Luz ambiente do distrito */}
            <pointLight
              position={[position.x, 15, position.z]}
              intensity={0.8}
              color={district.color_primary}
              distance={30}
              decay={2}
            />
            
            {/* Efeito de halo no chão */}
            <mesh position={[position.x, -1.8, position.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[8, 32]} />
              <meshBasicMaterial
                color={district.color_primary}
                transparent
                opacity={0.2}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

// Componente de terreno urbano com reflexos
function CityTerrain() {
  return (
    <group>
      {/* Chão principal da cidade com reflexos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#2a2a3a"
          roughness={0.3}
          metalness={0.7}
          envMapIntensity={0.5}
        />
      </mesh>
      
      {/* Ruas conectando distritos com reflexos */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[80, 4]} />
        <meshStandardMaterial 
          color="#404040" 
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.9, 0]} receiveShadow>
        <planeGeometry args={[80, 4]} />
        <meshStandardMaterial 
          color="#404040"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Linhas amarelas das ruas com brilho */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
        <planeGeometry args={[76, 0.2]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.85, 0]}>
        <planeGeometry args={[76, 0.2]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00" 
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Poças d'água para reflexos */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[
            (Math.random() - 0.5) * 60,
            -1.85,
            (Math.random() - 0.5) * 60
          ]}
        >
          <circleGeometry args={[2 + Math.random() * 3, 16]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0}
            metalness={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// Componente de skybox realista com gradiente dinâmico
function CityEnvironment() {
  const skyboxRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (skyboxRef.current) {
      // Rotação suave do skybox
      skyboxRef.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
  });

  return (
    <>
      <Environment preset="night" />
      
      {/* Skybox com gradiente cyberpunk */}
      <mesh ref={skyboxRef} scale={[500, 500, 500]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#0a0a1f"
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Neblina volumétrica */}
      <fog attach="fog" args={['#1a1a2e', 30, 200]} />
      
      {/* Iluminação ambiente melhorada */}
      <ambientLight intensity={0.3} color="#4a4a8a" />
      
      {/* Luz principal da lua */}
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        color="#b8c5ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Partículas atmosféricas */}
      <AtmosphericParticles />
    </>
  );
}

// Componente de distrito 3D com arquitetura realista
function District3D({ district, userInfo, position, onClick }: {
  district: District;
  userInfo?: UserDistrict;
  position: { x: number; y: number; z: number };
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const primaryColor = district.color_primary;
  const powerLevel = district.power_level || 100;
  const isResidence = userInfo?.is_residence || false;

  useFrame((state) => {
    if (groupRef.current) {
      // Suave balanceio dos edifícios
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      // Efeito de pulsação baseado no poder do distrito
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02 * (powerLevel / 100);
      groupRef.current.scale.setScalar(hovered ? 1.05 * scale : scale);
    }
  });

  // Função para criar arquitetura temática por distrito
  const getDistrictArchitecture = (state?: any) => {
    const theme = district.theme;
    
    switch (theme) {
      case 'criptomoedas':
        return (
          <group>
            {/* Torre principal futurista com sombras */}
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
            
            {/* Anéis holográficos animados */}
            {[4, 8, 12].map((height, i) => (
              <mesh key={i} position={[0, height, 0]} rotation={[0, (state?.clock?.elapsedTime || 0) * (i + 1) * 0.2, 0]}>
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
            
            {/* Efeitos de partículas crypto */}
            <pointLight position={[0, 12, 0]} intensity={1} color="#00ffff" distance={20} />
          </group>
        );
        
      case 'sistema_bancario':
        return (
          <group>
            {/* Arranha-céu principal com reflexos */}
            <mesh position={[0, 8, 0]} castShadow>
              <boxGeometry args={[4, 16, 4]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.9}
                roughness={0.1}
                envMapIntensity={1}
              />
            </mesh>
            
            {/* Torres laterais */}
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
            
            {/* Luzes das janelas */}
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
        
      case 'fintech':
        return (
          <group>
            {/* Estrutura modular com efeitos */}
            {[0, 2, 4].map((height, i) => (
              <mesh key={i} position={[0, height * 2 + 2, 0]} rotation={[0, i * 0.3, 0]} castShadow>
                <octahedronGeometry args={[2 + i * 0.5]} />
                <meshStandardMaterial 
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.3}
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
            ))}
            
            {/* Hologramas flutuantes */}
            {[2, 6, 10].map((height, i) => (
              <mesh key={i} position={[4, height, 0]} rotation={[0, (state?.clock?.elapsedTime || 0), 0]}>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial 
                  color="#00ff88"
                  transparent
                  opacity={0.6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
            
            <pointLight position={[0, 10, 0]} intensity={0.7} color="#00ff88" distance={20} />
          </group>
        );
        
      case 'fundos_imobiliarios':
        return (
          <group>
            {/* Torres residenciais */}
            <mesh position={[0, 7, 0]} castShadow>
              <boxGeometry args={[3, 14, 6]} />
              <meshStandardMaterial 
                color={primaryColor}
                roughness={0.5}
                metalness={0.3}
              />
            </mesh>
            
            {/* Detalhes arquitetônicos */}
            <mesh position={[0, 14.5, 0]} castShadow>
              <coneGeometry args={[2, 3, 8]} />
              <meshStandardMaterial 
                color="#8b4513"
                roughness={0.8}
              />
            </mesh>
            
            {/* Varandas iluminadas */}
            {Array.from({ length: 10 }, (_, i) => (
              <mesh key={i} position={[0, i * 1.4 + 1, 3.1]}>
                <boxGeometry args={[2.8, 0.2, 0.5]} />
                <meshStandardMaterial color="#666666" />
                <pointLight position={[0, 0, 0.3]} intensity={0.3} color="#ffaa00" distance={5} />
              </mesh>
            ))}
          </group>
        );
        
      default:
        return (
          <group>
            {/* Estrutura padrão moderna */}
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
            
            {/* Antenas e detalhes */}
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
      {/* Arquitetura temática */}
      {getDistrictArchitecture()}

      {/* Corona de residência com efeito pulsante */}
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
          {/* Partículas douradas */}
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

      {/* Sistema de iluminação dinâmica do distrito */}
      <pointLight 
        position={[0, 12, 0]} 
        intensity={hovered ? 1.2 : 0.8} 
        color={primaryColor}
        distance={25}
        decay={2}
      />

      {/* Base iluminada com pulsação */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[6, 6, 0.5, 32]} />
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={hovered ? 0.5 : 0.3}
        />
      </mesh>

      {/* Raios de energia saindo da base */}
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

      {/* Texto do nome do distrito */}
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

// Componente de câmera controlável com modo livre
function CameraControls({ followPlayer = false, playerPosition }: { 
  followPlayer?: boolean; 
  playerPosition?: [number, number, number] 
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (!followPlayer) {
      camera.position.set(0, 20, 30);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, followPlayer]);

  if (followPlayer && playerPosition) {
    return <FollowCamera playerPosition={playerPosition} />;
  }

  return <OrbitControls enablePan enableZoom enableRotate />;
}

// Componente principal
export function SatoshiCity3D({ onBack }: { onBack: () => void }) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [userDistricts, setUserDistricts] = useState<UserDistrict[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'exploration'>('overview');
  const { playerPosition, playerRotation } = useMovementControls();
  const navigate = useNavigate();

  useEffect(() => {
    loadDistricts();
    loadUserDistricts();
  }, []);

  const loadDistricts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  }, []);

  const loadUserDistricts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_districts')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;
      setUserDistricts(data || []);
    } catch (error) {
      console.error('Error loading user districts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserDistrictInfo = useCallback((districtId: string) => {
    return userDistricts.find(ud => ud.district_id === districtId);
  }, [userDistricts]);

  const handleDistrictClick = useCallback((districtId: string) => {
    navigate(`/satoshi-city/district/${districtId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando Satoshi City 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Header fixo com controles */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar 2D
                </Button>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-medium">Satoshi City 3D</span>
                </div>
                
                {/* Botões de modo */}
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'overview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('overview')}
                    className="text-xs"
                  >
                    Visão Geral
                  </Button>
                  <Button
                    variant={viewMode === 'exploration' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('exploration')}
                    className="text-xs"
                  >
                    Exploração
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                  7 Distritos Ativos
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  {viewMode === 'exploration' ? 'Modo Exploração' : 'Visão Panorâmica'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cena 3D */}
      <div className="w-full h-screen">
        <Canvas>
          <Suspense fallback={null}>
            {/* Sistema de iluminação dinâmica */}
            <DistrictLighting districts={districts} />
            
            {/* Iluminação ambiente melhorada */}
            <ambientLight intensity={0.2} color="#4a4a8a" />
            
            {/* Controles de câmera baseados no modo */}
            <CameraControls 
              followPlayer={viewMode === 'exploration'} 
              playerPosition={playerPosition} 
            />

            {/* Avatar do jogador (apenas no modo exploração) */}
            {viewMode === 'exploration' && (
              <PlayerAvatar position={playerPosition} rotation={playerRotation} />
            )}
            
            {/* Caminhos entre distritos */}
            <DistrictPaths districts={districts} />

            {/* Terreno urbano da cidade */}
            <CityTerrain />
            
            {/* Ambiente da cidade */}
            <CityEnvironment />

            {/* Distritos 3D */}
            {districts.map((district) => {
              const position = district3DPositions[district.theme as keyof typeof district3DPositions];
              const userInfo = getUserDistrictInfo(district.id);
              
              if (!position) return null;
              
              return (
                <District3D
                  key={district.id}
                  district={district}
                  userInfo={userInfo}
                  position={position}
                  onClick={() => handleDistrictClick(district.id)}
                />
              );
            })}

            {/* Título central da cidade */}
            <Text
              position={[0, 10, -15]}
              fontSize={3}
              color="#8B5CF6"
              anchorX="center"
              anchorY="middle"
            >
              SATOSHI CITY 3D
            </Text>
          </Suspense>
        </Canvas>
      </div>

      {/* Instruções de controle */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700">
          <CardContent className="p-3">
            <div className="text-xs text-slate-300 space-y-1">
              {viewMode === 'overview' ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Map className="w-3 h-3" />
                    <span>Arraste para rotacionar | Scroll para zoom</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span>Distrito com coroa = sua residência</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Map className="w-3 h-3" />
                    <span>WASD ou Setas para mover | Clique nos distritos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span>Avatar cyberpunk: W/S = frente/trás | A/D = girar</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}