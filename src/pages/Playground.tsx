import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { TradingInterface } from "@/components/trading/trading-interface";
import { PortfolioBuilder } from "@/components/portfolio/portfolio-builder";
import { UserCard } from "@/components/features/social/user-card";
import { SocialButton } from "@/components/features/social/social-button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Trophy, 
  AlertTriangle,
  Zap,
  Eye,
  Copy,
  Share2,
  Activity,
  Target,
  BarChart3
} from "lucide-react";

interface Portfolio {
  id: string;
  name: string;
  description: string;
  performance_percentage: number;
  current_balance: number;
  initial_balance: number;
  is_public: boolean;
  likes_count: number;
  followers_count: number;
  user: {
    id: string;
    nickname: string;
    profile_image_url?: string;
    level?: number;
  };
  created_at: string;
}

interface MarketEvent {
  id: string;
  name: string;
  description: string;
  event_type: string;
  impact_percentage: number;
  is_active: boolean;
  expires_at: string;
}

export default function Playground() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'trading');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load public portfolios
      const { data: portfoliosData } = await supabase
        .from('portfolios')
        .select(`
          *,
          profiles!inner(
            id,
            nickname,
            profile_image_url,
            level
          )
        `)
        .eq('is_public', true)
        .order('performance_percentage', { ascending: false })
        .limit(10);

      if (portfoliosData) {
        const formattedPortfolios = portfoliosData.map(p => ({
          ...p,
          user: {
            id: p.profiles.id,
            nickname: p.profiles.nickname,
            profile_image_url: p.profiles.profile_image_url,
            level: p.profiles.level
          }
        }));
        setPortfolios(formattedPortfolios);
      }

      // Load active market events
      const { data: eventsData } = await supabase
        .from('market_events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (eventsData) {
        setMarketEvents(eventsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyPortfolio = async (portfolioId: string) => {
    // TODO: Implement copy portfolio functionality
    console.log('Copy portfolio:', portfolioId);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'crash':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'boom':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Zap className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'crash':
        return 'destructive';
      case 'boom':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Demo Trading Platform</h1>
            <p className="text-muted-foreground">
              Pratique trading em tempo real com saldo virtual, aprenda com outros traders e compete em rankings
            </p>
          </div>

          {/* Market Events Alert */}
          {marketEvents.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-5 w-5" />
                  Eventos de Mercado Ativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {marketEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-white dark:bg-orange-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.event_type)}
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getEventBadgeColor(event.event_type) as any}>
                        {event.impact_percentage > 0 ? '+' : ''}{event.impact_percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="trading" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="explore">Explorar</TabsTrigger>
              <TabsTrigger value="rankings" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Rankings
              </TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            <TabsContent value="trading">
              <TradingInterface />
            </TabsContent>

            <TabsContent value="portfolio">
              <PortfolioBuilder 
                onSave={(portfolio) => {
                  loadData(); // Refresh data
                  setActiveTab('explore'); // Switch to explore tab
                }}
              />
            </TabsContent>

            <TabsContent value="explore" className="space-y-6">
              <div className="grid gap-6">
                <h2 className="text-xl font-semibold">Carteiras Públicas em Destaque</h2>
                
                {portfolios.map(portfolio => (
                  <Card key={portfolio.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {portfolio.name}
                            {portfolio.performance_percentage >= 10 && (
                              <Badge variant="default">
                                <Trophy className="h-3 w-3 mr-1" />
                                Top Performer
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {portfolio.description}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`flex items-center gap-1 ${
                              portfolio.performance_percentage >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {portfolio.performance_percentage >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="font-bold">
                                {portfolio.performance_percentage.toFixed(2)}%
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              R$ {portfolio.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <UserCard user={portfolio.user} compact showSocialStats={false} />
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mr-3">
                            <Eye className="h-4 w-4" />
                            <SocialButton
                              targetType="portfolio"
                              targetId={portfolio.id}
                              targetUserId={portfolio.user.id}
                              actionType="like"
                              showCount
                              variant="ghost"
                            />
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPortfolio(portfolio.id)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {portfolios.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">
                        Nenhuma carteira pública encontrada. Seja o primeiro a criar uma!
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => setActiveTab('builder')}
                      >
                        Criar Carteira
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rankings">
              <Card>
                <CardHeader>
                  <CardTitle>Rankings de Performance</CardTitle>
                  <CardDescription>
                    Os melhores investidores do playground esta semana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolios.slice(0, 5).map((portfolio, index) => (
                      <div key={portfolio.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <UserCard user={portfolio.user} compact />
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${
                            portfolio.performance_percentage >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {portfolio.performance_percentage >= 0 ? '+' : ''}{portfolio.performance_percentage.toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {portfolio.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Comunidade de Investidores</CardTitle>
                    <CardDescription>
                      Conecte-se com outros investidores e aprenda com suas estratégias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Funcionalidade social em desenvolvimento
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Em breve você poderá seguir outros investidores, ver suas atividades e participar de discussões
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
