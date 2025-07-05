import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SocialButton } from "@/components/social/social-button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trophy, Medal, Star, TrendingUp, Users, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingNavbar } from "@/components/floating-navbar";

interface UserProfileData {
  id: string;
  nickname: string;
  profile_image_url?: string;
  level: number;
  xp: number;
  points: number;
  completed_lessons: number;
  streak: number;
  created_at: string;
  avatar?: {
    id: string;
    name: string;
    image_url: string;
    description?: string;
    rarity: string;
  };
  follower_count: number;
  following_count: number;
  portfolio_count: number;
  achievements: {
    tournaments_won: number;
    quizzes_completed: number;
    perfect_scores: number;
    social_interactions: number;
  };
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId]);

  const loadUserProfile = async (profileId: string) => {
    try {
      // Load user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          profile_image_url,
          level,
          xp,
          points,
          completed_lessons,
          streak,
          created_at,
          avatar:avatars(id, name, image_url, description, rarity)
        `)
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      // Get follower count
      const { count: followerCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);

      // Get following count
      const { count: followingCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId);

      // Get portfolio count
      const { count: portfolioCount } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileId)
        .eq('is_public', true);

      // Get quiz sessions for achievements
      const { data: quizSessions } = await supabase
        .from('quiz_sessions')
        .select('questions_correct, questions_total')
        .eq('user_id', profileId);

      // Calculate achievements
      const achievements = {
        tournaments_won: 0, // TODO: Implement when tournaments are ready
        quizzes_completed: quizSessions?.length || 0,
        perfect_scores: quizSessions?.filter(s => s.questions_correct === s.questions_total).length || 0,
        social_interactions: (followerCount || 0) + (followingCount || 0)
      };

      setUser({
        ...profile,
        follower_count: followerCount || 0,
        following_count: followingCount || 0,
        portfolio_count: portfolioCount || 0,
        achievements
      });

    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil do usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (targetUserId: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (!profile) return;

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${profile.id},participant2_id.eq.${targetUserId}),and(participant1_id.eq.${targetUserId},participant2_id.eq.${profile.id})`)
        .single();

      let conversationId = existingConv?.id;

      if (!conversationId) {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant1_id: profile.id,
            participant2_id: targetUserId
          })
          .select('id')
          .single();

        if (error) throw error;
        conversationId = newConv.id;
      }

      navigate('/social', { state: { openConversation: conversationId } });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-muted-foreground py-8">
            Carregando perfil...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <FloatingNavbar />
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-muted-foreground py-8">
            Usuário não encontrado
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <FloatingNavbar />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatar?.image_url || user.profile_image_url} />
                  <AvatarFallback className="text-2xl">
                    {user.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">{user.nickname}</h2>
                  {user.avatar && (
                    <p className="text-muted-foreground mb-2">{user.avatar.name}</p>
                  )}
                  <Badge 
                    variant="secondary" 
                    className="bg-orange-500 text-white text-sm mb-4"
                  >
                    Nível {user.level}
                  </Badge>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.xp}</div>
                    <div className="text-sm text-muted-foreground">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.points}</div>
                    <div className="text-sm text-muted-foreground">Pontos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.follower_count}</div>
                    <div className="text-sm text-muted-foreground">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.following_count}</div>
                    <div className="text-sm text-muted-foreground">Seguindo</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <SocialButton
                    targetType="profile"
                    targetId={user.id}
                    targetUserId={user.id}
                    actionType="follow"
                    size="default"
                    variant="outline"
                  />
                  <SocialButton
                    targetType="profile"
                    targetId={user.id}
                    targetUserId={user.id}
                    actionType="like"
                    size="default"
                    variant="ghost"
                    showCount
                  />
                  <Button onClick={() => handleStartConversation(user.id)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mensagem
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements & Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-yellow-500" />
                  <span>Torneios Vencidos</span>
                </div>
                <Badge variant="secondary">{user.achievements.tournaments_won}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  <span>Quizzes Completos</span>
                </div>
                <Badge variant="secondary">{user.achievements.quizzes_completed}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Pontuação Perfeita</span>
                </div>
                <Badge variant="secondary">{user.achievements.perfect_scores}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Interações Sociais</span>
                </div>
                <Badge variant="secondary">{user.achievements.social_interactions}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Lições Completadas</span>
                <span className="font-semibold">{user.completed_lessons}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Sequência Atual</span>
                <span className="font-semibold">{user.streak} dias</span>
              </div>
              
              <div className="flex justify-between">
                <span>Carteiras Públicas</span>
                <span className="font-semibold">{user.portfolio_count}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Membro desde</span>
                <span className="font-semibold">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Avatar Info */}
        {user.avatar && (
          <Card>
            <CardHeader>
              <CardTitle>Avatar Ativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar.image_url} />
                  <AvatarFallback>{user.avatar.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.avatar.name}</h3>
                  <Badge 
                    variant={user.avatar.rarity === 'legendary' ? 'destructive' : 
                           user.avatar.rarity === 'epic' ? 'default' : 'secondary'}
                    className="mb-2"
                  >
                    {user.avatar.rarity}
                  </Badge>
                  {user.avatar.description && (
                    <p className="text-sm text-muted-foreground">
                      {user.avatar.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}