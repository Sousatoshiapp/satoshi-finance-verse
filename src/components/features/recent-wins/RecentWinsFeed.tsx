import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { useRecentWins } from '@/hooks/useRecentWins';
import { CommunityInteractions } from '@/components/features/social/CommunityInteractions';

interface RecentWin {
  id: string;
  user_id: string;
  win_type: 'duel_victory' | 'quiz_perfect' | 'streak_milestone' | 'tournament_win' | 'achievement_unlock' | 'level_up';
  win_data: any;
  created_at: string;
  user: {
    nickname: string;
    level: number;
    avatar?: { image_url: string };
  };
  likes: number;
  comments: number;
}
import { 
  Trophy, 
  Crown, 
  Star, 
  Zap, 
  Target, 
  Flame, 
  Gift,
  TrendingUp,
  Users,
  Timer
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export function RecentWinsFeed() {
  const [filter, setFilter] = useState<'all' | 'duels' | 'achievements' | 'streaks'>('all');
  const { recentWins, isLoading } = useRecentWins(filter);

  const getWinIcon = (winType: string) => {
    switch (winType) {
      case 'duel_victory': return <Target className="w-5 h-5 text-red-500" />;
      case 'quiz_perfect': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'streak_milestone': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'tournament_win': return <Crown className="w-5 h-5 text-purple-500" />;
      case 'achievement_unlock': return <Trophy className="w-5 h-5 text-blue-500" />;
      case 'level_up': return <TrendingUp className="w-5 h-5 text-green-500" />;
      default: return <Gift className="w-5 h-5 text-gray-500" />;
    }
  };

  const getWinMessage = (win: RecentWin) => {
    const { win_type, win_data } = win;
    const nickname = win.user.nickname;

    switch (win_type) {
      case 'duel_victory':
        return `🎯 ${nickname} venceu ${win_data.opponent_nickname} no duelo!`;
      case 'quiz_perfect':
        return `⭐ ${nickname} fez um quiz perfeito com ${win_data.score}% de acertos!`;
      case 'streak_milestone':
        return `🔥 ${nickname} atingiu ${win_data.streak_days} dias de sequência!`;
      case 'tournament_win':
        return `👑 ${nickname} venceu o torneio "${win_data.tournament_name}"!`;
      case 'achievement_unlock':
        return `🏆 ${nickname} desbloqueou: ${win_data.achievement_name}`;
      case 'level_up':
        return `📈 ${nickname} subiu para o nível ${win_data.level_reached}!`;
      default:
        return `🎉 ${nickname} conquistou algo incrível!`;
    }
  };

  const getWinDetails = (win: RecentWin) => {
    const { win_type, win_data } = win;

    switch (win_type) {
      case 'duel_victory':
        return `Vitória épica contra ${win_data.opponent_nickname}`;
      case 'quiz_perfect':
        return `${win_data.score}% de acertos - Performance perfeita!`;
      case 'streak_milestone':
        return `${win_data.streak_days} dias consecutivos de estudo`;
      case 'tournament_win':
        return `Prêmio: ${win_data.prize_amount} BTZ`;
      case 'achievement_unlock':
        return win_data.achievement_name;
      case 'level_up':
        return `Agora no nível ${win_data.level_reached}`;
      default:
        return 'Conquista incrível!';
    }
  };

  const getBadgeVariant = (winType: string) => {
    switch (winType) {
      case 'duel_victory': return 'destructive';
      case 'quiz_perfect': return 'default';
      case 'streak_milestone': return 'secondary';
      case 'tournament_win': return 'outline';
      case 'achievement_unlock': return 'default';
      case 'level_up': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Todos', icon: Gift },
          { key: 'duels', label: 'Duelos', icon: Target },
          { key: 'achievements', label: 'Conquistas', icon: Trophy },
          { key: 'streaks', label: 'Sequências', icon: Flame }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="flex-shrink-0"
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Recent Wins List */}
      <Card>
        <CardContent className="p-4">
          {recentWins.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma vitória recente</h3>
              <p className="text-muted-foreground">
                As conquistas da comunidade aparecerão aqui!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {recentWins.map((win, index) => (
                  <motion.div
                    key={win.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={win.user.avatar?.image_url || '/placeholder-avatar.png'}
                        alt={win.user.nickname}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                        {getWinIcon(win.win_type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm leading-tight">
                            {getWinMessage(win)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getWinDetails(win)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={getBadgeVariant(win.win_type)}
                              className="text-xs"
                            >
                              Lv.{win.user.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {formatDistanceToNow(new Date(win.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Social Interactions */}
                      <div className="mt-3">
                        <CommunityInteractions 
                          contentId={win.id}
                          contentType="win"
                          initialLikes={win.likes}
                          initialComments={win.comments}
                          userHasLiked={false}
                        />
                      </div>
                    </div>

                    {/* Celebration Effect */}
                    {index < 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0"
                      >
                        <Zap className="w-5 h-5 text-yellow-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}