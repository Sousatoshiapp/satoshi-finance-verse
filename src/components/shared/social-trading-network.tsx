import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  TrendingUp, 
  Copy, 
  Star, 
  Eye,
  Award,
  Zap,
  Crown,
  MessageCircle,
  Heart,
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TopTrader {
  id: string;
  username: string;
  avatar_url: string;
  rank: number;
  followers: number;
  copiers: number;
  profit_percentage: number;
  win_rate: number;
  trades_count: number;
  verified: boolean;
  status: 'online' | 'offline';
  last_trade: string;
}

interface SocialTrade {
  id: string;
  trader: {
    username: string;
    avatar_url: string;
    verified: boolean;
  };
  action: 'buy' | 'sell';
  asset: string;
  amount: number;
  price: number;
  reasoning: string;
  timestamp: string;
  likes: number;
  comments: number;
  copies: number;
  performance: number;
}

export function SocialTradingNetwork() {
  const navigate = useNavigate();
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [socialTrades, setSocialTrades] = useState<SocialTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(12);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      // Mock top traders data
      const mockTraders: TopTrader[] = [
        {
          id: '1',
          username: 'CryptoKing_Pro',
          avatar_url: '/placeholder-avatar.jpg',
          rank: 1,
          followers: 2847,
          copiers: 342,
          profit_percentage: 127.5,
          win_rate: 84,
          trades_count: 156,
          verified: true,
          status: 'online',
          last_trade: '2 min atrás'
        },
        {
          id: '2',
          username: 'BlockchainMaster',
          avatar_url: '/placeholder-avatar.jpg',
          rank: 2,
          followers: 1923,
          copiers: 287,
          profit_percentage: 98.3,
          win_rate: 78,
          trades_count: 203,
          verified: true,
          status: 'online',
          last_trade: '15 min atrás'
        },
        {
          id: '3',
          username: 'TradingNinja',
          avatar_url: '/placeholder-avatar.jpg',
          rank: 3,
          followers: 1456,
          copiers: 198,
          profit_percentage: 89.7,
          win_rate: 75,
          trades_count: 134,
          verified: false,
          status: 'offline',
          last_trade: '1h atrás'
        }
      ];

      const mockSocialTrades: SocialTrade[] = [
        {
          id: '1',
          trader: {
            username: 'CryptoKing_Pro',
            avatar_url: '/placeholder-avatar.jpg',
            verified: true
          },
          action: 'buy',
          asset: 'BTC',
          amount: 0.5,
          price: 42750,
          reasoning: 'Strong support at $42k, expecting bounce to $45k resistance',
          timestamp: '5 min atrás',
          likes: 23,
          comments: 8,
          copies: 12,
          performance: 2.3
        },
        {
          id: '2',
          trader: {
            username: 'BlockchainMaster',
            avatar_url: '/placeholder-avatar.jpg',
            verified: true
          },
          action: 'sell',
          asset: 'ETH',
          amount: 2.8,
          price: 3180,
          reasoning: 'Taking profits before potential pullback to $3k',
          timestamp: '18 min atrás',
          likes: 15,
          comments: 4,
          copies: 7,
          performance: 1.8
        }
      ];

      setTopTraders(mockTraders);
      setSocialTrades(mockSocialTrades);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2: return <Award className="h-4 w-4 text-gray-400" />;
      case 3: return <Award className="h-4 w-4 text-orange-600" />;
      default: return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    return action === 'buy' ? 'text-green-500' : 'text-red-500';
  };

  const getPerformanceColor = (performance: number) => {
    return performance > 0 ? 'text-green-500' : 'text-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rede Social de Trading
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
    <Card className="border-cyan-500/20 bg-gradient-to-br from-background to-cyan-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-500" />
            Rede Social de Trading
            <Badge variant="secondary" className="ml-2">
              {followingCount} seguindo
            </Badge>
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/social-trading')}
            className="text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/10"
          >
            Explorar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Top Traders */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-500" />
            Top Traders
          </h3>
          
          <div className="space-y-2">
            {topTraders.slice(0, 2).map((trader) => (
              <div 
                key={trader.id}
                className="border rounded-lg p-3 hover:border-cyan-500/30 transition-all cursor-pointer"
                onClick={() => navigate(`/trader/${trader.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={trader.avatar_url} />
                      <AvatarFallback>{trader.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {trader.status === 'online' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getRankIcon(trader.rank)}
                      <span className="font-medium text-sm">{trader.username}</span>
                      {trader.verified && (
                        <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30">
                          ✓ Verificado
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div>
                        <div className="text-muted-foreground">Lucro</div>
                        <div className="font-medium text-green-500">+{trader.profit_percentage}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Win Rate</div>
                        <div className="font-medium">{trader.win_rate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Copiadores</div>
                        <div className="font-medium">{trader.copiers}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {trader.followers.toLocaleString()} seguidores
                      </span>
                      <span className="text-muted-foreground">
                        Última trade: {trader.last_trade}
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="text-cyan-500">
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Social Feed */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-500" />
            Feed de Trades
          </h3>
          
          <div className="space-y-2">
            {socialTrades.slice(0, 1).map((trade) => (
              <div 
                key={trade.id}
                className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={trade.trader.avatar_url} />
                    <AvatarFallback>{trade.trader.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{trade.trader.username}</span>
                      {trade.trader.verified && (
                        <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30">
                          ✓
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{trade.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={cn("text-xs", getActionColor(trade.action))}>
                        {trade.action.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{trade.asset}</span>
                      <span className="text-sm">
                        {trade.amount} @ ${trade.price.toLocaleString()}
                      </span>
                      <span className={cn("text-sm font-medium", getPerformanceColor(trade.performance))}>
                        {trade.performance > 0 ? '+' : ''}{trade.performance}%
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {trade.reasoning}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {trade.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {trade.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Copy className="h-3 w-3" />
                          {trade.copies}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/social-leaderboard')}
          >
            <Award className="h-4 w-4 mr-2" />
            Ranking
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/copy-trading')}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Trading
          </Button>
        </div>
        
        {topTraders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Conecte-se com outros traders</p>
            <p className="text-sm">Descubra estratégias vencedoras!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}