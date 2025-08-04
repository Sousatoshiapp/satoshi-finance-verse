import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Switch } from "@/components/shared/ui/switch";
import { Badge } from "@/components/shared/ui/badge";
import { MapPin, Users, Eye, EyeOff, Radar } from "lucide-react";
import { useProximityDetection } from '@/hooks/useProximityDetection';
import { ProximityDuelModal } from './ProximityDuelModal';
import { useToast } from "@/hooks/use-toast";

export const ProximityDetection: React.FC = () => {
  const {
    isVisible,
    nearbyPlayers,
    isLocationEnabled,
    permissionStatus,
    startProximityDetection,
    stopProximityDetection,
    toggleVisibility,
    wasPlayerNotified,
    markPlayerAsNotified
  } = useProximityDetection();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkForNewPlayers = async () => {
      if (nearbyPlayers.length > 0) {
        for (const player of nearbyPlayers) {
          const alreadyNotified = await wasPlayerNotified(player.user_id);
          if (!alreadyNotified) {
            setSelectedPlayer(player);
            setModalVisible(true);
            await markPlayerAsNotified(player.user_id);
            break; // Mostrar apenas um modal por vez
          }
        }
      }
    };

    checkForNewPlayers();
  }, [nearbyPlayers, wasPlayerNotified, markPlayerAsNotified]);

  const handleToggleDetection = async () => {
    if (isLocationEnabled) {
      stopProximityDetection();
    } else {
      await startProximityDetection();
      if (permissionStatus === 'denied') {
        toast({
          title: "Permissão Negada",
          description: "Para usar a detecção de proximidade, permita o acesso à localização nas configurações do seu dispositivo.",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleVisibility = async (checked: boolean) => {
    await toggleVisibility(checked);
  };

  const handleChallengeSent = () => {
    toast({
      title: "Desafio Enviado! 🎯",
      description: `Seu desafio foi enviado para @${selectedPlayer?.nickname}. Aguarde a resposta!`,
    });
  };

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted': return 'bg-green-100 text-green-700 border-green-200';
      case 'denied': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted': return 'Permitida';
      case 'denied': return 'Negada';
      default: return 'Pendente';
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radar className="h-5 w-5 text-primary" />
            Detecção de Proximidade
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPermissionStatusColor()}>
              <MapPin className="h-3 w-3 mr-1" />
              Localização: {getPermissionStatusText()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toggle Detecção */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Ativar Detecção</span>
            </div>
            <Switch
              checked={isLocationEnabled}
              onCheckedChange={handleToggleDetection}
              disabled={permissionStatus === 'denied'}
            />
          </div>

          {/* Toggle Visibilidade */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {isVisible ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">Visível para Outros</span>
            </div>
            <Switch
              checked={isVisible}
              onCheckedChange={handleToggleVisibility}
            />
          </div>

          {/* Status */}
          {isLocationEnabled && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Status da Detecção</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {nearbyPlayers.length > 0 
                  ? `${nearbyPlayers.length} jogador(es) próximo(s) encontrado(s)`
                  : 'Procurando jogadores próximos...'
                }
              </div>
              {nearbyPlayers.length > 0 && (
                <div className="mt-2 space-y-1">
                  {nearbyPlayers.slice(0, 3).map((player) => (
                    <div key={player.id} className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>@{player.nickname}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(player.distance)}m
                      </Badge>
                    </div>
                  ))}
                  {nearbyPlayers.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{nearbyPlayers.length - 3} outros jogadores
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Informações */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Detecta jogadores em um raio de 500 metros</p>
            <p>• Atualização automática a cada 30 segundos</p>
            <p>• Notificações limitadas a uma por jogador a cada 2 horas</p>
          </div>
        </CardContent>
      </Card>

      <ProximityDuelModal
        visible={modalVisible}
        player={selectedPlayer}
        onClose={() => {
          setModalVisible(false);
          setSelectedPlayer(null);
        }}
        onChallengeSent={handleChallengeSent}
      />
    </>
  );
};
