import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Target, Calendar, Award, Flame, Users, MessageSquare, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_points: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  user_progress?: {
    current_progress: number;
    completed: boolean;
    completed_at?: string;
  };
}

interface UserBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
  metadata: any;
}

const challengeIcons = {
  create_post: MessageSquare,
  like_posts: Heart,
  comment_posts: MessageSquare,
  receive_likes: Heart,
  daily_activity: Flame,
  follow_users: Users,
  share_trades: Target
};

const badgeColors = {
  social: "bg-gradient-to-r from-pink-500 to-rose-500",
  trading: "bg-gradient-to-r from-green-500 to-emerald-500",
  engagement: "bg-gradient-to-r from-blue-500 to-cyan-500",
  achievement: "bg-gradient-to-r from-purple-500 to-violet-500",
  milestone: "bg-gradient-to-r from-orange-500 to-amber-500"
};

export function SocialChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadChallenges();
      loadBadges();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadChallenges = async () => {
    if (!currentUserId) return;

    try {
      // Load active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('social_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Load user progress for each challenge
      const challengeIds = challengesData?.map(c => c.id) || [];
      const { data: progressData, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', currentUserId)
        .in('challenge_id', challengeIds);

      if (progressError) throw progressError;

      const progressMap = new Map(
        progressData?.map(p => [p.challenge_id, p]) || []
      );

      const challengesWithProgress = challengesData?.map(challenge => ({
        ...challenge,
        user_progress: progressMap.get(challenge.id)
      })) || [];

      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBadges = async () => {
    if (!currentUserId) return;

    try {
      const { data: badgesData, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', currentUserId)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBadges(badgesData || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_challenge_progress',
          filter: `user_id=eq.${currentUserId}`
        },
        () => {
          loadChallenges();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          const newBadge = payload.new as UserBadge;
          setBadges(prev => [newBadge, ...prev.slice(0, 9)]);
          
          toast({
            title: "🏆 Nova Conquista!",
            description: `Você ganhou: ${newBadge.badge_name}`,
            duration: 5000
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getProgressPercentage = (challenge: Challenge) => {
    if (!challenge.user_progress) return 0;
    return Math.min((challenge.user_progress.current_progress / challenge.target_value) * 100, 100);
  };

  const getChallengeIcon = (type: string) => {
    const IconComponent = challengeIcons[type as keyof typeof challengeIcons] || Target;
    return IconComponent;
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-1" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
              <div className="h-2 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Badges */}
      {badges.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Suas Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex-shrink-0 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto",
                      badgeColors[badge.badge_type as keyof typeof badgeColors] || badgeColors.achievement
                    )}>
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium truncate w-20">{badge.badge_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(badge.earned_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Desafios Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2">Nenhum desafio ativo</h3>
                <p className="text-muted-foreground text-sm">
                  Novos desafios aparecem regularmente. Volte em breve!
                </p>
              </div>
            ) : (
              challenges.map((challenge) => {
                const IconComponent = getChallengeIcon(challenge.challenge_type);
                const progress = getProgressPercentage(challenge);
                const isCompleted = challenge.user_progress?.completed || false;
                const daysLeft = getDaysLeft(challenge.ends_at);

                return (
                  <Card key={challenge.id} className={cn(
                    "border-2 transition-all",
                    isCompleted 
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20" 
                      : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg flex-shrink-0",
                          isCompleted 
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                            : "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
                        )}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{challenge.title}</h4>
                            {isCompleted && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✅ Completo
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {challenge.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                Progresso: {challenge.user_progress?.current_progress || 0} / {challenge.target_value}
                              </span>
                              <span className="font-medium">{Math.round(progress)}%</span>
                            </div>
                            
                            <Progress 
                              value={progress} 
                              className={cn(
                                "h-2",
                                isCompleted && "bg-green-200"
                              )}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirado'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {challenge.reward_points} Beetz
                              </div>
                            </div>
                            
                            {isCompleted && challenge.user_progress?.completed_at && (
                              <Badge variant="outline" className="text-xs">
                                Concluído {formatDistanceToNow(new Date(challenge.user_progress.completed_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}