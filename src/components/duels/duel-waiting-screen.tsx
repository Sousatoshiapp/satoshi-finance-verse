import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { LoadingSpinner } from "@/components/shared/ui/loading-spinner";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { Swords, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

interface DuelWaitingScreenProps {
  duelId?: string;
  opponentNickname?: string;
  topic?: string;
  onStart?: () => void;
}

function DuelWaitingScreen({ 
  duelId: propDuelId, 
  opponentNickname: propOpponentNickname, 
  topic: propTopic,
  onStart 
}: DuelWaitingScreenProps) {
  const { duelId: paramDuelId } = useParams();
  const duelId = propDuelId || paramDuelId;
  
  const [isLoading, setIsLoading] = useState(true);
  const [duelReady, setDuelReady] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [opponentData, setOpponentData] = useState<any>(null);
  const [duelData, setDuelData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    if (!duelId) {
      toast({
        title: "Erro",
        description: "ID do duelo não encontrado",
        variant: "destructive"
      });
      navigate('/duels');
      return;
    }

    checkDuelStatus();
  }, [duelId]);

  useEffect(() => {
    if (duelReady && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (duelReady && countdown === 0) {
      handleStart();
    }
  }, [duelReady, countdown]);

  const checkDuelStatus = async () => {
    try {
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data: duel, error } = await supabase
          .from('duels')
          .select(`
            *,
            player1:profiles!duels_player1_id_fkey(
              id, nickname, level, xp,
              avatars(name, image_url)
            ),
            player2:profiles!duels_player2_id_fkey(
              id, nickname, level, xp,
              avatars(name, image_url)
            )
          `)
          .eq('id', duelId)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking duel status:', error);
          break;
        }

        if (duel) {
          setDuelData(duel);
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (profile) {
              const isPlayer1 = duel.player1_id === profile.id;
              const opponent = isPlayer1 ? duel.player2 : duel.player1;
              setOpponentData(opponent);
            }
          }

          setIsLoading(false);
          setDuelReady(true);
          return;
        }

        if (attempt < 9) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "Erro",
        description: "Não foi possível encontrar o duelo. Redirecionando...",
        variant: "destructive"
      });
      navigate('/duels');
    } catch (error) {
      console.error('Error in checkDuelStatus:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar status do duelo",
        variant: "destructive"
      });
      navigate('/duels');
    }
  };

  const handleStart = () => {
    if (onStart) {
      onStart();
    } else {
      navigate(`/duel/${duelId}`);
    }
  };

  const getDisplayName = () => {
    return propOpponentNickname || opponentData?.nickname || "Oponente";
  };

  const getDisplayTopic = () => {
    const topicsMap: Record<string, string> = {
      "financas": "Finanças Gerais",
      "investimentos": "Investimentos", 
      "criptomoedas": "Criptomoedas",
      "economia": "Economia"
    };
    return topicsMap[propTopic || duelData?.quiz_topic] || propTopic || duelData?.quiz_topic || "Finanças";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Swords className="h-6 w-6 text-primary" />
              {t('duels.financialDuel')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {opponentData && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card border">
                <AvatarDisplayUniversal
                  avatarName={opponentData.avatars?.name}
                  avatarUrl={opponentData.avatars?.image_url}
                  nickname={opponentData.nickname}
                  size="md"
                  className="border-2 border-primary/20"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {getDisplayName()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Nível {opponentData.level} • {opponentData.xp} XP
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Tópico: {getDisplayTopic()}
              </div>
              <div className="text-sm text-muted-foreground">
                10 perguntas • 30 segundos cada
              </div>
            </div>

            <div className="text-center space-y-4">
              {isLoading ? (
                <>
                  <LoadingSpinner size="lg" />
                  <p className="text-lg font-semibold text-muted-foreground">
                    {t('duels.preparingDuel')}
                  </p>
                  <p className="text-muted-foreground">
                    {t('duels.waitingForOpponent')}
                  </p>
                </>
              ) : duelReady ? (
                <>
                  <Clock className="h-16 w-16 mx-auto text-primary" />
                  <p className="text-lg font-semibold text-foreground">
                    {t('duels.duelReady')}
                  </p>
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {t('duels.startDuel')}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {t('duels.autoRedirectIn', { seconds: countdown })}
                  </p>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DuelWaitingScreen;
