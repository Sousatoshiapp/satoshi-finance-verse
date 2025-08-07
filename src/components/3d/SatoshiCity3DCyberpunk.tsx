import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Button } from '@/components/shared/ui/button';
import { ArrowLeft, Map, Settings } from 'lucide-react';
import { useCityData } from '@/hooks/useCityData';
import { useMovementControls } from '@/hooks/useMovementControls';
import { district3DPositions } from '@/constants/city3d';
import { District } from '@/types/city3d';

// Importar componentes 3D
import { PlayerAvatar } from './PlayerAvatar';
import { CinematicCamera } from './CinematicCamera';
import { CyberpunkBuildings } from './CyberpunkBuildings';
import { DistrictEffects } from './DistrictEffects';
import { InteractiveElements } from './InteractiveElements';
import { CityEnvironment } from './CityEnvironment';
import { AtmosphericParticles } from './AtmosphericParticles';
import { RealisticSkybox } from './RealisticSkybox';

interface SatoshiCity3DCyberpunkProps {
  onBack: () => void;
  onDistrictClick?: (district: District) => void;
}

export function SatoshiCity3DCyberpunk({ onBack, onDistrictClick }: SatoshiCity3DCyberpunkProps) {
  const { districts, loading } = useCityData();
  const [cameraMode, setCameraMode] = useState<'free' | 'follow'>('follow');
  const [qualityMode, setQualityMode] = useState<'high' | 'medium' | 'low'>('high');
  const [showStats, setShowStats] = useState(false);
  
  // Controles de movimento do jogador
  const { 
    playerPosition, 
    playerRotation
  } = useMovementControls();

  const handleDistrictClick = useCallback((district: District) => {
    if (onDistrictClick) {
      onDistrictClick(district);
    } else {
      // Navegação padrão
      window.location.href = `/district/${district.id}`;
    }
  }, [onDistrictClick]);

  const toggleCameraMode = () => {
    setCameraMode(mode => mode === 'free' ? 'follow' : 'free');
  };

  const cycleQuality = () => {
    setQualityMode(mode => {
      switch (mode) {
        case 'high': return 'medium';
        case 'medium': return 'low';
        case 'low': return 'high';
        default: return 'high';
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando Satoshi City 3D...</p>
          <p className="text-sm text-muted-foreground">Preparando experiência cyberpunk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* HUD Superior */}
      <div className="absolute top-4 left-4 z-50 flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-black/50 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Mapa 2D
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCameraMode}
          className="bg-black/50 border-purple-400 text-purple-400 hover:bg-purple-400/10"
        >
          <Map className="w-4 h-4 mr-2" />
          {cameraMode === 'free' ? 'Câmera Livre' : 'Seguir Jogador'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={cycleQuality}
          className="bg-black/50 border-orange-400 text-orange-400 hover:bg-orange-400/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Qualidade: {qualityMode.toUpperCase()}
        </Button>
      </div>

      {/* Instruções de Controle */}
      <div className="absolute bottom-4 left-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-cyan-400/30">
        <div className="text-cyan-400 text-sm space-y-1">
          <div className="font-semibold mb-2">Controles:</div>
          <div>WASD - Movimento</div>
          <div>Mouse - Olhar ao redor</div>
          <div>Clique - Interagir com distritos</div>
          <div>Scroll - Zoom (modo livre)</div>
        </div>
      </div>

      {/* Status do Jogador */}
      <div className="absolute bottom-4 right-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-purple-400/30">
        <div className="text-purple-400 text-sm space-y-1">
          <div className="font-semibold mb-2">Status:</div>
          <div>Posição: {Math.round(playerPosition[0])}, {Math.round(playerPosition[2])}</div>
          <div>Modo: Exploração 3D</div>
          <div>Câmera: {cameraMode === 'free' ? 'Livre' : 'Seguindo'}</div>
        </div>
      </div>

      {/* Minimapa */}
      <div className="absolute top-4 right-4 z-50 w-48 h-48 bg-black/70 backdrop-blur-sm rounded-lg border border-cyan-400/30 p-2">
        <div className="w-full h-full relative bg-gray-900 rounded">
          {/* Grid do minimapa */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`grid-h-${i}`} className="absolute w-full h-px bg-cyan-400" style={{ top: `${i * 25}%` }} />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <div key={`grid-v-${i}`} className="absolute h-full w-px bg-cyan-400" style={{ left: `${i * 25}%` }} />
            ))}
          </div>
          
          {/* Posição do jogador */}
          <div 
            className="absolute w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${50 + (playerPosition[0] / 200) * 100}%`, 
              top: `${50 + (playerPosition[2] / 200) * 100}%` 
            }}
          />
          
          {/* Distritos no minimapa */}
          {districts.map((district) => {
            const position = district3DPositions[district.theme as keyof typeof district3DPositions];
            if (!position) return null;
            
            return (
              <div
                key={district.id}
                className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2"
                style={{
                  left: `${50 + (position.x / 200) * 100}%`,
                  top: `${50 + (position.z / 200) * 100}%`,
                  backgroundColor: district.color_primary,
                  borderColor: district.color_secondary || district.color_primary
                }}
                title={district.name}
              />
            );
          })}
        </div>
        <div className="text-xs text-cyan-400 mt-1 text-center">Minimapa</div>
      </div>

      {/* Stats de Performance */}
      {showStats && (
        <div className="absolute top-20 right-4 z-50">
          <Stats />
        </div>
      )}

      {/* Canvas 3D Principal */}
      <Canvas
        camera={{ 
          position: [20, 15, 20], 
          fov: 75,
          near: 0.1,
          far: 2000
        }}
        shadows
        gl={{ 
          antialias: qualityMode === 'high',
          powerPreference: qualityMode === 'high' ? 'high-performance' : 'default'
        }}
        dpr={qualityMode === 'high' ? 2 : qualityMode === 'medium' ? 1.5 : 1}
      >
        {/* Controles de câmera */}
        {cameraMode === 'free' ? (
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={200}
          />
        ) : (
          <CinematicCamera
            playerPosition={playerPosition}
            followDistance={20}
            followHeight={12}
            lookAhead={15}
            smoothness={0.05}
          />
        )}

        {/* Iluminação e ambiente */}
        <CityEnvironment />
        
        {/* Skybox realista */}
        <RealisticSkybox />
        
        {/* Partículas atmosféricas cyberpunk */}
        <AtmosphericParticles />
        
        {/* Edifícios dos distritos */}
        <CyberpunkBuildings 
          districts={districts} 
          districtPositions={district3DPositions}
        />
        
        {/* Efeitos visuais dos distritos */}
        <DistrictEffects 
          districts={districts}
          districtPositions={district3DPositions}
          activeCrisis={false} // TODO: conectar com sistema de crise
        />
        
        {/* Elementos interativos */}
        <InteractiveElements
          districts={districts}
          districtPositions={district3DPositions}
          onDistrictClick={handleDistrictClick}
          playerPosition={playerPosition}
        />
        
        {/* Avatar do jogador */}
        <PlayerAvatar 
          position={playerPosition}
          rotation={playerRotation}
        />
        
        {/* Fog atmosférico */}
        <fog attach="fog" args={['#0a0a1f', 30, 300]} />
      </Canvas>

      {/* Overlay de Loading para qualidade alta */}
      {qualityMode === 'high' && (
        <div className="absolute bottom-4 center-4 z-40 text-cyan-400 text-xs opacity-70">
          Modo Alta Qualidade Ativo
        </div>
      )}
    </div>
  );
}