import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DuelInvitesProps {
  invites: any[];
  onInviteResponse: () => void;
}

export function DuelInvites({ invites, onInviteResponse }: DuelInvitesProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInviteResponse = async (inviteId: string, action: 'accept' | 'decline') => {
    setLoading(inviteId);
    
    try {
      if (action === 'accept') {
        // Update invite status to accepted
        const { error: inviteError } = await supabase
          .from('duel_invites')
          .update({ status: 'accepted' })
          .eq('id', inviteId);

        if (inviteError) throw inviteError;

        // Create the duel
        const invite = invites.find(inv => inv.id === inviteId);
        if (invite) {
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
            return;
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

          const { error: duelError } = await supabase
            .from('duels')
            .insert({
              invite_id: inviteId,
              player1_id: invite.challenger_id,
              player2_id: invite.challenged_id,
              quiz_topic: invite.quiz_topic,
              questions: questions,
              status: 'active',
              current_turn: invite.challenger_id,
              turn_started_at: new Date().toISOString()
            });

          if (duelError) throw duelError;

          toast({
            title: "Duelo Aceito!",
            description: "O duelo começou. Boa sorte!",
          });
        }
      } else {
        // Decline invite
        const { error } = await supabase
          .from('duel_invites')
          .update({ status: 'declined' })
          .eq('id', inviteId);

        if (error) throw error;

        toast({
          title: "Convite Recusado",
          description: "O convite foi recusado",
        });
      }

      onInviteResponse();
    } catch (error) {
      console.error('Error handling invite response:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a resposta",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Convite</Badge>
                <span>{invite.challenger.nickname}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {new Date(invite.expires_at).toLocaleString()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">
                  <strong>{invite.challenger.nickname}</strong> te desafiou para um duelo sobre{" "}
                  <strong>{invite.quiz_topic}</strong>
                </p>
                <Badge variant="secondary">{invite.quiz_topic}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInviteResponse(invite.id, 'decline')}
                  disabled={loading === invite.id}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Recusar
                </Button>
                <Button
                  onClick={() => handleInviteResponse(invite.id, 'accept')}
                  disabled={loading === invite.id}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aceitar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}