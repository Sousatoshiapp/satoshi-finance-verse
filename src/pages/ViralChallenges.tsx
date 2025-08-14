import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Share2, 
  Trophy, 
  TrendingUp, 
  Heart,
  Instagram,
  Twitter,
  Clipboard,
  Star,
  Calendar,
  Target,
  Users,
  Gift
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ViralChallenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  status: 'active' | 'completed' | 'upcoming';
  start_date: string;
  end_date: string;
  target_shares: number;
  current_shares: number;
  rewards: any;
  challenge_type: string;
  is_seasonal: boolean;
}

interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  shares_count: number;
  engagement_score: number;
  completion_rate: number;
  rewards_earned: any;
  participated_at: string;
  completed_at?: string;
}

export default function ViralChallenges() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<ViralChallenge[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipation[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      // Load challenges
      const { data: challengesData } = await supabase
        .from('viral_challenges')
        .select('*')
        .order('start_date', { ascending: false });

      setChallenges(challengesData || []);

      // Load user participations
      if (profile) {
        const { data: participationsData } = await supabase
          .from('challenge_participation')
          .select('*')
          .eq('user_id', profile.id);

        setParticipations(participationsData || []);
      }

    } catch (error) {
      console.error('Error loading viral challenges data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos desafios virais",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('challenge_participation')
        .insert({
          challenge_id: challengeId,
          user_id: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "Desafio aceito!",
        description: "Você foi inscrito no desafio viral. Comece a compartilhar!"
      });

      await loadData();

    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Já participando",
          description: "Você já está participando deste desafio",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao se inscrever no desafio",
          variant: "destructive"
        });
      }
    }
  };

  const shareToSocial = async (challenge: ViralChallenge, platform: string) => {
    const shareText = `🚀 Participando do ${challenge.title}! ${challenge.hashtag} #BeetzAcademy #SatoshiChallenge`;
    const shareUrl = `https://beetz.academy/challenges/${challenge.id}`;

    if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
    } else if (platform === 'instagram') {
      // Copy to clipboard for Instagram
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: "Copiado!",
        description: "Texto copiado para área de transferência. Cole no Instagram!"
      });
    }

    // Track the share
    await trackShare(challenge.id, platform);
  };

  const trackShare = async (challengeId: string, platform: string) => {
    if (!userProfile) return;

    try {
      // Insert viral share record
      await supabase
        .from('viral_shares')
        .insert({
          user_id: userProfile.id,
          content_type: 'challenge',
          content_id: challengeId,
          platform: platform,
          hashtags: ['#BeetzAcademy', '#SatoshiChallenge']
        });

      // Update participation
      const participation = participations.find(p => p.challenge_id === challengeId);
      if (participation) {
        await supabase
          .from('challenge_participation')
          .update({
            shares_count: participation.shares_count + 1,
            engagement_score: participation.engagement_score + 10
          })
          .eq('id', participation.id);
      }

      toast({
        title: "Compartilhamento registrado!",
        description: "Seu share foi contabilizado no desafio"
      });

      await loadData();

    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'upcoming': return 'Em breve';
      case 'completed': return 'Finalizado';
      default: return status;
    }
  };

  const isParticipating = (challengeId: string) => {
    return participations.some(p => p.challenge_id === challengeId);
  };

  const getParticipation = (challengeId: string) => {
    return participations.find(p => p.challenge_id === challengeId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Zap className="mr-4" />
                Desafios Virais
              </h1>
              <p className="text-xl opacity-90">
                Compartilhe, engaje e ganhe recompensas incríveis com desafios sazonais
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-4">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Seus Shares</p>
                <p className="font-bold text-2xl">
                  {participations.reduce((sum, p) => sum + p.shares_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Desafios Ativos</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="my-stats">Minhas Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {challenges.filter(c => c.status === 'active').map((challenge) => {
              const participation = getParticipation(challenge.id);
              const isJoined = isParticipating(challenge.id);

              return (
                <Card key={challenge.id} className="border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-xl">
                          <TrendingUp className="mr-2 text-purple-500" />
                          {challenge.title}
                          {challenge.is_seasonal && (
                            <Badge variant="outline" className="ml-2">Sazonal</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                        <div className="flex items-center mt-2">
                          <Badge className="bg-purple-500 text-white mr-2">
                            {challenge.hashtag}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Termina {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(challenge.status)} text-white`}>
                        {getStatusText(challenge.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Challenge Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <Share2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{challenge.current_shares}</p>
                        <p className="text-sm text-muted-foreground">Shares Globais</p>
                      </div>
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{challenge.target_shares}</p>
                        <p className="text-sm text-muted-foreground">Meta</p>
                      </div>
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{participation?.shares_count || 0}</p>
                        <p className="text-sm text-muted-foreground">Seus Shares</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progresso Global</span>
                        <span>{Math.round((challenge.current_shares / challenge.target_shares) * 100)}%</span>
                      </div>
                      <Progress value={(challenge.current_shares / challenge.target_shares) * 100} className="h-3" />
                    </div>

                    {/* Rewards */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Gift className="mr-2 text-purple-500" />
                        Recompensas
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl">⚡</div>
                          <p className="font-bold">{challenge.rewards.xp} XP</p>
                          <p className="text-xs text-muted-foreground">Por compartilhamento</p>
                        </div>
                        <div>
                          <div className="text-2xl">💰</div>
                          <p className="font-bold">{challenge.rewards.beetz} BTZ</p>
                          <p className="text-xs text-muted-foreground">Bônus de engajamento</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isJoined ? (
                      <div className="flex justify-center">
                        <Button 
                          onClick={() => joinChallenge(challenge.id)} 
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Participar do Desafio
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            ✓ Participando
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => shareToSocial(challenge, 'twitter')}
                            className="flex-1"
                          >
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => shareToSocial(challenge, 'instagram')}
                            className="flex-1"
                          >
                            <Instagram className="h-4 w-4 mr-2" />
                            Instagram
                          </Button>
                        </div>

                        {participation && (
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-green-600">
                              <Heart className="inline h-4 w-4 mr-1" />
                              Score de Engajamento: <span className="font-bold">{Math.round(participation.engagement_score)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {challenges.filter(c => c.status === 'active').length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum desafio ativo</h3>
                  <p className="text-muted-foreground">
                    Fique ligado para os próximos desafios virais!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {challenges.filter(c => c.status === 'upcoming').map((challenge) => (
              <Card key={challenge.id} className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <Calendar className="mr-2 text-blue-500" />
                        {challenge.title}
                        {challenge.is_seasonal && (
                          <Badge variant="outline" className="ml-2">Sazonal</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(challenge.status)} text-white`}>
                      {getStatusText(challenge.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Início</p>
                      <p className="font-semibold">
                        {formatDistanceToNow(new Date(challenge.start_date), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Meta de Shares</p>
                      <p className="font-semibold">{challenge.target_shares.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Prepare-se!</h4>
                    <p className="text-sm text-muted-foreground">
                      Este desafio viral está chegando. Prepare seu conteúdo e fique pronto para viralizar!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="my-stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Share2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <p className="text-3xl font-bold">{participations.reduce((sum, p) => sum + p.shares_count, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total de Shares</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p className="text-3xl font-bold">
                    {Math.round(participations.reduce((sum, p) => sum + p.engagement_score, 0) / Math.max(participations.length, 1))}
                  </p>
                  <p className="text-sm text-muted-foreground">Score Médio de Engajamento</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                  <p className="text-3xl font-bold">{participations.filter(p => p.completed_at).length}</p>
                  <p className="text-sm text-muted-foreground">Desafios Completados</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Participações</CardTitle>
                <CardDescription>
                  Seus desafios e performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma participação ainda</p>
                    <p className="text-sm">Participe de um desafio viral para ver suas stats!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participations.map((participation) => {
                      const challenge = challenges.find(c => c.id === participation.challenge_id);
                      return (
                        <div key={participation.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">{challenge?.title || 'Desafio'}</p>
                            <p className="text-sm text-muted-foreground">
                              {participation.shares_count} shares • Score: {Math.round(participation.engagement_score)}
                            </p>
                          </div>
                          <div className="text-right">
                            {participation.completed_at ? (
                              <Badge className="bg-green-500">Completado</Badge>
                            ) : (
                              <Badge variant="outline">Em Andamento</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}