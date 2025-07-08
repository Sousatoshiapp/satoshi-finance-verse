import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Star, ArrowLeft, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface LootBox {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  contents: string[];
  animation_url?: string;
  available: boolean;
  minItems: number;
  maxItems: number;
}

interface Prize {
  id: string;
  name: string;
  type: 'xp' | 'beetz' | 'avatar' | 'boost' | 'skin' | 'badge';
  value: number;
  rarity: string;
  description: string;
}

export default function LootBoxes() {
  const navigate = useNavigate();
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingBox, setOpeningBox] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [showPrizes, setShowPrizes] = useState(false);

  useEffect(() => {
    loadLootBoxes();
  }, []);

  const loadLootBoxes = async () => {
    try {
      // Mock data - replace with actual API call
      const mockBoxes: LootBox[] = [
        {
          id: '1',
          name: 'Caixa Cyberpunk Básica',
          description: 'Recompensas básicas para iniciantes',
          rarity: 'common',
          cost: 500,
          contents: ['50-100 XP', '100-200 Beetz', 'Boost 1h'],
          available: true,
          minItems: 2,
          maxItems: 3
        },
        {
          id: '2',
          name: 'Caixa Neural Rara',
          description: 'Itens raros para traders avançados',
          rarity: 'rare',
          cost: 1200,
          contents: ['200-500 XP', '500-1000 Beetz', 'Avatar Cosmético', 'Boost 3h'],
          available: true,
          minItems: 3,
          maxItems: 4
        },
        {
          id: '3',
          name: 'Caixa Quântica Épica',
          description: 'Tesouros épicos da cidade digital',
          rarity: 'epic',
          cost: 2500,
          contents: ['1000-2000 XP', '2000-5000 Beetz', 'Avatar Raro', 'Skin Exclusiva'],
          available: true,
          minItems: 4,
          maxItems: 5
        },
        {
          id: '4',
          name: 'Caixa do Satoshi Lendária',
          description: 'A mais rara das recompensas!',
          rarity: 'legendary',
          cost: 5000,
          contents: ['5000+ XP', '10000+ Beetz', 'Avatar Lendário', 'Badge Exclusivo'],
          available: false,
          minItems: 5,
          maxItems: 6
        }
      ];

      setLootBoxes(mockBoxes);
    } catch (error) {
      console.error('Error loading loot boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLootBox = async (boxId: string) => {
    setOpeningBox(boxId);
    
    // Simulate opening animation
    setTimeout(() => {
      // Generate random prizes
      const mockPrizes: Prize[] = [
        {
          id: '1',
          name: '750 XP',
          type: 'xp',
          value: 750,
          rarity: 'rare',
          description: 'Experiência valiosa para subir de nível'
        },
        {
          id: '2',
          name: '1500 Beetz',
          type: 'beetz',
          value: 1500,
          rarity: 'epic',
          description: 'Moeda digital premium'
        },
        {
          id: '3',
          name: 'Avatar Cyber Ninja',
          type: 'avatar',
          value: 1,
          rarity: 'epic',
          description: 'Avatar exclusivo com habilidades especiais'
        }
      ];
      
      setPrizes(mockPrizes);
      setShowPrizes(true);
      setOpeningBox(null);
    }, 3000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
      case 'rare': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'epic': return 'text-purple-500 border-purple-500/30 bg-purple-500/10';
      case 'legendary': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-muted-foreground';
    }
  };

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'xp': return '⚡';
      case 'beetz': return '🥕';
      case 'avatar': return '🤖';
      case 'boost': return '🚀';
      case 'skin': return '🎨';
      case 'badge': return '🏆';
      default: return '🎁';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showPrizes) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          {/* Prize Reveal */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-3xl font-bold mb-2">Parabéns!</h1>
            <p className="text-muted-foreground">Você ganhou itens incríveis!</p>
          </div>

          {/* Prizes */}
          <div className="space-y-4 mb-8">
            {prizes.map((prize, index) => (
              <Card 
                key={prize.id}
                className={cn(
                  "border-2 transition-all duration-500 hover:scale-105",
                  getRarityColor(prize.rarity),
                  `animate-fade-in`
                )}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{getPrizeIcon(prize.type)}</div>
                  <h3 className="text-xl font-bold mb-2">{prize.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{prize.description}</p>
                  <Badge className={getRarityColor(prize.rarity)}>
                    {prize.rarity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowPrizes(false)}
              className="flex-1"
            >
              Abrir Outra Caixa
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
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
              <h1 className="text-2xl font-bold">Loot Boxes</h1>
              <p className="text-muted-foreground">Abra caixas e descubra recompensas incríveis</p>
            </div>
          </div>

          {/* Opening Animation */}
          {openingBox && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-spin">🎁</div>
                <h2 className="text-2xl font-bold text-white mb-2">Abrindo Loot Box...</h2>
                <p className="text-white/70">Prepare-se para suas recompensas!</p>
                <div className="mt-6">
                  <Sparkles className="h-8 w-8 text-yellow-400 mx-auto animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Loot Boxes Grid */}
          <div className="space-y-4">
            {lootBoxes.map((box) => (
              <Card 
                key={box.id}
                className={cn(
                  "border-2 transition-all duration-200 hover:shadow-lg",
                  getRarityColor(box.rarity),
                  !box.available && "opacity-60"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-3xl">
                        🎁
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{box.name}</CardTitle>
                          <Badge className={getRarityColor(box.rarity)}>
                            {box.rarity}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {box.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{box.minItems}-{box.maxItems} itens</span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-500">
                            🥕 {box.cost} Beetz
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Contents Preview */}
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Possíveis Recompensas:</div>
                    <div className="flex flex-wrap gap-2">
                      {box.contents.map((content, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {content}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => openLootBox(box.id)}
                    disabled={!box.available || openingBox !== null}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {!box.available ? 'Indisponível' : 
                     openingBox === box.id ? 'Abrindo...' : 
                     `Abrir por ${box.cost} Beetz`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="mt-8 border-blue-500/20 bg-gradient-to-br from-background to-blue-500/5">
            <CardContent className="p-6 text-center">
              <Gift className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Como Funcionam as Loot Boxes?</h3>
              <p className="text-muted-foreground mb-4">
                Cada caixa contém uma seleção aleatória de itens valiosos. 
                Quanto mais rara a caixa, melhores as recompensas!
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Ganhe Beetz:</div>
                  <div className="text-muted-foreground">Complete missões e quizzes</div>
                </div>
                <div>
                  <div className="font-medium">Raridade:</div>
                  <div className="text-muted-foreground">Maior raridade = Melhores prêmios</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}