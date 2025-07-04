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
          // Generate quiz questions (simplified for demo)
          const questions = [
            {
              id: 1,
              question: "Qual é a regra básica do orçamento pessoal?",
              options: [
                { id: "a", text: "Gastar mais do que se ganha", isCorrect: false },
                { id: "b", text: "Receitas devem ser maiores que despesas", isCorrect: true },
                { id: "c", text: "Poupar é desnecessário", isCorrect: false },
                { id: "d", text: "Investir é muito arriscado", isCorrect: false }
              ]
            },
            {
              id: 2,
              question: "O que é uma reserva de emergência?",
              options: [
                { id: "a", text: "Dinheiro para compras supérfluas", isCorrect: false },
                { id: "b", text: "Investimento de alto risco", isCorrect: false },
                { id: "c", text: "Recurso para situações inesperadas", isCorrect: true },
                { id: "d", text: "Dinheiro para férias", isCorrect: false }
              ]
            },
            {
              id: 3,
              question: "Qual a principal vantagem dos juros compostos?",
              options: [
                { id: "a", text: "Rendimento sobre rendimento", isCorrect: true },
                { id: "b", text: "Garantia de lucro", isCorrect: false },
                { id: "c", text: "Isento de riscos", isCorrect: false },
                { id: "d", text: "Liquidez imediata", isCorrect: false }
              ]
            }
          ];

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