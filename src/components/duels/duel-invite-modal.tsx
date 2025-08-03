import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { Swords, Clock, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGlobalDuelInvites } from "@/contexts/GlobalDuelInviteContext";

interface DuelInvite {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_topic: string;
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
        dismissCurrentInvite();

        const questions = [
          {
            id: '1',
            question: 'O que é diversificação de investimentos?',
            options: [
              { id: 'a', text: 'Investir apenas em ações', isCorrect: false },
              { id: 'b', text: 'Distribuir investimentos em diferentes ativos', isCorrect: true },
              { id: 'c', text: 'Investir apenas em renda fixa', isCorrect: false },
              { id: 'd', text: 'Comprar apenas um tipo de ação', isCorrect: false }
            ]
          },
          {
            id: '2',
            question: 'O que é o CDI?',
            options: [
              { id: 'a', text: 'Certificado de Depósito Interbancário', isCorrect: true },
              { id: 'b', text: 'Conta de Depósito Individual', isCorrect: false },
              { id: 'c', text: 'Central de Dados Internacionais', isCorrect: false },
              { id: 'd', text: 'Cadastro de Investidores', isCorrect: false }
            ]
          },
          {
            id: '3',
            question: 'Qual é a principal característica da renda fixa?',
            options: [
              { id: 'a', text: 'Alto risco', isCorrect: false },
              { id: 'b', text: 'Rentabilidade previsível', isCorrect: true },
              { id: 'c', text: 'Volatilidade alta', isCorrect: false },
              { id: 'd', text: 'Liquidez baixa', isCorrect: false }
            ]
          },
          {
            id: '4',
            question: 'O que são ações?',
            options: [
              { id: 'a', text: 'Títulos de dívida', isCorrect: false },
              { id: 'b', text: 'Participações no capital de empresas', isCorrect: true },
              { id: 'c', text: 'Investimentos imobiliários', isCorrect: false },
              { id: 'd', text: 'Reservas bancárias', isCorrect: false }
            ]
          },
          {
            id: '5',
            question: 'Qual é o objetivo da reserva de emergência?',
            options: [
              { id: 'a', text: 'Investir em ações', isCorrect: false },
              { id: 'b', text: 'Cobrir gastos imprevistos', isCorrect: true },
              { id: 'c', text: 'Pagar impostos', isCorrect: false },
              { id: 'd', text: 'Comprar bens de luxo', isCorrect: false }
            ]
          },
          {
            id: '6',
            question: 'O que é inflação?',
            options: [
              { id: 'a', text: 'Aumento geral dos preços', isCorrect: true },
              { id: 'b', text: 'Diminuição dos juros', isCorrect: false },
              { id: 'c', text: 'Valorização da moeda', isCorrect: false },
              { id: 'd', text: 'Crescimento econômico', isCorrect: false }
            ]
          },
          {
            id: '7',
            question: 'Qual a vantagem dos fundos de investimento?',
            options: [
              { id: 'a', text: 'Garantia de lucro', isCorrect: false },
              { id: 'b', text: 'Gestão profissional', isCorrect: true },
              { id: 'c', text: 'Isenção de impostos', isCorrect: false },
              { id: 'd', text: 'Liquidez zero', isCorrect: false }
            ]
          },
          {
            id: '8',
            question: 'O que é Tesouro Direto?',
            options: [
              { id: 'a', text: 'Ações do governo', isCorrect: false },
              { id: 'b', text: 'Títulos públicos federais', isCorrect: true },
              { id: 'c', text: 'Investimentos privados', isCorrect: false },
              { id: 'd', text: 'Moedas digitais', isCorrect: false }
            ]
          },
          {
            id: '9',
            question: 'Qual é o risco da renda variável?',
            options: [
              { id: 'a', text: 'Perda de capital', isCorrect: true },
              { id: 'b', text: 'Ganho garantido', isCorrect: false },
              { id: 'c', text: 'Juros baixos', isCorrect: false },
              { id: 'd', text: 'Liquidez alta', isCorrect: false }
            ]
          },
          {
            id: '10',
            question: 'O que significa IPO?',
            options: [
              { id: 'a', text: 'Investimento Pessoal Online', isCorrect: false },
              { id: 'b', text: 'Oferta Pública Inicial', isCorrect: true },
              { id: 'c', text: 'Índice de Preços Oficial', isCorrect: false },
              { id: 'd', text: 'Imposto sobre Operações', isCorrect: false }
            ]
          }
        ];

        const { data: duelId, error: duelError } = await supabase.rpc('create_duel_with_invite', {
          p_challenger_id: invite.challenger_id,
          p_challenged_id: invite.challenged_id,
          p_quiz_topic: invite.quiz_topic,
          p_questions: questions
        });

        if (duelError) {
          console.error('Error creating duel:', duelError);
          throw new Error('Erro ao criar duelo: ' + duelError.message);
        }

        // Update invite status to accepted
        await supabase
          .from('duel_invites')
          .update({ status: 'accepted' })
          .eq('id', invite.id);

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
        } catch (notificationError) {
          console.error('Error sending acceptance notification:', notificationError);
        }

        if (duelId) {
          const { data: createdDuel } = await supabase
            .from('duels')
            .select('*')
            .eq('id', duelId)
            .eq('status', 'active')
            .single();
          
          if (createdDuel) {
            toast({
              title: "Duelo aceito!",
              description: `Iniciando duelo contra ${invite.challenger.nickname}...`,
            });
            
            window.location.href = '/duels';
            return;
          }
        }

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
      console.error('Error responding to invite:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível responder ao convite",
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
