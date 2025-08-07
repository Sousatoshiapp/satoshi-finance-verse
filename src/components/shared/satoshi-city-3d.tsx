import React, { Suspense, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/shared/ui/card';
import { ArrowLeft, Eye, Crown, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// Importações dos componentes refatorados
import { PlayerAvatar } from '@/components/3d/PlayerAvatar';
import { District3D } from '@/components/3d/District3D';
import { CityTerrain } from '@/components/3d/CityTerrain';
import { CityEnvironment } from '@/components/3d/CityEnvironment';
import { UrbanElements } from '@/components/3d/UrbanElements';
import { Minimap } from '@/components/3d/Minimap';
import { TeleportSystem } from '@/components/3d/TeleportSystem';
import { GoogleMapsCamera } from '@/components/3d/navigation/GoogleMapsCamera';
import { UrbanInfrastructure } from '@/components/3d/city/UrbanInfrastructure';
import { RealisticSkyscraper } from '@/components/3d/buildings/RealisticSkyscraper';

// Importações dos hooks customizados
import { useMovementControls } from '@/hooks/useMovementControls';
import { useCityData } from '@/hooks/useCityData';

// Importações dos tipos e constantes
import { District, UserDistrict, ViewMode } from '@/types/city3d';
import { district3DPositions } from '@/constants/city3d';

// Extend three.js to include Line component
extend({ Line_: THREE.Line });

// Sistema de caminhos entre distritos simplificado
function DistrictPaths({ districts }: { districts: District[] }) {
  return (
    <group>
      {districts.map((district, index) => {
        const currentPos = district3DPositions[district.theme as keyof typeof district3DPositions];
        if (!currentPos) return null;
        
        return districts.slice(index + 1).map((otherDistrict, otherIndex) => {
          const otherPos = district3DPositions[otherDistrict.theme as keyof typeof district3DPositions];
          if (!otherPos) return null;
          
          const distance = Math.sqrt(
            Math.pow(currentPos.x - otherPos.x, 2) + 
            Math.pow(currentPos.z - otherPos.z, 2)
          );
          
          if (distance > 30) return null;
          
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

// Componente de câmera que segue o jogador
function FollowCamera({ playerPosition }: { playerPosition: [number, number, number] }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const cameraOffset = { x: 0, y: 25, z: 20 };
    camera.position.lerp(
      new THREE.Vector3(
        playerPosition[0] + cameraOffset.x,
        playerPosition[1] + cameraOffset.y,
        playerPosition[2] + cameraOffset.z
      ),
      0.08
    );
    
    camera.lookAt(playerPosition[0], playerPosition[1] + 2, playerPosition[2]);
  });
  
  return null;
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
            
            <pointLight
              position={[position.x, 15, position.z]}
              intensity={0.8}
              color={district.color_primary}
              distance={30}
              decay={2}
            />
            
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

// Componente de notificações de proximidade
function ProximityNotifications({ nearbyDistrict, districts }: { 
  nearbyDistrict: string | null; 
  districts: District[] 
}) {
  const [showNotification, setShowNotification] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<District | null>(null);

  useEffect(() => {
    if (nearbyDistrict) {
      const district = districts.find(d => d.theme === nearbyDistrict);
      if (district) {
        setCurrentDistrict(district);
        setShowNotification(true);
        const timer = setTimeout(() => setShowNotification(false), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowNotification(false);
    }
  }, [nearbyDistrict, districts]);

  if (!showNotification || !currentDistrict) return null;

  return (
    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30">
      <Card className="bg-slate-800/95 backdrop-blur-sm border-2 border-cyan-400 shadow-2xl animate-fade-in">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: currentDistrict.color_primary }}
              />
              <span className="text-white font-medium">{currentDistrict.name}</span>
            </div>
            <p className="text-xs text-cyan-400">Pressione ENTER para explorar</p>
          </div>
        </CardContent>
      </Card>
    </div>
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
      camera.position.set(0, 120, 200);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, followPlayer]);

  if (followPlayer && playerPosition) {
    return <FollowCamera playerPosition={playerPosition} />;
  }

  return <GoogleMapsCamera enableControls={!followPlayer} />;
}

// Componente principal
export function SatoshiCity3D({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const { playerPosition, playerRotation, nearbyDistrict, setPlayerPosition } = useMovementControls();
  const { districts, userDistricts, loading, getUserDistrictInfo } = useCityData();
  const [playerPositionState, setPlayerPositionState] = useState<[number, number, number]>([0, 0, 15]);
  const navigate = useNavigate();

  // Sincronizar posição do jogador para teleporte
  useEffect(() => {
    setPlayerPositionState(playerPosition);
  }, [playerPosition]);

  // Sistema de teleporte
  const handleTeleport = useCallback((newPosition: [number, number, number]) => {
    setPlayerPosition(newPosition);
  }, [setPlayerPosition]);

  // Sistema de interação por proximidade
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && nearbyDistrict && viewMode === 'exploration') {
        const district = districts.find(d => d.theme === nearbyDistrict);
        if (district) {
          navigate(`/satoshi-city/district/${district.id}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nearbyDistrict, districts, navigate, viewMode]);

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
                  Cidade Hiperrealista
                </Badge>
                <Badge variant="outline" className="border-purple-400 text-purple-400">
                  {viewMode === 'exploration' ? 'Modo Exploração' : 'Visão Panorâmica'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minimap no modo exploração */}
      {viewMode === 'exploration' && (
        <Minimap 
          districts={districts} 
          playerPosition={playerPosition} 
          userDistricts={userDistricts} 
        />
      )}

      {/* Sistema de teleporte */}
      {viewMode === 'exploration' && (
        <TeleportSystem 
          districts={districts} 
          onTeleport={handleTeleport} 
          currentPosition={playerPositionState} 
        />
      )}

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

            {/* Infraestrutura urbana expandida */}
            <UrbanInfrastructure />
            
            {/* Terreno urbano da cidade */}
            <CityTerrain />
            
            {/* Elementos urbanos realistas */}
            <UrbanElements />
            
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
              position={[0, 30, -50]}
              fontSize={8}
              color="#8B5CF6"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.5}
              outlineColor="black"
            >
              SATOSHI CITY 3D
            </Text>
            
            {/* Prédios adicionais para criar skyline realista */}
            {Array.from({ length: 15 }, (_, i) => {
              const angle = (i / 15) * Math.PI * 2;
              const radius = 80 + Math.random() * 40;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const height = 15 + Math.random() * 25;
              
              return (
                <RealisticSkyscraper
                  key={`skyline-${i}`}
                  position={[x, height/2, z]}
                  height={height}
                  width={4 + Math.random() * 3}
                  depth={4 + Math.random() * 3}
                  color={['#4a4a5a', '#3a3a4a', '#5a5a6a', '#2a2a3a'][i % 4]}
                  districtTheme="generic"
                  windowLights={Math.random() > 0.3}
                />
              );
            })}
          </Suspense>
        </Canvas>
      </div>

      {/* Sistema de notificações de proximidade */}
      {viewMode === 'exploration' && (
        <ProximityNotifications nearbyDistrict={nearbyDistrict} districts={districts} />
      )}

      {/* Instruções de controle */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700">
          <CardContent className="p-3">
            <div className="text-xs text-slate-300 space-y-1">
              {viewMode === 'overview' ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Map className="w-3 h-3" />
                    <span>Arraste para rotacionar | Scroll para zoom | Duplo clique para focar</span>
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
                    <span>WASD para navegar | ENTER para explorar distrito</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    <span>T = Teleporte | Minimap no canto superior direito</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HUD de status no modo exploração */}
      {viewMode === 'exploration' && (
        <div className="absolute bottom-4 right-4 z-20">
          <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700">
            <CardContent className="p-3">
              <div className="text-xs text-slate-300 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span>Avatar Online</span>
                </div>
                <div className="text-cyan-400">
                  Posição: ({Math.round(playerPosition[0])}, {Math.round(playerPosition[2])})
                </div>
                {nearbyDistrict && (
                  <div className="text-yellow-400 animate-pulse">
                    🏛️ Próximo ao distrito
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
