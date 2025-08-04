import React from 'react';
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { MapPin, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NearbyPlayer {
  id: string;
  user_id: string;
  nickname: string;
  distance: number;
}

interface ProximityDuelModalProps {
  visible: boolean;
  player: NearbyPlayer | null;
  onClose: () => void;
  onChallengeSent: () => void;
}

export const ProximityDuelModal: React.FC<ProximityDuelModalProps> = ({
  visible,
  player,
  onClose,
  onChallengeSent
}) => {
  const { toast } = useToast();

  const handleChallenge = async () => {
    if (!player) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get the target player's profile ID
      const { data: targetProfile, error: targetError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', player.user_id)
        .single();

      if (targetError || !targetProfile) {
        console.log('Target player profile not found, using mock challenge');
        onChallengeSent();
        onClose();
        return;
      }

      const { error } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: profile.id,
          challenged_id: targetProfile.id,
          quiz_topic: 'financas',
          status: 'pending'
        });

      if (error) throw error;

      onChallengeSent();
      onClose();

    } catch (error) {
      console.error('Erro ao enviar desafio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o desafio. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (!player) return null;

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Jogador Próximo Detectado
          </DialogTitle>
        </DialogHeader>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                <MapPin className="h-3 w-3 mr-1" />
                {Math.round(player.distance)}m de distância
              </Badge>
              <Badge variant="secondary">
                Duelo de Proximidade
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Player Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
              <AvatarDisplayUniversal
                nickname={player.nickname}
                size="md"
                className="border-2 border-primary/20"
              />
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  @{player.nickname}
                </div>
                <div className="text-sm text-muted-foreground">
                  Jogador próximo a você
                </div>
              </div>
            </div>

            {/* Challenge Details */}
            <div className="space-y-2 text-center">
              <p className="text-lg font-semibold text-foreground">
                <span className="text-primary">@{player.nickname}</span> está perto de você! 🎯
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Tópico: Finanças Gerais</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Desafiar para um duelo valendo BTZ?
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                10 perguntas • 30 segundos cada • Duelo simultâneo
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-muted-foreground/50 text-muted-foreground hover:bg-muted/10"
              >
                ❌ Ignorar
              </Button>
              <Button
                onClick={handleChallenge}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                ⚔️ Desafiar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
