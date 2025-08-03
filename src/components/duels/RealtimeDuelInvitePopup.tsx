import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { generateDuelQuestions } from "@/utils/duel-questions";

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
  const navigate = useNavigate();

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
        const questions = await generateDuelQuestions(currentInvite.quiz_topic);

        const { data: duelId, error: duelError } = await supabase.rpc('create_duel_with_invite', {
          p_challenger_id: currentInvite.challenger_id,
          p_challenged_id: currentInvite.challenged_id,
          p_quiz_topic: currentInvite.quiz_topic,
          p_questions: questions as any
        });

        if (duelError) {
          console.error('Error creating duel with RPC:', duelError);
          throw new Error('Erro ao criar duelo: ' + duelError.message);
        }

        await supabase
          .from('duel_invites')
          .update({ status: 'accepted' })
          .eq('id', currentInvite.id);

        console.log('✅ Duel invite accepted, redirecting to duel');

        if (duelId) {
          setTimeout(() => {
            window.location.href = `/duel/${duelId}`;
          }, 1500);
        }

      } else {
        await supabase
          .from('duel_invites')
          .update({ status: 'rejected' })
          .eq('id', currentInvite.id);

        console.log('❌ Duel invite declined');
      }

      dismissCurrentInvite();

    } catch (error) {
      console.error('Error responding to invite:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('duelInviteNotification.errorResponding'),
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
