import React from 'react';
import { Card, CardContent } from '@/components/shared/ui/card';
import { District, UserDistrict } from '@/types/city3d';
import { district3DPositions } from '@/constants/city3d';

interface MinimapProps {
  districts: District[];
  playerPosition: [number, number, number];
  userDistricts: UserDistrict[];
}

export function Minimap({ districts, playerPosition, userDistricts }: MinimapProps) {
  return (
    <div className="absolute top-4 right-4 z-30">
      <Card className="bg-slate-900/95 backdrop-blur-sm border-cyan-400/50 w-48 h-48">
        <CardContent className="p-2 relative">
          <div className="text-xs text-cyan-400 mb-2 text-center font-medium">MAPA DA CIDADE</div>
          
          {/* Área do minimap */}
          <div className="relative w-full h-40 bg-slate-800 rounded border border-slate-600 overflow-hidden">
            {/* Grid de fundo */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={`v-${i}`} className="absolute bg-cyan-400 w-px h-full" style={{ left: `${i * 12.5}%` }} />
              ))}
              {Array.from({ length: 8 }, (_, i) => (
                <div key={`h-${i}`} className="absolute bg-cyan-400 h-px w-full" style={{ top: `${i * 12.5}%` }} />
              ))}
            </div>
            
            {/* Distritos no minimap */}
            {districts.map((district) => {
              const position = district3DPositions[district.theme as keyof typeof district3DPositions];
              const userInfo = userDistricts.find(ud => ud.district_id === district.id);
              
              if (!position) return null;
              
              const mapX = ((position.x + 500) / 1000) * 100;
              const mapY = ((position.z + 500) / 1000) * 100;
              
              return (
                <div
                  key={district.id}
                  className="absolute w-2 h-2 rounded-full border transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${mapX}%`,
                    top: `${mapY}%`,
                    backgroundColor: district.color_primary,
                    borderColor: userInfo?.is_residence ? '#FFD700' : 'transparent',
                    boxShadow: `0 0 6px ${district.color_primary}`,
                  }}
                  title={district.name}
                />
              );
            })}
            
            {/* Posição do jogador */}
            <div
              className="absolute w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{
                left: `${((playerPosition[0] + 500) / 1000) * 100}%`,
                top: `${((playerPosition[2] + 500) / 1000) * 100}%`,
                boxShadow: '0 0 4px #ffffff',
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
