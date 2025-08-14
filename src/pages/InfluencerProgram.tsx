import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Share2, 
  Trophy, 
  Target,
  ChevronRight,
  Copy,
  Instagram,
  Twitter
} from "lucide-react";

interface CreatorProfile {
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  total_referrals: number;
  monthly_referrals: number;
  total_earnings: number;
  conversion_rate: number;
  content_created: number;
  engagement_score: number;
}

interface CreatorAnalytics {
  analytics_date: string;
  referrals_count: number;
  earnings_amount: number;
  content_views: number;
  engagement_rate: number;
  quiz_completions: number;
}

export default function InfluencerProgram() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [analytics, setAnalytics] = useState<CreatorAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get or create creator profile
      let { data: creator } = await supabase
        .from('knowledge_creators')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (!creator) {
        // Create new creator profile
        const { data: newCreator } = await supabase
          .from('knowledge_creators')
          .insert({ user_id: profile.id })
          .select()
          .single();
        creator = newCreator;
      }

      setCreatorProfile(creator);

      // Generate referral code
      const code = `SATOSHI_${profile.id.slice(0, 8).toUpperCase()}`;
      setReferralCode(code);

      // Load analytics
      const { data: analyticsData } = await supabase
        .from('creator_analytics')
        .select('*')
        .eq('creator_id', creator.id)
        .order('analytics_date', { ascending: false })
        .limit(30);

      setAnalytics(analyticsData || []);

    } catch (error) {
      console.error('Error loading creator data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do criador",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://beetz.academy/signup?ref=${referralCode}`);
    toast({
      title: "Link copiado!",
      description: "Link de referência copiado para área de transferência"
    });
  };

  const tierColors = {
    bronze: "bg-orange-500",
    silver: "bg-slate-400", 
    gold: "bg-yellow-500",
    diamond: "bg-blue-500"
  };

  const tierRequirements = {
    bronze: { referrals: 0, earnings: 0 },
    silver: { referrals: 10, earnings: 1000 },
    gold: { referrals: 50, earnings: 5000 },
    diamond: { referrals: 100, earnings: 15000 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!creatorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Programa de Influenciadores</CardTitle>
            <CardDescription>
              Erro ao carregar perfil de criador
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentTier = creatorProfile.tier;
  const nextTier = currentTier === 'bronze' ? 'silver' : 
                   currentTier === 'silver' ? 'gold' :
                   currentTier === 'gold' ? 'diamond' : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-glow p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Programa de Influenciadores</h1>
              <p className="text-xl opacity-90">
                Monetize seu conhecimento e construa sua comunidade
              </p>
            </div>
            <div className="text-right">
              <Badge 
                className={`${tierColors[currentTier]} text-white text-lg px-4 py-2`}
                variant="secondary"
              >
                {currentTier.toUpperCase()}
              </Badge>
              <p className="mt-2 text-sm opacity-75">Seu tier atual</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total de Referências</p>
                  <p className="text-2xl font-bold">{creatorProfile.total_referrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Ganho</p>
                  <p className="text-2xl font-bold">{creatorProfile.total_earnings} BTZ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">{creatorProfile.conversion_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Score de Engajamento</p>
                  <p className="text-2xl font-bold">{Math.round(creatorProfile.engagement_score)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="referrals">Referências</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Tier Progress */}
            {nextTier && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2" />
                    Progresso para {nextTier.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Referências</span>
                      <span>{creatorProfile.total_referrals}/{tierRequirements[nextTier].referrals}</span>
                    </div>
                    <Progress 
                      value={(creatorProfile.total_referrals / tierRequirements[nextTier].referrals) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Ganhos (BTZ)</span>
                      <span>{creatorProfile.total_earnings}/{tierRequirements[nextTier].earnings}</span>
                    </div>
                    <Progress 
                      value={(creatorProfile.total_earnings / tierRequirements[nextTier].earnings) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="mr-2" />
                  Seu Link de Referência
                </CardTitle>
                <CardDescription>
                  Compartilhe este link para ganhar recompensas por cada novo usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-3 bg-muted rounded text-sm font-mono">
                    https://beetz.academy/signup?ref={referralCode}
                  </code>
                  <Button size="sm" onClick={copyReferralCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Instagram className="h-4 w-4 mr-2" />
                    Compartilhar no Instagram
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Twitter className="h-4 w-4 mr-2" />
                    Compartilhar no Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Referências</CardTitle>
                <CardDescription>
                  Acompanhe suas referências e ganhos mensais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma referência ainda</p>
                  <p className="text-sm">Compartilhe seu link para começar a ganhar!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Ferramentas de Conteúdo</CardTitle>
                <CardDescription>
                  Crie conteúdo personalizado para suas redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <Target className="h-8 w-8 mb-2" />
                    Quiz Personalizado
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Share2 className="h-8 w-8 mb-2" />
                    Templates de Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Detalhadas</CardTitle>
                <CardDescription>
                  Análise de performance dos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Dados insuficientes</p>
                    <p className="text-sm">Continue criando conteúdo para ver analytics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{analytics.reduce((sum, a) => sum + a.referrals_count, 0)}</p>
                        <p className="text-sm text-muted-foreground">Referências (30d)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{analytics.reduce((sum, a) => sum + a.earnings_amount, 0)}</p>
                        <p className="text-sm text-muted-foreground">Ganhos (30d)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{analytics.reduce((sum, a) => sum + a.content_views, 0)}</p>
                        <p className="text-sm text-muted-foreground">Visualizações</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {(analytics.reduce((sum, a) => sum + a.engagement_rate, 0) / analytics.length).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Taxa de Engajamento</p>
                      </div>
                    </div>
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