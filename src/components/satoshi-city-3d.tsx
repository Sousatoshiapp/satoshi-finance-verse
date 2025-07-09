import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Eye, Crown, Map } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

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

// Posições 3D simplificadas dos distritos
const district3DPositions = {
  renda_variavel: { x: -15, y: 0, z: -10 },
  educacao_financeira: { x: 15, y: 0, z: -10 },
  criptomoedas: { x: -20, y: 0, z: 10 },
  sistema_bancario: { x: 0, y: 0, z: 0 },
  fundos_imobiliarios: { x: 20, y: 0, z: 10 },
  mercado_internacional: { x: -10, y: 0, z: -20 },
  fintech: { x: 10, y: 0, z: 20 },
};

// Componente de terreno urbano
function CityTerrain() {
  return (
    <group>
      {/* Chão principal da cidade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#2a2a3a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Ruas conectando distritos */}
      {/* Rua horizontal principal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
        <planeGeometry args={[80, 4]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      
      {/* Rua vertical principal */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.9, 0]}>
        <planeGeometry args={[80, 4]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      
      {/* Linhas amarelas das ruas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
        <planeGeometry args={[76, 0.2]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, -1.85, 0]}>
        <planeGeometry args={[76, 0.2]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
    </group>
  );
}

// Componente de skybox realista
function CityEnvironment() {
  return (
    <>
      <Environment preset="night" />
      {/* Skybox customizado com gradiente */}
      <mesh scale={[500, 500, 500]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#0a0a1f"
          side={THREE.BackSide}
        />
      </mesh>
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
      
      if (hovered) {
        groupRef.current.scale.setScalar(1.05);
      } else {
        groupRef.current.scale.setScalar(1);
      }
    }
  });

  // Função para criar arquitetura temática por distrito
  const getDistrictArchitecture = () => {
    const theme = district.theme;
    
    switch (theme) {
      case 'criptomoedas':
        return (
          <group>
            {/* Torre principal futurista */}
            <mesh position={[0, 6, 0]}>
              <cylinderGeometry args={[3, 2, 12, 8]} />
              <meshStandardMaterial 
                color={primaryColor}
                emissive={primaryColor}
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            
            {/* Anéis holográficos */}
            {[4, 8, 12].map((height, i) => (
              <mesh key={i} position={[0, height, 0]} rotation={[0, 0, 0]}>
                <torusGeometry args={[4, 0.2, 8, 32]} />
                <meshBasicMaterial 
                  color="#00ffff"
                  transparent
                  opacity={0.6}
                />
              </mesh>
            ))}
          </group>
        );
        
      case 'sistema_bancario':
        return (
          <group>
            {/* Arranha-céu principal */}
            <mesh position={[0, 8, 0]}>
              <boxGeometry args={[4, 16, 4]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            
            {/* Torres laterais */}
            <mesh position={[-3, 5, 0]}>
              <boxGeometry args={[2, 10, 2]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            
            <mesh position={[3, 5, 0]}>
              <boxGeometry args={[2, 10, 2]} />
              <meshStandardMaterial 
                color={primaryColor}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
        
      case 'fintech':
        return (
          <group>
            {/* Estrutura modular */}
            {[0, 2, 4].map((height, i) => (
              <mesh key={i} position={[0, height * 2 + 2, 0]} rotation={[0, i * 0.3, 0]}>
                <octahedronGeometry args={[2 + i * 0.5]} />
                <meshStandardMaterial 
                  color={primaryColor}
                  emissive={primaryColor}
                  emissiveIntensity={0.2}
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>
            ))}
          </group>
        );
        
      case 'fundos_imobiliarios':
        return (
          <group>
            {/* Torres residenciais */}
            <mesh position={[0, 7, 0]}>
              <boxGeometry args={[3, 14, 6]} />
              <meshStandardMaterial 
                color={primaryColor}
                roughness={0.5}
                metalness={0.3}
              />
            </mesh>
            
            {/* Detalhes arquitetônicos */}
            <mesh position={[0, 14.5, 0]}>
              <coneGeometry args={[2, 3, 8]} />
              <meshStandardMaterial 
                color="#8b4513"
                roughness={0.8}
              />
            </mesh>
          </group>
        );
        
      default:
        return (
          <group>
            {/* Estrutura padrão moderna */}
            <mesh position={[0, 5, 0]}>
              <boxGeometry args={[4, 10, 4]} />
              <meshStandardMaterial 
                color={primaryColor}
                emissive={primaryColor}
                emissiveIntensity={0.2}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
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

      {/* Corona de residência */}
      {isResidence && (
        <mesh position={[0, 15, 0]}>
          <torusGeometry args={[5, 0.5, 8, 32]} />
          <meshStandardMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Luzes do distrito */}
      <pointLight 
        position={[0, 10, 0]} 
        intensity={0.5} 
        color={primaryColor}
        distance={20}
      />

      {/* Base iluminada */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[6, 6, 0.5, 32]} />
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={0.3}
        />
      </mesh>

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

// Componente da câmera controlável
function CameraControls() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 20, 30);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return <OrbitControls enablePan enableZoom enableRotate />;
}

// Componente principal
export function SatoshiCity3D({ onBack }: { onBack: () => void }) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [userDistricts, setUserDistricts] = useState<UserDistrict[]>([]);
  const [loading, setLoading] = useState(true);
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
      {/* Header fixo */}
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
              </div>
              
              <div className="flex space-x-2">
                <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                  7 Distritos Ativos
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  Exploração 3D
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
            {/* Iluminação */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#8B5CF6" />

            {/* Controles de câmera */}
            <CameraControls />

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
              <div className="flex items-center space-x-2">
                <Map className="w-3 h-3" />
                <span>Arraste para rotacionar | Scroll para zoom</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span>Distrito com coroa = sua residência</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}