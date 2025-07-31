import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Trophy, Target, Sword, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_points: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  progress?: number;
  completed?: boolean;
}

export function SocialChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenges, setActiveChallenges] = useState(0);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data } = await supabase
        .from('social_challenges')
        .select('*')
        .eq('is_active', true)
        .order('ends_at');

      const challengesWithProgress = data?.map(challenge => ({
        ...challenge,
        progress: Math.floor(Math.random() * challenge.target_value), // Placeholder
        completed: Math.random() > 0.7 // Random completion for demo
      })) || [];

      setChallenges(challengesWithProgress);
      setActiveChallenges(challengesWithProgress.filter(c => c.is_active).length);
    } catch (error) {
      console.error('Error loading social challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeClick = (challenge: SocialChallenge) => {
    if (challenge.completed) return;
    
    switch (challenge.challenge_type) {
      case 'duel_wins':
        navigate('/duels');
        break;
      case 'social_posts':
      case 'chat_messages':
        navigate('/social');
        break;
      case 'friend_challenges':
        navigate('/social');
        break;
      default:
        navigate('/social');
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'duel_wins': return <Sword className="h-5 w-5" />;
      case 'social_posts': return <MessageCircle className="h-5 w-5" />;
      case 'chat_messages': return <MessageCircle className="h-5 w-5" />;
      case 'friend_challenges': return <Users className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Desafios Sociais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-background to-blue-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Desafios Sociais
            <Badge variant="secondary" className="ml-2">
              {activeChallenges} ativos
            </Badge>
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/social-challenges')}
            className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
          >
            Ver Todos
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {challenges.slice(0, 4).map((challenge) => (
          <div
            key={challenge.id}
            onClick={() => handleChallengeClick(challenge)}
            className={cn(
              "border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]",
              challenge.completed 
                ? "bg-green-500/10 border-green-500/30 cursor-default" 
                : "bg-card border-border hover:border-blue-500/30"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-blue-500">
                  {getChallengeIcon(challenge.challenge_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-medium text-sm",
                      challenge.completed ? "line-through text-muted-foreground" : ""
                    )}>
                      {challenge.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(challenge.ends_at)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {challenge.description}
                  </p>
                  
                  {/* Progress */}
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span className="font-medium">
                        {Math.min(challenge.progress || 0, challenge.target_value)}/{challenge.target_value}
                      </span>
                    </div>
                    <Progress 
                      value={(Math.min(challenge.progress || 0, challenge.target_value) / challenge.target_value) * 100} 
                      className="h-1.5"
                    />
                  </div>
                  
                  {/* Reward */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-orange-500">
                      <Trophy className="h-3 w-3" />
                      +{challenge.reward_points} Beetz
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="ml-2">
                {challenge.completed ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Trophy className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500/30"></div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {challenges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum desafio social ativo</p>
            <p className="text-sm">Novos desafios aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}