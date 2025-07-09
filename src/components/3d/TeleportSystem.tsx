import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { District } from '@/types/city3d';
import { district3DPositions } from '@/constants/city3d';

interface TeleportSystemProps {
  districts: District[];
  onTeleport: (position: [number, number, number]) => void;
  currentPosition: [number, number, number];
}

export function TeleportSystem({ districts, onTeleport, currentPosition }: TeleportSystemProps) {
  const [showTeleportMenu, setShowTeleportMenu] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'T' || event.key === 't') {
        setShowTeleportMenu(!showTeleportMenu);
      }
      if (event.key === 'Escape') {
        setShowTeleportMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showTeleportMenu]);

  if (!showTeleportMenu) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
      <Card className="bg-slate-900/95 backdrop-blur-sm border-cyan-400 max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle className="text-cyan-400 text-center">Sistema de Teleporte</CardTitle>
          <CardDescription className="text-center text-slate-300">
            Selecione um distrito para se teleportar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {districts.map((district) => {
              const position = district3DPositions[district.theme as keyof typeof district3DPositions];
              if (!position) return null;
              
              const distance = Math.sqrt(
                Math.pow(currentPosition[0] - position.x, 2) + 
                Math.pow(currentPosition[2] - position.z, 2)
              );

              return (
                <Button
                  key={district.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 border-slate-600 hover:border-cyan-400"
                  onClick={() => {
                    onTeleport([position.x, 2, position.z + 30]);
                    setShowTeleportMenu(false);
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: district.color_primary }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-white">{district.name}</div>
                      <div className="text-xs text-slate-400">
                        Distância: {Math.round(distance)}m
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-600">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowTeleportMenu(false)}
            >
              Cancelar (ESC)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}