import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Zap, Clock, TrendingUp, Shield, Brain, ArrowRight, Rocket } from "lucide-react";

// Import boost images
import xpMultiplier from "@/assets/boosts/xp-multiplier.jpg";
import cryptoBooster from "@/assets/boosts/crypto-booster.jpg";
import timeWarp from "@/assets/boosts/time-warp.jpg";
import neuralXpBooster from "@/assets/boosts/neural-xp-booster.jpg";
import quantumEnergyDrink from "@/assets/boosts/quantum-energy-drink.jpg";
import megaPointsAmplifier from "@/assets/boosts/mega-points-amplifier.jpg";
import streakShield from "@/assets/boosts/streak-shield.jpg";
import wisdomElixir from "@/assets/boosts/wisdom-elixir.jpg";

interface Boost {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rarity: string;
  level_required: number;
  effects: any;
  duration_hours?: number;
}

interface UserProfile {
  id: string;
  level: number;
  points: number;
  xp: number;
}

const boostImages = {
  'XP Multiplier Chip': xpMultiplier,
  'Crypto Mining Booster': cryptoBooster,
  'Time Warp Device': timeWarp,
  'Mega XP': neuralXpBooster,
  'Energia Infinita': quantumEnergyDrink,
  'Chuva de Pontos': megaPointsAmplifier,
  'Escudo Anti-Streak': streakShield,
  'Poção de Sabedoria': wisdomElixir,
  'Neural Focus Enhancer': neuralXpBooster,
  'Quantum Memory Bank': megaPointsAmplifier,
  'Cyber Streak Protector': streakShield,
  'Digital Wisdom Serum': wisdomElixir,
  'Energy Core Reactor': quantumEnergyDrink,
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const boostIcons = {
  xp: TrendingUp,
  energy: Zap,
  protection: Shield,
  wisdom: Brain,
  time: Clock,
  default: Rocket,
};

// Mock expanded boost data
const expandedBoostData = {
  'XP Multiplier Chip': {
    backstory: 'Chip neural desenvolvido pela CyberCorp que amplifica a capacidade de aprendizado do usuário. Implantado diretamente no córtex cerebral, multiplica a absorção de conhecimento.',
    technicalSpecs: 'Multiplicador: 2x XP | Duração: 24h | Compatibilidade: Neural',
    sideEffects: 'Pode causar leve tontura e aumento do apetite por dados',
    researchNotes: 'Desenvolvido usando tecnologia alienígena recuperada em 2157',
  },
  'Crypto Mining Booster': {
    backstory: 'Acelerador quântico que otimiza algoritmos de mineração cryptocurrency. Utiliza computação quântica para resolver blocks em velocidade impossível.',
    technicalSpecs: 'Hash Rate: +500% | Eficiência: 99.9% | Consumo: -80%',
    sideEffects: 'Pode gerar interferência eletromagnética em radius de 50m',
    researchNotes: 'Baseado em descobertas do Laboratório Quântico de Satoshi',
  },
  'Time Warp Device': {
    backstory: 'Dispositivo experimental que manipula a percepção temporal do usuário. Permite experienciar mais tempo durante períodos de estudo intensivo.',
    technicalSpecs: 'Dilatação Temporal: 3:1 | Duração: 12h | Energia: Quantum',
    sideEffects: 'Envelhecimento acelerado por 0.001% durante uso',
    researchNotes: 'CUIDADO: Não usar mais de 1x por semana',
  }
};

export default function BoostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [boost, setBoost] = useState<Boost | null>(null);
  const [allBoosts, setAllBoosts] = useState<Boost[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      loadBoostData();
    }
  }, [id]);

  const loadBoostData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load user profile
      let profile = null;
      if (user) {
        const { data: supabaseProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        profile = supabaseProfile;
      }

      if (!profile) {
        const userData = localStorage.getItem('satoshi_user');
        if (userData) {
          const localUser = JSON.parse(userData);
          profile = {
            id: 'local-user',
            level: localUser.level || 1,
            points: localUser.coins || 0,
            xp: localUser.xp || 0,
          };
        }
      }

      if (profile) {
        setUserProfile(profile);
      }

      // Load products from database
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'boost')
        .eq('is_available', true)
        .order('price');

      if (productsData) {
        setAllBoosts(productsData);
        const currentBoost = productsData.find(b => b.id === id);
        if (currentBoost) {
          setBoost(currentBoost);
        }
      }

      // Load user's owned products
      if (profile) {
        const { data: ownedProducts } = await supabase
          .from('user_products')
          .select('product_id')
          .eq('user_id', profile.id);

        if (ownedProducts) {
          setUserProducts(ownedProducts.map(item => item.product_id));
        }
      }
    } catch (error) {
      console.error('Error loading boost data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do boost",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseBoost = async () => {
    if (!boost || !userProfile || purchasing) return;

    if (userProfile.points < boost.price) {
      toast({
        title: "Beetz Insuficientes",
        description: "Você não tem Beetz suficientes para comprar este boost",
        variant: "destructive"
      });
      return;
    }

    setPurchasing(true);
    try {
      // Mock purchase for now
      toast({
        title: "⚡ Boost Comprado!",
        description: `${boost.name} foi adicionado ao seu inventário!`,
      });
      
      setUserProfile(prev => prev ? { ...prev, points: prev.points - boost.price } : null);
      setUserProducts(prev => [...prev, boost.id]);
    } catch (error) {
      console.error('Error purchasing boost:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível comprar o boost",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getBoostImage = (boostName: string) => {
    return boostImages[boostName as keyof typeof boostImages] || '/placeholder.svg';
  };

  const getBoostIcon = (boostName: string) => {
    if (boostName.toLowerCase().includes('xp')) return boostIcons.xp;
    if (boostName.toLowerCase().includes('energia')) return boostIcons.energy;
    if (boostName.toLowerCase().includes('shield') || boostName.toLowerCase().includes('protector')) return boostIcons.protection;
    if (boostName.toLowerCase().includes('wisdom') || boostName.toLowerCase().includes('sabedoria')) return boostIcons.wisdom;
    if (boostName.toLowerCase().includes('time') || boostName.toLowerCase().includes('warp')) return boostIcons.time;
    return boostIcons.default;
  };

  const getCurrentBoostIndex = () => {
    return allBoosts.findIndex(b => b.id === id);
  };

  const navigateToBoost = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentBoostIndex();
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allBoosts.length - 1;
    } else {
      newIndex = currentIndex < allBoosts.length - 1 ? currentIndex + 1 : 0;
    }
    
    navigate(`/boost/${allBoosts[newIndex].id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent">
        <FloatingNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!boost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent">
        <FloatingNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Boost não encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/store')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Loja
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const IconComponent = getBoostIcon(boost.name);
  const isOwned = userProducts.includes(boost.id);
  const canAfford = userProfile ? userProfile.points >= boost.price : false;
  const meetsLevel = userProfile ? userProfile.level >= boost.level_required : false;
  const expandedData = expandedBoostData[boost.name as keyof typeof expandedBoostData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent">
      <FloatingNavbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/store')}
            className="bg-card/50 backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Loja
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToBoost('prev')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToBoost('next')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Boost Display */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="relative">
                {/* Boost Image */}
                <div className="aspect-square bg-gradient-to-b from-muted to-card rounded-2xl p-8 mb-6 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[boost.rarity as keyof typeof rarityColors]} opacity-10`} />
                  <img 
                    src={getBoostImage(boost.name)}
                    alt={boost.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`bg-gradient-to-r ${rarityColors[boost.rarity as keyof typeof rarityColors]} text-white`}>
                      <IconComponent className="mr-1 h-3 w-3" />
                      {boost.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Duration */}
                  {boost.duration_hours && (
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        {boost.duration_hours}h
                      </Badge>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500 text-white">
                      <Rocket className="mr-1 h-3 w-3" />
                      BOOST
                    </Badge>
                  </div>
                </div>

                {/* Purchase Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{boost.price} Beetz</span>
                    {isOwned && (
                      <Badge className="bg-green-500 text-white">
                        ✓ Possui
                      </Badge>
                    )}
                  </div>
                  
                  {!isOwned && (
                    <Button 
                      onClick={purchaseBoost}
                      disabled={purchasing || !canAfford || !meetsLevel}
                      className="w-full"
                      size="lg"
                    >
                      {purchasing ? "Comprando..." : 
                       !meetsLevel ? `Requer Nível ${boost.level_required}` :
                       !canAfford ? "Beetz Insuficientes" : 
                       "Comprar Boost"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boost Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                  {boost.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{boost.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Tipo:</span>
                    <p className="text-muted-foreground">Boost Temporário</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Duração:</span>
                    <p className="text-muted-foreground">{boost.duration_hours ? `${boost.duration_hours} horas` : 'Instantâneo'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backstory */}
            {expandedData?.backstory && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Descrição Científica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{expandedData.backstory}</p>
                </CardContent>
              </Card>
            )}

            {/* Technical Specs */}
            {expandedData?.technicalSpecs && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Especificações Técnicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{expandedData.technicalSpecs}</p>
                </CardContent>
              </Card>
            )}

            {/* Effects */}
            {boost.effects && Object.keys(boost.effects).length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Efeitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(boost.effects).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-sm font-medium text-green-400">+{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Side Effects Warning */}
            {expandedData?.sideEffects && (
              <Card className="bg-card/50 backdrop-blur-sm border-amber-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-400">
                    <Shield className="h-5 w-5" />
                    Efeitos Colaterais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-300/80">{expandedData.sideEffects}</p>
                </CardContent>
              </Card>
            )}

            {/* Research Notes */}
            {expandedData?.researchNotes && (
              <Card className="bg-card/50 backdrop-blur-sm border-dashed border-red-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Brain className="h-5 w-5" />
                    Notas de Pesquisa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-300/80">{expandedData.researchNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}