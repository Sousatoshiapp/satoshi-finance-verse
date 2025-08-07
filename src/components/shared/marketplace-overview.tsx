import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  ArrowUpDown,
  Star,
  Package,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface MarketItem {
  id: string;
  name: string;
  type: 'power_up' | 'avatar' | 'badge' | 'booster';
  description: string;
  icon: string;
  current_price: number;
  original_price: number;
  price_change_24h: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  seller: {
    id: string;
    name: string;
  };
  quantity: number;
  demand: 'high' | 'medium' | 'low';
}

export function MarketplaceOverview() {
  const navigate = useNavigate();
  const [hotItems, setHotItems] = useState<MarketItem[]>([]);
  const [userListings, setUserListings] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      // Mock market data - in real app would come from database
      const mockHotItems: MarketItem[] = [
        {
          id: '1',
          name: 'Neural XP Booster',
          type: 'booster',
          description: 'Duplica XP por 2 horas',
          icon: '🧠',
          current_price: 850,
          original_price: 1000,
          price_change_24h: -15,
          rarity: 'epic',
          seller: { id: 'user1', name: 'CryptoMaster' },
          quantity: 3,
          demand: 'high'
        },
        {
          id: '2',
          name: 'Quantum Time Warp',
          type: 'power_up',
          description: '+30 segundos em todos os quizzes',
          icon: '⏰',
          current_price: 1200,
          original_price: 1000,
          price_change_24h: 20,
          rarity: 'legendary',
          seller: { id: 'user2', name: 'TimeKeeper' },
          quantity: 1,
          demand: 'high'
        },
        {
          id: '3',
          name: 'Holographic Avatar Skin',
          type: 'avatar',
          description: 'Efeito holográfico exclusivo',
          icon: '✨',
          current_price: 2500,
          original_price: 2200,
          price_change_24h: 13.6,
          rarity: 'legendary',
          seller: { id: 'user3', name: 'StyleGuru' },
          quantity: 1,
          demand: 'medium'
        },
        {
          id: '4',
          name: 'Elite Trader Badge',
          type: 'badge',
          description: 'Badge de prestígio para traders elite',
          icon: '🏆',
          current_price: 450,
          original_price: 500,
          price_change_24h: -10,
          rarity: 'rare',
          seller: { id: 'user4', name: 'BadgeCollector' },
          quantity: 2,
          demand: 'low'
        }
      ];

      const mockUserListings: MarketItem[] = [
        {
          id: '5',
          name: 'Basic Streak Shield',
          type: 'power_up',
          description: 'Protege streak por 1 dia',
          icon: '🛡️',
          current_price: 300,
          original_price: 350,
          price_change_24h: -14.3,
          rarity: 'common',
          seller: { id: 'current_user', name: 'Você' },
          quantity: 2,
          demand: 'medium'
        }
      ];

      setHotItems(mockHotItems);
      setUserListings(mockUserListings);
      setTotalValue(mockUserListings.reduce((sum, item) => sum + (item.current_price * item.quantity), 0));
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 border-yellow-500/30';
      case 'epic': return 'text-purple-500 border-purple-500/30';
      case 'rare': return 'text-blue-500 border-blue-500/30';
      default: return 'text-gray-500 border-gray-500/30';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getDemandText = (demand: string) => {
    switch (demand) {
      case 'high': return 'Alta Demanda';
      case 'medium': return 'Demanda Média';
      case 'low': return 'Baixa Demanda';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Marketplace
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
    <Card className="border-orange-500/20 bg-gradient-to-br from-background to-orange-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            Marketplace
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/marketplace')}
            className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10"
          >
            Ver Tudo
          </Button>
        </div>
        
        {/* User Portfolio Value */}
        {userListings.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Seus Itens no Mercado</span>
              </div>
              <div className="text-sm font-bold text-orange-500 flex items-center gap-1">
                {totalValue.toLocaleString()} <BeetzIcon size="xs" />
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hot Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">🔥 Itens em Alta</h3>
          
          <div className="space-y-2">
            {hotItems.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                className="border rounded-lg p-3 hover:border-orange-500/30 transition-all cursor-pointer"
                onClick={() => navigate(`/marketplace/item/${item.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <Badge variant="outline" className={cn("text-xs", getRarityColor(item.rarity))}>
                        {item.rarity}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", getDemandColor(item.demand))}>
                        {getDemandText(item.demand)}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm flex items-center gap-1">
                          {item.current_price.toLocaleString()} <BeetzIcon size="xs" />
                        </div>
                        <div className={cn("flex items-center gap-1 text-xs", 
                          item.price_change_24h > 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {item.price_change_24h > 0 ? 
                            <TrendingUp className="h-3 w-3" /> : 
                            <TrendingDown className="h-3 w-3" />
                          }
                          {Math.abs(item.price_change_24h)}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Por {item.seller.name}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
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
            onClick={() => navigate('/marketplace/sell')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Vender Item
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/marketplace/browse')}
          >
            <Star className="h-4 w-4 mr-2" />
            Explorar
          </Button>
        </div>
        
        {hotItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Marketplace temporariamente vazio</p>
            <p className="text-sm">Novos itens aparecerão em breve!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
