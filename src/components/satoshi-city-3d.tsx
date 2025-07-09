import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder, Sphere, Environment, PerspectiveCamera } from '@react-three/drei';
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

// Posições 3D dos distritos
const district3DPositions = {
  renda_variavel: { x: -20, y: 0, z: -15 },
  educacao_financeira: { x: 20, y: 0, z: -10 },
  criptomoedas: { x: -30, y: 0, z: 20 },
  sistema_bancario: { x: 0, y: 0, z: 0 },
  fundos_imobiliarios: { x: 25, y: 0, z: 15 },
  mercado_internacional: { x: -10, y: 0, z: -30 },
  fintech: { x: 15, y: 0, z: 25 },
};

// Componente de distrito 3D
function District3D({ district, userInfo, position, onClick }: {
  district: District;
  userInfo?: UserDistrict;
  position: { x: number; y: number; z: number };
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const primaryColor = new THREE.Color(district.color_primary);
  const powerLevel = district.power_level || 100;
  const isResidence = userInfo?.is_residence || false;

  useFrame((state) => {
    if (meshRef.current) {
      // Animação de rotação suave
      meshRef.current.rotation.y += 0.005;
      
      // Animação de hover
      if (hovered) {
        meshRef.current.scale.setScalar(1.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
      
      // Animação de residência
      if (isResidence) {
        const time = state.clock.getElapsedTime();
        meshRef.current.position.y = position.y + Math.sin(time * 2) * 0.5;
      }
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Estrutura principal do distrito */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[3, 4, 8, 8]} />
        <meshStandardMaterial 
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={powerLevel > 70 ? 0.3 : 0.1}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Topo do distrito */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[2, 3, 1, 8]} />
        <meshStandardMaterial 
          color={district.color_secondary}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Corona de residência */}
      {isResidence && (
        <mesh position={[0, 6, 0]}>
          <torusGeometry args={[2.5, 0.3, 8, 16]} />
          <meshStandardMaterial 
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Texto do nome do distrito */}
      <Text
        position={[0, -6, 0]}
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
      >
        {district.name}
      </Text>

      {/* Aura de poder */}
      <Sphere args={[6]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color={primaryColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Partículas de energia */}
      {powerLevel > 80 && (
        <group>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[
              Math.sin(i * 2.51) * 5,
              Math.cos(i * 1.7) * 3 + 2,
              Math.cos(i * 2.51) * 5
            ]}>
              <sphereGeometry args={[0.2]} />
              <meshStandardMaterial 
                color={primaryColor}
                emissive={primaryColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// Componente da câmera controlável
function CameraControls() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 30, 40);
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
        <Canvas shadows>
          <Suspense fallback={null}>
            {/* Iluminação */}
            <Environment preset="night" />
            <ambientLight intensity={0.3} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[0, 20, 0]} intensity={0.5} color="#8B5CF6" />

            {/* Controles de câmera */}
            <CameraControls />

            {/* Chão da cidade */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial 
                color="#1e293b"
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            {/* Grid de referência */}
            <gridHelper args={[100, 20, "#475569", "#334155"]} position={[0, -0.9, 0]} />

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
              position={[0, 15, -20]}
              fontSize={4}
              color="#8B5CF6"
              anchorX="center"
              anchorY="middle"
              font="/fonts/orbitron-bold.woff"
            >
              SATOSHI CITY
            </Text>

            {/* Subtítulo */}
            <Text
              position={[0, 12, -20]}
              fontSize={1.5}
              color="#94A3B8"
              anchorX="center"
              anchorY="middle"
            >
              A Cidade do Futuro Financeiro
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