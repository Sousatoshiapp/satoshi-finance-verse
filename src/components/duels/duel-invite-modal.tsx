import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { Swords, Clock, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  if (!invite || !invite.challenger) return null;

  const handleResponse = async (accepted: boolean) => {
    setIsResponding(true);
    
    try {
      if (accepted) {
        // Update invite status
        await supabase
          .from('duel_invites')
          .update({ status: 'accepted' })
          .eq('id', invite.id);

        // Get quiz questions from the district
        const { data: districtQuestions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('district_id', 
            // Map quiz topic to district
            invite.quiz_topic === 'XP Investimentos District' ? '0645a23d-6f02-465a-b9a5-8571853ebdec' :
            invite.quiz_topic === 'Banking Sector' ? '6add63a5-9c43-4859-8f9c-282223d6b077' :
            invite.quiz_topic === 'Cripto Valley' ? '5a562d56-efde-4341-8789-87fd3d4cf703' :
            invite.quiz_topic === 'Tech Finance Hub' ? 'e1f9ede2-3a54-4a4f-a533-4f85b9d9025c' :
            invite.quiz_topic === 'International Trade' ? 'c04f1a05-07f2-426b-8ea6-2fb783054111' :
            invite.quiz_topic === 'Real Estate Zone' ? '366870a4-fc67-48c2-be47-d3b35e5b523e' :
            invite.quiz_topic === 'Anima Educação District' ? '1c58cbaa-9ed2-45ba-b2f9-6b666e94e937' :
            '1c58cbaa-9ed2-45ba-b2f9-6b666e94e937' // Default to education district
          )
          .order('difficulty', { ascending: false })
          .limit(5);

        if (questionsError) {
          console.error('Error loading questions:', questionsError);
          throw new Error('Não foi possível carregar perguntas para o duelo');
        }

        // Transform questions to match expected format
        const questions = (districtQuestions || []).map((q, index) => ({
          id: index + 1,
          question: q.question,
          options: JSON.parse(q.options as string).map((opt: string, optIndex: number) => ({
            id: String.fromCharCode(97 + optIndex), // a, b, c, d
            text: opt,
            isCorrect: opt === q.correct_answer
          })),
          explanation: q.explanation || 'Explicação não disponível'
        }));

        // If we don't have enough questions, add some fallback questions
        if (questions.length < 3) {
          const fallbackQuestions = [
            {
              id: questions.length + 1,
              question: "Qual é a regra básica do orçamento pessoal?",
              options: [
                { id: "a", text: "Gastar mais do que se ganha", isCorrect: false },
                { id: "b", text: "Receitas devem ser maiores que despesas", isCorrect: true },
                { id: "c", text: "Poupar é desnecessário", isCorrect: false },
                { id: "d", text: "Investir é muito arriscado", isCorrect: false }
              ],
              explanation: "A regra fundamental do orçamento é manter as receitas maiores que as despesas."
            },
            {
              id: questions.length + 2,
              question: "O que é uma reserva de emergência?",
              options: [
                { id: "a", text: "Dinheiro para compras supérfluas", isCorrect: false },
                { id: "b", text: "Investimento de alto risco", isCorrect: false },
                { id: "c", text: "Recurso para situações inesperadas", isCorrect: true },
                { id: "d", text: "Dinheiro para férias", isCorrect: false }
              ],
              explanation: "A reserva de emergência é um fundo para cobrir despesas inesperadas."
            }
          ];
          
          questions.push(...fallbackQuestions.slice(0, 3 - questions.length));
        }

        const { data: duel } = await supabase
          .from('duels')
          .insert({
            invite_id: invite.id,
            player1_id: invite.challenger_id,
            player2_id: invite.challenged_id,
            quiz_topic: invite.quiz_topic,
            questions: questions,
            status: 'active'
          })
          .select()
          .single();

        toast({
          title: "Duelo aceito!",
          description: `Iniciando duelo contra ${invite.challenger.nickname}...`,
        });

        setTimeout(() => {
          window.location.href = '/duels';
        }, 1000);

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
