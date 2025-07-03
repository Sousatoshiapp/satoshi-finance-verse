import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'avatar' | 'boost' | 'cosmetic';
  owned?: boolean;
}

export default function Store() {
  const [userCoins, setUserCoins] = useState(100);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserCoins(user.coins || 100);
      setPurchasedItems(user.purchasedItems || []);
    }
  }, []);

  const storeItems: StoreItem[] = [
    // Avatares
    { id: 'avatar_crown', name: 'Coroa Dourada', description: 'Avatar exclusivo de rei das finanças', price: 50, icon: '👑', category: 'avatar' },
    { id: 'avatar_diamond', name: 'Diamante Brilhante', description: 'Para investidores de elite', price: 75, icon: '💎', category: 'avatar' },
    { id: 'avatar_rocket', name: 'Foguete Espacial', description: 'Seus investimentos vão à lua!', price: 60, icon: '🚀', category: 'avatar' },
    
    // Boosts
    { id: 'boost_2x_xp', name: 'XP em Dobro', description: 'Duplica XP por 24 horas', price: 30, icon: '⚡', category: 'boost' },
    { id: 'boost_streak', name: 'Protetor de Sequência', description: 'Protege sua sequência por 3 dias', price: 40, icon: '🛡️', category: 'boost' },
    { id: 'boost_coins', name: 'Chuva de Moedas', description: '+50 moedas instantâneas', price: 20, icon: '🌧️', category: 'boost' },
    
    // Cosméticos
    { id: 'theme_golden', name: 'Tema Dourado', description: 'Interface dourada premium', price: 80, icon: '✨', category: 'cosmetic' },
    { id: 'theme_neon', name: 'Tema Neon', description: 'Cores vibrantes e modernas', price: 65, icon: '🌈', category: 'cosmetic' },
    { id: 'animation_pack', name: 'Pack de Animações', description: 'Animações exclusivas', price: 45, icon: '🎭', category: 'cosmetic' }
  ];

  const categories = [
    { id: 'avatar', name: 'Avatares', icon: '👤' },
    { id: 'boost', name: 'Impulsos', icon: '⚡' },
    { id: 'cosmetic', name: 'Cosméticos', icon: '🎨' }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('avatar');

  const handlePurchase = (item: StoreItem) => {
    if (userCoins >= item.price && !purchasedItems.includes(item.id)) {
      const newCoins = userCoins - item.price;
      const newPurchased = [...purchasedItems, item.id];
      
      setUserCoins(newCoins);
      setPurchasedItems(newPurchased);
      
      // Atualizar localStorage
      const userData = localStorage.getItem('satoshi_user');
      if (userData) {
        const user = JSON.parse(userData);
        user.coins = newCoins;
        user.purchasedItems = newPurchased;
        localStorage.setItem('satoshi_user', JSON.stringify(user));
      }
      
      toast({
        title: "Compra realizada! 🎉",
        description: `Você adquiriu: ${item.name}`,
      });
    } else if (userCoins < item.price) {
      toast({
        title: "Moedas insuficientes 😅",
        description: "Complete mais lições para ganhar moedas!",
        variant: "destructive"
      });
    }
  };

  const filteredItems = storeItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← Dashboard
              </Button>
              <h1 className="text-xl font-bold text-foreground">Loja Satoshi</h1>
            </div>
            
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
              <span className="text-lg">🪙</span>
              <span className="font-bold text-primary">{userCoins}</span>
              <span className="text-sm text-muted-foreground">moedas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Store Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isOwned = purchasedItems.includes(item.id);
            const canAfford = userCoins >= item.price;
            
            return (
              <Card key={item.id} className={`p-6 transition-all hover-lift ${
                isOwned ? 'border-primary bg-primary/5' : ''
              }`}>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-foreground">{item.price}</span>
                  </div>
                  
                  {isOwned && (
                    <Badge className="bg-primary">
                      ✓ Adquirido
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={isOwned || !canAfford}
                  className="w-full"
                  variant={isOwned ? 'outline' : 'default'}
                >
                  {isOwned ? 'Já possui' : !canAfford ? 'Moedas insuficientes' : 'Comprar'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Earn More Coins */}
        <Card className="p-6 mt-8 text-center">
          <h3 className="font-bold text-foreground mb-4">Precisa de mais moedas? 🪙</h3>
          <p className="text-muted-foreground mb-4">
            Complete lições e quiz para ganhar moedas Satoshi!
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/dashboard')}>
              Ver Lições
            </Button>
            <Button variant="outline" onClick={() => navigate('/quiz')}>
              Fazer Quiz
            </Button>
          </div>
        </Card>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}