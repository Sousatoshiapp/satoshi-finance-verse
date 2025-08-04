import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Switch } from "@/components/shared/ui/switch";
import { Badge } from "@/components/shared/ui/badge";
import { MapPin, Users, Eye, EyeOff, Radar } from "lucide-react";
import { useProximityDetection } from '@/hooks/useProximityDetection';
import { ProximityDuelModal } from './ProximityDuelModal';
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

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
  const { t } = useI18n();

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
      console.log('🔧 Starting proximity detection from button...');
      await startProximityDetection();
      if (permissionStatus === 'denied') {
        toast({
          title: t("proximityDetection.permissionDeniedTitle"),
          description: t("proximityDetection.permissionDeniedDescription"),
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
      title: t("proximityDetection.challengeSentTitle"),
      description: t("proximityDetection.challengeSentDescription", { nickname: selectedPlayer?.nickname }),
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
      case 'granted': return t("proximityDetection.permissionGranted");
      case 'denied': return t("proximityDetection.permissionDenied");
      default: return t("proximityDetection.permissionPending");
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radar className="h-5 w-5 text-primary" />
            {t("proximityDetection.title")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPermissionStatusColor()}>
              <MapPin className="h-3 w-3 mr-1" />
              {t("proximityDetection.location")}: {getPermissionStatusText()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toggle Detecção */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{t("proximityDetection.activateDetection")}</span>
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
              <span className="font-medium">{t("proximityDetection.visibleToOthers")}</span>
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
                <span className="font-medium text-primary">{t("proximityDetection.detectionStatus")}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {nearbyPlayers.length > 0 
                  ? t("proximityDetection.playersFound", { count: nearbyPlayers.length })
                  : t("proximityDetection.searchingPlayers")
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
                      {t("proximityDetection.additionalPlayers", { count: nearbyPlayers.length - 3 })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Informações */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t("proximityDetection.infoDetectionRange")}</p>
            <p>{t("proximityDetection.infoUpdateFrequency")}</p>
            <p>{t("proximityDetection.infoNotificationLimit")}</p>
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
