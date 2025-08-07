import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { Users, Clock, X, ArrowRight } from 'lucide-react';
import { useGlobalDuelInvites } from '@/contexts/GlobalDuelInviteContext';
import { useI18n } from '@/hooks/use-i18n';

interface QueuedInvite {
  id: string;
  challenger: {
    nickname: string;
    level: number;
    avatars?: {
      name: string;
      image_url: string;
    };
  };
  quiz_topic: string;
  created_at: string;
  timeLeft: number;
}

interface InviteQueueManagerProps {
  queuedInvites: QueuedInvite[];
  onDismissAll: () => void;
  onSelectInvite: (inviteId: string) => void;
}

const topicsMap: Record<string, string> = {
  "financas": "Finanças",
  "investimentos": "Investimentos", 
  "criptomoedas": "Cripto",
  "economia": "Economia"
};

export function InviteQueueManager({ 
  queuedInvites, 
  onDismissAll,
  onSelectInvite 
}: InviteQueueManagerProps) {
  const { queueCount } = useGlobalDuelInvites();
  const { t } = useI18n();

  if (queueCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-40 max-w-sm w-full"
    >
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-50/90 to-yellow-50/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">
                {t('findOpponent.queueManager')}
              </span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {queueCount}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismissAll}
              className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {queuedInvites.slice(0, 3).map((invite, index) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-white/80 border border-orange-200/50 hover:bg-orange-50/80 transition-colors cursor-pointer group"
                  onClick={() => onSelectInvite(invite.id)}
                >
                  <AvatarDisplayUniversal
                    avatarName={invite.challenger.avatars?.name}
                    avatarUrl={invite.challenger.avatars?.image_url}
                    nickname={invite.challenger.nickname}
                    size="sm"
                    className="ring-2 ring-orange-200"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {invite.challenger.nickname}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {topicsMap[invite.quiz_topic] || invite.quiz_topic}
                      </Badge>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{invite.timeLeft}s</span>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </AnimatePresence>

            {queuedInvites.length > 3 && (
              <div className="text-center py-2">
                <span className="text-xs text-orange-600">
                  +{queuedInvites.length - 3} mais convites...
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-orange-200">
            <p className="text-xs text-orange-700 text-center">
              {t('findOpponent.clickToRespond')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}