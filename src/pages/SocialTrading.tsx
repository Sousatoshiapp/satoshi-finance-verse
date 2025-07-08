import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingNavbar } from "@/components/floating-navbar";
import { Users, TrendingUp, Copy, Heart, MessageCircle, Share, Search, ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Trader {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  winRate: number;
  totalReturn: number;
  isFollowing: boolean;
  verified: boolean;
  specialty: string;
}

interface Trade {
  id: string;
  traderId: string;
  traderName: string;
  traderAvatar: string;
  asset: string;
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: Date;
  profit?: number;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export default function SocialTrading() {
  const navigate = useNavigate();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    // Mock data
    const mockTraders: Trader[] = [
      {
        id: '1',
        name: 'CryptoMaster',
        avatar: '/placeholder-avatar.jpg',
        followers: 15420,
        winRate: 78.5,
        totalReturn: 245.7,
        isFollowing: true,
        verified: true,
        specialty: 'DeFi'
      },
      {
        id: '2',
        name: 'BTCWhale',
        avatar: '/placeholder-avatar.jpg',
        followers: 28934,
        winRate: 82.1,
        totalReturn: 356.2,
        isFollowing: false,
        verified: true,
        specialty: 'Bitcoin'
      },
      {
        id: '3',
        name: 'AltcoinPro',
        avatar: '/placeholder-avatar.jpg',
        followers: 8756,
        winRate: 71.3,
        totalReturn: 189.4,
        isFollowing: false,
        verified: false,
        specialty: 'Altcoins'
      }
    ];

    const mockTrades: Trade[] = [
      {
        id: '1',
        traderId: '1',
        traderName: 'CryptoMaster',
        traderAvatar: '/placeholder-avatar.jpg',
        asset: 'BTC/USDT',
        action: 'buy',
        price: 67890,
        quantity: 0.5,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        profit: 1250,
        likes: 45,
        comments: 12,
        isLiked: false
      },
      {
        id: '2',
        traderId: '2',
        traderName: 'BTCWhale',
        traderAvatar: '/placeholder-avatar.jpg',
        asset: 'ETH/USDT',
        action: 'sell',
        price: 3456,
        quantity: 2.5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        profit: -320,
        likes: 23,
        comments: 8,
        isLiked: true
      }
    ];

    setTimeout(() => {
      setTraders(mockTraders);
      setTrades(mockTrades);
      setLoading(false);
    }, 1000);
  };

  const toggleFollow = (traderId: string) => {
    setTraders(prev => prev.map(trader => 
      trader.id === traderId 
        ? { ...trader, isFollowing: !trader.isFollowing }
        : trader
    ));
  };

  const toggleLike = (tradeId: string) => {
    setTrades(prev => prev.map(trade => 
      trade.id === tradeId 
        ? { 
            ...trade, 
            isLiked: !trade.isLiked,
            likes: trade.isLiked ? trade.likes - 1 : trade.likes + 1
          }
        : trade
    ));
  };

  const filteredTraders = traders.filter(trader =>
    trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trader.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted/30 rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                Rede Social de Trading
              </h1>
              <p className="text-muted-foreground">Siga traders experientes e copie suas estratégias</p>
            </div>
          </div>

          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">Feed de Trades</TabsTrigger>
              <TabsTrigger value="traders">Top Traders</TabsTrigger>
              <TabsTrigger value="portfolio">Meu Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4">
              <div className="space-y-4">
                {trades.map((trade) => (
                  <Card key={trade.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={trade.traderAvatar} />
                            <AvatarFallback>{trade.traderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{trade.traderName}</div>
                            <div className="text-sm text-muted-foreground">
                              {trade.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Ativo</div>
                          <div className="font-medium">{trade.asset}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Ação</div>
                          <Badge variant={trade.action === 'buy' ? 'default' : 'destructive'}>
                            {trade.action === 'buy' ? 'Compra' : 'Venda'}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Preço</div>
                          <div className="font-medium">${trade.price.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Resultado</div>
                          <div className={`font-medium ${trade.profit && trade.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.profit ? `${trade.profit > 0 ? '+' : ''}$${trade.profit}` : 'Em andamento'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleLike(trade.id)}
                          className={trade.isLiked ? "text-red-500" : ""}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${trade.isLiked ? 'fill-current' : ''}`} />
                          {trade.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {trade.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="traders" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar traders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTraders.map((trader) => (
                  <Card key={trader.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={trader.avatar} />
                            <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{trader.name}</div>
                              {trader.verified && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {trader.followers.toLocaleString()} seguidores
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant={trader.isFollowing ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleFollow(trader.id)}
                        >
                          {trader.isFollowing ? 'Seguindo' : 'Seguir'}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-500">
                            {trader.winRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">Taxa de Acerto</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-500">
                            +{trader.totalReturn}%
                          </div>
                          <div className="text-xs text-muted-foreground">Retorno Total</div>
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {trader.specialty}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">Especialidade</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meu Portfolio de Copy Trading</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Portfolio vazio</p>
                    <p className="text-sm">Comece seguindo traders e copiando suas estratégias!</p>
                    <Button className="mt-4">
                      Explorar Traders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <FloatingNavbar />
    </div>
  );
}