import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { Swords, Clock, Target, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { useGlobalDuelInvites } from "@/contexts/GlobalDuelInviteContext";

const topicsMap: Record<string, string> = {
  "financas": "Finanças Gerais",
  "investimentos": "Investimentos", 
  "criptomoedas": "Criptomoedas",
  "economia": "Economia"
};

export function RealtimeDuelInvitePopup() {
  const { currentInvite, queueCount, dismissCurrentInvite } = useGlobalDuelInvites();
  const [isResponding, setIsResponding] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    if (currentInvite && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentInvite, countdown]);

  useEffect(() => {
    if (currentInvite) {
      setCountdown(30);
    }
  }, [currentInvite?.id]);

  const handleResponse = async (accepted: boolean) => {
    if (!currentInvite) return;
    
    setIsResponding(true);
    
    try {
      if (accepted) {
        await supabase
          .from('duel_invites')
          .update({ status: 'accepted' })
          .eq('id', currentInvite.id);

        // Get quiz questions from the district
        const { data: districtQuestions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('district_id', 
            // Map quiz topic to district
            currentInvite.quiz_topic === 'XP Investimentos District' ? '0645a23d-6f02-465a-b9a5-8571853ebdec' :
            currentInvite.quiz_topic === 'Banking Sector' ? '6add63a5-9c43-4859-8f9c-282223d6b077' :
            currentInvite.quiz_topic === 'Cripto Valley' ? '5a562d56-efde-4341-8789-87fd3d4cf703' :
            currentInvite.quiz_topic === 'Tech Finance Hub' ? 'e1f9ede2-3a54-4a4f-a533-4f85b9d9025c' :
            currentInvite.quiz_topic === 'International Trade' ? 'c04f1a05-07f2-426b-8ea6-2fb783054111' :
            currentInvite.quiz_topic === 'Real Estate Zone' ? '366870a4-fc67-48c2-be47-d3b35e5b523e' :
            currentInvite.quiz_topic === 'Anima Educação District' ? '1c58cbaa-9ed2-45ba-b2f9-6b666e94e937' :
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
            invite_id: currentInvite.id,
            player1_id: currentInvite.challenger_id,
            player2_id: currentInvite.challenged_id,
            quiz_topic: currentInvite.quiz_topic,
            questions: questions,
            status: 'active'
          })
          .select()
          .single();

        try {
          await supabase.functions.invoke('send-social-notification', {
            body: {
              userId: currentInvite.challenger_id,
              type: 'duel_accepted',
              title: 'Convite Aceito!',
              message: `Seu convite de duelo foi aceito! O duelo começou.`,
              data: { duel_id: duel.id, invite_id: currentInvite.id }
            }
          });
        } catch (notificationError) {
          console.error('Error sending acceptance notification:', notificationError);
        }

        toast({
          title: t('duelInviteNotification.accepted'),
          description: t('duelInviteNotification.startingDuel', { challenger: currentInvite.challenger?.nickname }),
        });

        setTimeout(() => {
          window.location.href = '/duels';
        }, 1000);

      } else {
        await supabase
          .from('duel_invites')
          .update({ status: 'rejected' })
          .eq('id', currentInvite.id);

        try {
          await supabase.functions.invoke('send-social-notification', {
            body: {
              userId: currentInvite.challenger_id,
              type: 'duel_rejected',
              title: 'Convite Recusado',
              message: `Seu convite de duelo foi recusado`,
              data: { invite_id: currentInvite.id }
            }
          });
        } catch (notificationError) {
          console.error('Error sending rejection notification:', notificationError);
        }

        toast({
          title: t('duelInviteNotification.declined'),
          description: t('duelInviteNotification.inviteDeclined'),
        });
      }

      dismissCurrentInvite();

    } catch (error) {
      console.error('Error responding to invite:', error);
      toast({
        title: t('common.error'),
        description: t('duelInviteNotification.errorResponding'),
        variant: "destructive"
      });
    } finally {
      setIsResponding(false);
    }
  };

  if (!currentInvite || !currentInvite.challenger) return null;

  const timeAgo = new Date(currentInvite.created_at).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          className="w-full max-w-md md:max-w-lg relative"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-2xl">
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Swords className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  {t('duelInviteNotification.title')}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissCurrentInvite}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeAgo}
                </Badge>
                <Badge variant="secondary" className="text-xs md:text-sm">
                  {topicsMap[currentInvite.quiz_topic] || currentInvite.quiz_topic}
                </Badge>
              </div>

              {queueCount > 0 && (
                <Badge variant="outline" className="absolute -top-2 -right-2 bg-orange-500 text-white">
                  +{queueCount}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-card border">
                <AvatarDisplayUniversal
                  avatarName={currentInvite.challenger.avatars?.name}
                  avatarUrl={currentInvite.challenger.avatars?.image_url}
                  nickname={currentInvite.challenger.nickname}
                  size="md"
                  className="border-2 border-primary/20"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
                    <User className="h-4 w-4" />
                    {currentInvite.challenger.nickname}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {t('common.level')} {currentInvite.challenger.level} • {currentInvite.challenger.xp} XP
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-center">
                <p className="text-base md:text-lg font-semibold text-foreground">
                  {t('duelInviteNotification.subtitle', { challenger: currentInvite.challenger.nickname })}
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>{topicsMap[currentInvite.quiz_topic] || currentInvite.quiz_topic}</span>
                </div>
                
                <div className="text-xs md:text-sm text-muted-foreground">
                  10 perguntas • 30 segundos cada • Duelo simultâneo
                </div>

                <div className="text-xs text-orange-500">
                  {t('duelInviteNotification.autoClose', { seconds: countdown })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleResponse(false)}
                  disabled={isResponding}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 h-12 md:h-10 text-sm md:text-base"
                >
                  {t('duelInviteNotification.decline')}
                </Button>
                <Button
                  onClick={() => handleResponse(true)}
                  disabled={isResponding}
                  className="bg-green-600 hover:bg-green-700 text-white h-12 md:h-10 text-sm md:text-base"
                >
                  {isResponding ? "..." : t('duelInviteNotification.accept')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
