import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { Swords, Clock, Target, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

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
  isGlobalPopup?: boolean;
  countdown?: number;
  queueCount?: number;
}

const topicsMap: Record<string, string> = {
  "financas": "Finanças Gerais",
  "investimentos": "Investimentos", 
  "criptomoedas": "Criptomoedas",
  "economia": "Economia"
};

export function DuelInviteModal({ 
  invite, 
  open, 
  onClose, 
  onResponse, 
  isGlobalPopup = false,
  countdown,
  queueCount 
}: DuelInviteModalProps) {
  const [isResponding, setIsResponding] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (!invite || !invite.challenger) return null;

  const handleResponse = async (accepted: boolean) => {
    setIsResponding(true);
    
    try {
      if (accepted) {
        const { data: questionsData, error: questionsError } = await supabase.functions.invoke('generate-quiz-questions', {
          body: { topic: invite.quiz_topic, count: 10 }
        });

        if (questionsError || !questionsData?.questions) {
          console.error('Error generating questions:', questionsError);
          throw new Error('Não foi possível gerar perguntas para o duelo');
        }

        const { data: duelId, error: duelError } = await supabase.rpc('create_duel_with_invite', {
          p_challenger_id: invite.challenger_id,
          p_challenged_id: invite.challenged_id,
          p_quiz_topic: invite.quiz_topic,
          p_questions: questionsData.questions
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

        if (duelId) {
          const { data: createdDuel } = await supabase
            .from('duels')
            .select('*')
            .eq('id', duelId)
            .single();

          if (createdDuel) {
            toast({
              title: "Duelo aceito!",
              description: `Iniciando duelo contra ${invite.challenger.nickname}...`,
            });

            setTimeout(() => {
              navigate('/duels');
            }, 1000);
          }
        }

      } else {
        // Reject invite
        await supabase
          .from('duel_invites')
          .update({ status: 'rejected' })
          .eq('id', invite.id);

        toast({
          title: "❌ Convite recusado",
          description: "O convite foi recusado",
        });
      }

      onResponse(accepted);
      if (!isGlobalPopup) {
        onClose();
      }

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

  const content = (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-2xl">
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Swords className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            {isGlobalPopup ? (t ? t('duelInviteNotification.title') : 'Convite de Duelo') : 'Convite para Duelo'}
          </CardTitle>
          {isGlobalPopup && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
          </Badge>
          <Badge variant="secondary" className={isGlobalPopup ? "text-xs md:text-sm" : ""}>
            {topicsMap[invite.quiz_topic] || invite.quiz_topic}
          </Badge>
        </div>

        {isGlobalPopup && queueCount && queueCount > 0 && (
          <Badge variant="outline" className="absolute -top-2 -right-2 bg-orange-500 text-white">
            +{queueCount}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-card border">
          <AvatarDisplayUniversal
            avatarName={invite.challenger.avatars?.name}
            avatarUrl={invite.challenger.avatars?.image_url}
            nickname={invite.challenger.nickname}
            size="md"
            className="border-2 border-primary/20"
          />
          <div className="flex-1">
            <div className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
              <User className="h-4 w-4" />
              {invite.challenger.nickname}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {isGlobalPopup && t ? t('common.level') : 'Nível'} {invite.challenger.level} • {invite.challenger.xp} XP
            </div>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <p className="text-base md:text-lg font-semibold text-foreground">
            {isGlobalPopup && t ? 
              t('duelInviteNotification.subtitle', { challenger: invite.challenger.nickname }) :
              <>
                <span className="text-primary">{invite.challenger.nickname}</span> quer duelar com você!
              </>
            }
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{isGlobalPopup ? '' : 'Tópico: '}{topicsMap[invite.quiz_topic] || invite.quiz_topic}</span>
          </div>
          
          <div className="text-xs md:text-sm text-muted-foreground">
            10 perguntas • 30 segundos cada • Duelo simultâneo
          </div>

          {isGlobalPopup && countdown && (
            <div className="text-xs text-orange-500">
              {t ? t('duelInviteNotification.autoClose', { seconds: countdown }) : `Auto-fechamento em ${countdown}s`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => handleResponse(false)}
            disabled={isResponding}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 h-12 md:h-10 text-sm md:text-base"
          >
            {isGlobalPopup && t ? t('duelInviteNotification.decline') : '❌ Recusar'}
          </Button>
          <Button
            onClick={() => handleResponse(true)}
            disabled={isResponding}
            className="bg-green-600 hover:bg-green-700 text-white h-12 md:h-10 text-sm md:text-base"
          >
            {isResponding ? "..." : (isGlobalPopup && t ? t('duelInviteNotification.accept') : '✅ Aceitar')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isGlobalPopup) {
    return (
      <motion.div
        className="w-full max-w-md md:max-w-lg relative"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Convite para Duelo
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
