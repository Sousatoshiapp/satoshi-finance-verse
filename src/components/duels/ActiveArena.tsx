import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shared/ui/avatar';
import { useBotPresenceSimulation } from '@/hooks/useBotPresenceSimulation';
import { useI18n } from '@/hooks/use-i18n';
import { Users, Bot, Zap, Clock, RefreshCw, Target } from 'lucide-react';

interface ActiveArenaProps {
  onChallengeBot?: (botId: string) => void;
  showActions?: boolean;
  maxDisplayed?: number;
}

export function ActiveArena({ 
  onChallengeBot, 
  showActions = false, 
  maxDisplayed = 8 
}: ActiveArenaProps) {
  const { t } = useI18n();
  const { onlineBots, loading, lastUpdate, updateBotPresence, totalOnline } = useBotPresenceSimulation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRefreshPresence = async () => {
    setIsUpdating(true);
    await updateBotPresence();
    setIsUpdating(false);
  };

  const getPersonalityIcon = (personality: string) => {
    switch (personality) {
      case 'active': return <Zap className="w-3 h-3" />;
      case 'sporadic': return <Clock className="w-3 h-3" />;
      case 'night_owl': return <Bot className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sporadic': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'night_owl': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const displayedBots = onlineBots.slice(0, maxDisplayed);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Arena
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 font-medium">
              {totalOnline} online
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshPresence}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t('duels.loadingArena')}
            </span>
          </div>
        ) : displayedBots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('duels.noBotsOnline')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayedBots.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={bot.bot_profile?.user_avatars?.[0]?.avatars?.image_url || bot.bot_profile?.profile_image_url} />
                    <AvatarFallback className="bg-purple-500 text-white">
                      {bot.bot_profile?.nickname?.substring(0, 2) || 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {bot.bot_profile?.nickname || 'AI Bot'}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPersonalityColor(bot.personality_type)}`}
                    >
                      {getPersonalityIcon(bot.personality_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{t('common.level')} {bot.bot_profile?.level || 1}</span>
                  </div>
                </div>

                {showActions && onChallengeBot && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChallengeBot(bot.bot_id)}
                    className="text-xs"
                  >
                    {t('duels.challenge')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}