import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { Swords, Clock, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGlobalDuelInvites } from "@/contexts/GlobalDuelInviteContext";
import { useNavigate } from "react-router-dom";

interface DuelInvite {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_topic: string;
  bet_amount?: number;
  status: string;
  created_at: string;
  challenger?: {
    id: string;
    nickname: string;
    level: number;
    xp: number;
    avatars?: {
      name: string;
      image_url: string;
    };
  };
}

interface DuelInviteModalProps {
  invite: DuelInvite | null;
  open: boolean;
  onClose: () => void;
  onResponse: (accepted: boolean) => void;
}

const topicsMap: Record<string, string> = {
  "financas": "Finanças Gerais",
  "investimentos": "Investimentos", 
  "criptomoedas": "Criptomoedas",
  "economia": "Economia"
};

export function DuelInviteModal({ invite, open, onClose, onResponse }: DuelInviteModalProps) {
  const [isResponding, setIsResponding] = useState(false);
  const { toast } = useToast();
  const { dismissCurrentInvite } = useGlobalDuelInvites();
  const navigate = useNavigate();

  if (!invite || !invite.challenger) return null;

  const handleResponse = async (accepted: boolean) => {
    setIsResponding(true);
    
    try {
      if (accepted) {
        console.log('🎯 Iniciando processo de aceitação do duelo para:', invite.quiz_topic);
        console.log('📋 Dados do convite:', {
          id: invite.id,
          challenger_id: invite.challenger_id,
          challenged_id: invite.challenged_id,
          quiz_topic: invite.quiz_topic,
          bet_amount: invite.bet_amount,
          challenger_nickname: invite.challenger?.nickname
        });

        dismissCurrentInvite();

        console.log('🚀 Chamando nova RPC create_duel_with_invite...');
        const rpcResult = await supabase.rpc('create_duel_with_invite', {
          p_invite_id: invite.id,
          p_challenger_id: invite.challenged_id
        });

        console.log('📊 Resultado da RPC:', rpcResult);

        if (rpcResult.error) {
          console.error('❌ Erro na RPC:', rpcResult.error);
          throw new Error(`Erro ao criar duelo: ${rpcResult.error.message}`);
        }

        // Parse result - the RPC returns a jsonb object
        const resultData = rpcResult.data;
        
        console.log('🔍 Tipo do resultado da RPC:', typeof resultData);
        console.log('🔍 Valor do resultado completo:', resultData);
        
        let duelId: string;
        
        if (typeof resultData === 'string') {
          // Direct UUID string
          duelId = resultData;
        } else if (resultData && typeof resultData === 'object' && (resultData as any).duel_id) {
          // JSONB object with duel_id
          duelId = (resultData as any).duel_id;
          console.log('📋 Dados adicionais do duelo:', {
            topic: (resultData as any).topic,
            bet_amount: (resultData as any).bet_amount,
            success: (resultData as any).success
          });
        } else {
          console.error('❌ RPC não retornou um resultado válido:', resultData);
          throw new Error('Erro ao criar duelo: Formato de resposta inválido');
        }
        
        if (!duelId) {
          console.error('❌ ID do duelo não foi extraído:', resultData);
          throw new Error('Erro ao criar duelo: ID não encontrado na resposta');
        }

        console.log('✅ Duelo criado com ID:', duelId);
        
        if (!duelId) {
          throw new Error('ID do duelo não encontrado');
        }

        console.log('📧 Enviando notificação de aceitação...');
        try {
          await supabase.functions.invoke('send-social-notification', {
            body: {
              userId: invite.challenger_id,
              type: 'duel_accepted',
              title: 'Convite Aceito!',
              message: `Seu convite de duelo foi aceito! O duelo começou.`,
              data: { invite_id: invite.id }
            }
          });
          console.log('✅ Notificação enviada com sucesso');
        } catch (notificationError) {
          console.error('❌ Erro ao enviar notificação:', notificationError);
        }

        toast({
          title: "Duelo aceito!",
          description: `Iniciando duelo contra ${invite.challenger.nickname}...`,
        });

        console.log('🎮 Redirecionando para duelo...');
        setTimeout(() => {
          navigate(`/casino-duel/${duelId}`);
        }, 1500);
        return;

      } else {
        // Reject invite
        await supabase
          .from('duel_invites')
          .update({ status: 'rejected' })
          .eq('id', invite.id);

        try {
          await supabase.functions.invoke('send-social-notification', {
            body: {
              userId: invite.challenger_id,
              type: 'duel_rejected',
              title: 'Convite Recusado',
              message: `Seu convite de duelo foi recusado`,
              data: { invite_id: invite.id }
            }
          });
        } catch (notificationError) {
          console.error('Error sending rejection notification:', notificationError);
        }

        toast({
          title: "❌ Convite recusado",
          description: "O convite foi recusado",
        });
      }

      onResponse(accepted);
      onClose();

    } catch (error) {
      console.error('💥 Erro completo ao responder convite:', error);
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      console.error('💥 Tipo do erro:', typeof error);
      console.error('💥 Propriedades do erro:', Object.keys(error || {}));
      
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Não foi possível responder ao convite",
        variant: "destructive"
      });
    } finally {
      setIsResponding(false);
    }
  };

  const timeAgo = new Date(invite.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Convite para Duelo
          </DialogTitle>
        </DialogHeader>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Clock className="h-3 w-3 mr-1" />
                {timeAgo}
              </Badge>
              <Badge variant="secondary">
                {topicsMap[invite.quiz_topic] || invite.quiz_topic}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Challenger Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
              <AvatarDisplayUniversal
                avatarName={invite.challenger.avatars?.name}
                avatarUrl={invite.challenger.avatars?.image_url}
                nickname={invite.challenger.nickname}
                size="md"
                className="border-2 border-primary/20"
              />
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {invite.challenger.nickname}
                </div>
                <div className="text-sm text-muted-foreground">
                  Nível {invite.challenger.level} • {invite.challenger.xp} XP
                </div>
              </div>
            </div>

            {/* Challenge Details */}
            <div className="space-y-2 text-center">
              <p className="text-lg font-semibold text-foreground">
                <span className="text-primary">{invite.challenger.nickname}</span> quer duelar com você!
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Tópico: {topicsMap[invite.quiz_topic] || invite.quiz_topic}</span>
              </div>
              
              {/* Bet Amount Highlight */}
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-lg p-3 my-3">
                <div className="text-lg font-bold text-orange-400">
                  💰 Aposta: {invite.bet_amount || 100} BTZ
                </div>
                <div className="text-xs text-orange-300/70">
                  Valor da aposta em jogo
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                10 perguntas • 30 segundos cada • Duelo simultâneo
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleResponse(false)}
                disabled={isResponding}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                ❌ Recusar
              </Button>
              <Button
                onClick={() => handleResponse(true)}
                disabled={isResponding}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isResponding ? "..." : "✅ Aceitar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
