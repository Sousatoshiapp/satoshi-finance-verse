import React from 'react';
import { Environment } from '@react-three/drei';
import { AtmosphericParticles } from './AtmosphericParticles';
import { RealisticSkybox } from './RealisticSkybox';

export function CityEnvironment() {
  return (
    <>
      <Environment preset="night" />
      
      {/* Skybox realista */}
      <RealisticSkybox />
      
      {/* Iluminação ambiente aprimorada */}
      <ambientLight intensity={0.4} color="#2c2c4a" />
      
      {/* Luz principal da lua */}
      <directionalLight
        position={[300, 150, 200]}
        intensity={1.2}
        color="#e6e6fa"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={1000}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      
      {/* Luz de preenchimento suave */}
      <hemisphereLight
        args={["#2c2c4a", "#1a1a2e", 0.3]}
      />
      
      {/* Partículas atmosféricas melhoradas */}
      <AtmosphericParticles />
    </>
  );
}