import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Zap, Star, Crown, Gem, ArrowRight, Palette } from "lucide-react";

// Import skin images
import neonMatrixOverlay from "@/assets/skins/neon-matrix-overlay.jpg";
import chromeNeuralInterface from "@/assets/skins/chrome-neural-interface.jpg";
import quantumFluxField from "@/assets/skins/quantum-flux-field.jpg";
import digitalGhostMode from "@/assets/skins/digital-ghost-mode.jpg";
import plasmaEnergyCoating from "@/assets/skins/plasma-energy-coating.jpg";
import voidDarkMatter from "@/assets/skins/void-dark-matter.jpg";
import holographicRainbow from "@/assets/skins/holographic-rainbow.jpg";
import crystalNanoArmor from "@/assets/skins/crystal-nano-armor.jpg";
import binaryCodeStream from "@/assets/skins/binary-code-stream.jpg";
import electricStormAura from "@/assets/skins/electric-storm-aura.jpg";
import cyberPhoenixFlames from "@/assets/skins/cyber-phoenix-flames.jpg";
import neuralNetworkWeb from "@/assets/skins/neural-network-web.jpg";
import quantumEntanglement from "@/assets/skins/quantum-entanglement.jpg";
import viralCodeInfection from "@/assets/skins/viral-code-infection.jpg";
import diamondDataCore from "@/assets/skins/diamond-data-core.jpg";
import timeDistortionField from "@/assets/skins/time-distortion-field.jpg";
import shadowStealthMode from "@/assets/skins/shadow-stealth-mode.jpg";
import cosmicNebulaDrift from "@/assets/skins/cosmic-nebula-drift.jpg";
import corruptedRealityGlitch from "@/assets/skins/corrupted-reality-glitch.jpg";

interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rarity: string;
  level_required: number;
  effects: any;
}

interface UserProfile {
  id: string;
  level: number;
  points: number;
  xp: number;
}

const skinImages = {
  'Neon Matrix Overlay': neonMatrixOverlay,
  'Chrome Neural Interface': chromeNeuralInterface,
  'Quantum Flux Field': quantumFluxField,
  'Digital Ghost Mode': digitalGhostMode,
  'Plasma Energy Coating': plasmaEnergyCoating,
  'Void Dark Matter': voidDarkMatter,
  'Holographic Rainbow': holographicRainbow,
  'Crystal Nano Armor': crystalNanoArmor,
  'Binary Code Stream': binaryCodeStream,
  'Electric Storm Aura': electricStormAura,
  'Cyber Phoenix Flames': cyberPhoenixFlames,
  'Neural Network Web': neuralNetworkWeb,
  'Quantum Entanglement': quantumEntanglement,
  'Viral Code Infection': viralCodeInfection,
  'Diamond Data Core': diamondDataCore,
  'Time Distortion Field': timeDistortionField,
  'Shadow Stealth Mode': shadowStealthMode,
  'Cosmic Nebula Drift': cosmicNebulaDrift,
  'Corrupted Reality Glitch': corruptedRealityGlitch,
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const rarityIcons = {
  common: Star,
  uncommon: Sparkles,
  rare: Gem,
  epic: Crown,
  legendary: Zap,
};

// Mock expanded skin data
const expandedSkinData = {
  'Neon Matrix Overlay': {
    backstory: 'Desenvolvido nos laboratórios subterrâneos de Satoshi City, esta skin permite ao usuário visualizar o fluxo de dados em tempo real como uma cascata de código verde Matrix.',
    technicalSpecs: 'Processamento: 15 THz | Latência: 0.01ms | Compatibilidade: Universal',
    unlockMethod: 'Completar 100 análises de mercado consecutivas',
  },
  'Chrome Neural Interface': {
    backstory: 'Interface neural cromada que conecta diretamente aos principais exchanges mundiais. Cada reflexo metálico representa uma conexão de dados ativa.',
    technicalSpecs: 'Processamento: 25 THz | Latência: 0.005ms | Compatibilidade: Neural',
    unlockMethod: 'Alcançar 95% de precisão em trading',
  },
  'Quantum Flux Field': {
    backstory: 'Campo de energia quântica que permite operar em múltiplas realidades financeiras simultaneamente. As partículas roxas representam probabilidades de mercado.',
    technicalSpecs: 'Processamento: Quântico | Latência: Instantânea | Compatibilidade: Quantum',
    unlockMethod: 'Completar missão "Paradoxo Temporal"',
  }
};

export default function SkinDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [skin, setSkin] = useState<Skin | null>(null);
  const [allSkins, setAllSkins] = useState<Skin[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Mock skins data since they're not in database yet
  const mockSkins: Skin[] = [
    {
      id: 'skin-1',
      name: 'Neon Matrix Overlay',
      description: 'Sobreposição holográfica de código verde Matrix pulsante',
      price: 2500,
      category: 'skin',
      rarity: 'rare',
      level_required: 10,
      effects: { type: 'visual', glow: true }
    },
    {
      id: 'skin-2',
      name: 'Chrome Neural Interface',
      description: 'Interface neural cromada com circuitos luminosos azuis',
      price: 3200,
      category: 'skin',
      rarity: 'epic',
      level_required: 15,
      effects: { type: 'visual', metallic: true }
    },
    {
      id: 'skin-3',
      name: 'Quantum Flux Field',
      description: 'Campo de energia quântica com partículas roxas e azuis',
      price: 4500,
      category: 'skin',
      rarity: 'legendary',
      level_required: 20,
      effects: { type: 'visual', particles: true }
    },
    // Add more mock skins...
  ];

  useEffect(() => {
    if (id) {
      loadSkinData();
    }
  }, [id]);

  const loadSkinData = async () => {
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

      // Use mock data for now
      setAllSkins(mockSkins);
      const currentSkin = mockSkins.find(s => s.id === id);
      if (currentSkin) {
        setSkin(currentSkin);
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
      console.error('Error loading skin data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da skin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseSkin = async () => {
    if (!skin || !userProfile || purchasing) return;

    if (userProfile.points < skin.price) {
      toast({
        title: "Beetz Insuficientes",
        description: "Você não tem Beetz suficientes para comprar esta skin",
        variant: "destructive"
      });
      return;
    }

    setPurchasing(true);
    try {
      // Mock purchase for now
      toast({
        title: "🎨 Skin Comprada!",
        description: `${skin.name} foi adicionada à sua coleção!`,
      });
      
      setUserProfile(prev => prev ? { ...prev, points: prev.points - skin.price } : null);
      setUserProducts(prev => [...prev, skin.id]);
    } catch (error) {
      console.error('Error purchasing skin:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível comprar a skin",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getSkinImage = (skinName: string) => {
    return skinImages[skinName as keyof typeof skinImages] || '/placeholder.svg';
  };

  const getCurrentSkinIndex = () => {
    return allSkins.findIndex(s => s.id === id);
  };

  const navigateToSkin = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentSkinIndex();
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allSkins.length - 1;
    } else {
      newIndex = currentIndex < allSkins.length - 1 ? currentIndex + 1 : 0;
    }
    
    navigate(`/skin/${allSkins[newIndex].id}`);
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

  if (!skin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent">
        <FloatingNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Skin não encontrada</CardTitle>
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

  const RarityIcon = rarityIcons[skin.rarity as keyof typeof rarityIcons];
  const isOwned = userProducts.includes(skin.id);
  const canAfford = userProfile ? userProfile.points >= skin.price : false;
  const meetsLevel = userProfile ? userProfile.level >= skin.level_required : false;
  const expandedData = expandedSkinData[skin.name as keyof typeof expandedSkinData];

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
              onClick={() => navigateToSkin('prev')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToSkin('next')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Skin Display */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="relative">
                {/* Skin Image */}
                <div className="aspect-square bg-gradient-to-b from-muted to-card rounded-2xl p-8 mb-6 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[skin.rarity as keyof typeof rarityColors]} opacity-10`} />
                  <img 
                    src={getSkinImage(skin.name)}
                    alt={skin.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`bg-gradient-to-r ${rarityColors[skin.rarity as keyof typeof rarityColors]} text-white`}>
                      <RarityIcon className="mr-1 h-3 w-3" />
                      {skin.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Level Required */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary">
                      Nível {skin.level_required}
                    </Badge>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-500 text-white">
                      <Palette className="mr-1 h-3 w-3" />
                      SKIN
                    </Badge>
                  </div>
                </div>

                {/* Purchase Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{skin.price} Beetz</span>
                    {isOwned && (
                      <Badge className="bg-green-500 text-white">
                        ✓ Possui
                      </Badge>
                    )}
                  </div>
                  
                  {!isOwned && (
                    <Button 
                      onClick={purchaseSkin}
                      disabled={purchasing || !canAfford || !meetsLevel}
                      className="w-full"
                      size="lg"
                    >
                      {purchasing ? "Comprando..." : 
                       !meetsLevel ? `Requer Nível ${skin.level_required}` :
                       !canAfford ? "Beetz Insuficientes" : 
                       "Comprar Skin"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skin Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Palette className="h-6 w-6 text-primary" />
                  {skin.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{skin.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Tipo:</span>
                    <p className="text-muted-foreground">Skin Visual</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Raridade:</span>
                    <p className="text-muted-foreground capitalize">{skin.rarity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backstory */}
            {expandedData?.backstory && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    História
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

            {/* Visual Effects */}
            {skin.effects && Object.keys(skin.effects).length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Efeitos Visuais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(skin.effects).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unlock Method */}
            {expandedData?.unlockMethod && (
              <Card className="bg-card/50 backdrop-blur-sm border-dashed border-amber-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-400">
                    <Crown className="h-5 w-5" />
                    Como Desbloquear
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{expandedData.unlockMethod}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}