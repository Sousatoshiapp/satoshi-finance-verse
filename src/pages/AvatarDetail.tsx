import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, Star, Gem, Zap, Shield, User, BookOpen, TrendingUp, ArrowRight } from "lucide-react";

// Import all avatar images
import neoTrader from "@/assets/avatars/neo-trader.jpg";
import cryptoAnalyst from "@/assets/avatars/crypto-analyst.jpg";
import financeHacker from "@/assets/avatars/finance-hacker.jpg";
import investmentScholar from "@/assets/avatars/investment-scholar.jpg";
import quantumBroker from "@/assets/avatars/quantum-broker.jpg";
import defiSamurai from "@/assets/avatars/defi-samurai.jpg";
import theSatoshi from "@/assets/avatars/the-satoshi.jpg";
import neuralArchitect from "@/assets/avatars/neural-architect.jpg";
import dataMiner from "@/assets/avatars/data-miner.jpg";
import blockchainGuardian from "@/assets/avatars/blockchain-guardian.jpg";
import quantumPhysician from "@/assets/avatars/quantum-physician.jpg";
import virtualRealtor from "@/assets/avatars/virtual-realtor.jpg";
import codeAssassin from "@/assets/avatars/code-assassin.jpg";
import cryptoShaman from "@/assets/avatars/crypto-shaman.jpg";
import marketProphet from "@/assets/avatars/market-prophet.jpg";
import digitalNomad from "@/assets/avatars/digital-nomad.jpg";
import neonDetective from "@/assets/avatars/neon-detective.jpg";
import hologramDancer from "@/assets/avatars/hologram-dancer.jpg";
import cyberMechanic from "@/assets/avatars/cyber-mechanic.jpg";
import ghostTrader from "@/assets/avatars/ghost-trader.jpg";
import binaryMonk from "@/assets/avatars/binary-monk.jpg";
import pixelArtist from "@/assets/avatars/pixel-artist.jpg";
import quantumThief from "@/assets/avatars/quantum-thief.jpg";
import memoryKeeper from "@/assets/avatars/memory-keeper.jpg";
import stormHacker from "@/assets/avatars/storm-hacker.jpg";
import dreamArchitect from "@/assets/avatars/dream-architect.jpg";
import chromeGladiator from "@/assets/avatars/chrome-gladiator.jpg";

interface Avatar {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rarity: string;
  level_required: number;
  is_available: boolean;
  backstory?: string;
  avatar_class?: string;
  district_theme?: string;
  bonus_effects?: any;
}

interface UserProfile {
  id: string;
  level: number;
  points: number;
  xp: number;
}

const avatarImages = {
  'Neo Trader': neoTrader,
  'Crypto Analyst': cryptoAnalyst,
  'Finance Hacker': financeHacker,
  'Investment Scholar': investmentScholar,
  'Quantum Broker': quantumBroker,
  'DeFi Samurai': defiSamurai,
  'The Satoshi': theSatoshi,
  'Neural Architect': neuralArchitect,
  'Data Miner': dataMiner,
  'Blockchain Guardian': blockchainGuardian,
  'Quantum Physician': quantumPhysician,
  'Virtual Realtor': virtualRealtor,
  'Code Assassin': codeAssassin,
  'Crypto Shaman': cryptoShaman,
  'Market Prophet': marketProphet,
  'Digital Nomad': digitalNomad,
  'Neon Detective': neonDetective,
  'Hologram Dancer': hologramDancer,
  'Cyber Mechanic': cyberMechanic,
  'Ghost Trader': ghostTrader,
  'Binary Monk': binaryMonk,
  'Pixel Artist': pixelArtist,
  'Quantum Thief': quantumThief,
  'Memory Keeper': memoryKeeper,
  'Storm Hacker': stormHacker,
  'Dream Architect': dreamArchitect,
  'Chrome Gladiator': chromeGladiator,
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const classIcons = {
  trader: TrendingUp,
  analyst: BookOpen,
  hacker: Shield,
  scholar: Star,
  guardian: Shield,
  broker: TrendingUp,
  samurai: Zap,
  architect: Crown,
  miner: Gem,
  detective: User,
  mechanic: Zap,
  artist: Star,
  thief: Zap,
  keeper: BookOpen,
  nomad: User,
  shaman: Crown,
  prophet: Star,
  dancer: Star,
  gladiator: Shield,
  monk: BookOpen,
};

export default function AvatarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [allAvatars, setAllAvatars] = useState<Avatar[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      loadAvatarData();
    }
  }, [id]);

  const loadAvatarData = async () => {
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

      // Load all avatars
      const { data: avatarsData } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (avatarsData) {
        setAllAvatars(avatarsData);
        const currentAvatar = avatarsData.find(a => a.id === id);
        if (currentAvatar) {
          setAvatar(currentAvatar);
        }
      }

      // Load user's owned avatars
      if (profile) {
        const { data: ownedAvatars } = await supabase
          .from('user_avatars')
          .select('avatar_id')
          .eq('user_id', profile.id);

        if (ownedAvatars) {
          setUserAvatars(ownedAvatars.map(item => item.avatar_id));
        }
      }
    } catch (error) {
      console.error('Error loading avatar data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do avatar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseAvatar = async () => {
    if (!avatar || !userProfile || purchasing) return;

    if (userProfile.points < avatar.price) {
      toast({
        title: "Beetz Insuficientes",
        description: "Você não tem Beetz suficientes para comprar este avatar",
        variant: "destructive"
      });
      return;
    }

    setPurchasing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Purchase with Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const { error: purchaseError } = await supabase
            .from('user_avatars')
            .insert({
              user_id: profile.id,
              avatar_id: avatar.id,
              is_active: false
            });

          if (purchaseError) throw purchaseError;

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ points: userProfile.points - avatar.price })
            .eq('id', profile.id);

          if (updateError) throw updateError;

          setUserProfile(prev => prev ? { ...prev, points: prev.points - avatar.price } : null);
          setUserAvatars(prev => [...prev, avatar.id]);
        }
      } else {
        // Purchase locally
        const userData = localStorage.getItem('satoshi_user');
        if (userData) {
          const localUser = JSON.parse(userData);
          localUser.coins = (localUser.coins || 0) - avatar.price;
          localUser.ownedAvatars = [...(localUser.ownedAvatars || []), avatar.id];
          localStorage.setItem('satoshi_user', JSON.stringify(localUser));
          
          setUserProfile(prev => prev ? { ...prev, points: prev.points - avatar.price } : null);
          setUserAvatars(prev => [...prev, avatar.id]);
        }
      }

      toast({
        title: "🎉 Avatar Comprado!",
        description: `${avatar.name} foi adicionado à sua coleção!`,
      });
    } catch (error) {
      console.error('Error purchasing avatar:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível comprar o avatar",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getAvatarImage = (avatarName: string) => {
    return avatarImages[avatarName as keyof typeof avatarImages] || '/placeholder.svg';
  };

  const getClassIcon = (avatarName: string) => {
    const className = avatarName.toLowerCase().split(' ')[1] || 'trader';
    const IconComponent = classIcons[className as keyof typeof classIcons] || TrendingUp;
    return IconComponent;
  };

  const getCurrentAvatarIndex = () => {
    return allAvatars.findIndex(a => a.id === id);
  };

  const navigateToAvatar = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentAvatarIndex();
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allAvatars.length - 1;
    } else {
      newIndex = currentIndex < allAvatars.length - 1 ? currentIndex + 1 : 0;
    }
    
    navigate(`/avatar/${allAvatars[newIndex].id}`);
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

  if (!avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent">
        <FloatingNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Avatar não encontrado</CardTitle>
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

  const IconComponent = getClassIcon(avatar.name);
  const isOwned = userAvatars.includes(avatar.id);
  const canAfford = userProfile ? userProfile.points >= avatar.price : false;
  const meetsLevel = userProfile ? userProfile.level >= avatar.level_required : false;

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
              onClick={() => navigateToAvatar('prev')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToAvatar('next')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Avatar Display */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="relative">
                {/* Avatar Image */}
                <div className="aspect-square bg-gradient-to-b from-muted to-card rounded-2xl p-8 mb-6 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[avatar.rarity as keyof typeof rarityColors]} opacity-10`} />
                  <img 
                    src={getAvatarImage(avatar.name)}
                    alt={avatar.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`bg-gradient-to-r ${rarityColors[avatar.rarity as keyof typeof rarityColors]} text-white`}>
                      <IconComponent className="mr-1 h-3 w-3" />
                      {avatar.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Level Required */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary">
                      Nível {avatar.level_required}
                    </Badge>
                  </div>
                </div>

                {/* Purchase Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{avatar.price} Beetz</span>
                    {isOwned && (
                      <Badge className="bg-green-500 text-white">
                        ✓ Possui
                      </Badge>
                    )}
                  </div>
                  
                  {!isOwned && (
                    <Button 
                      onClick={purchaseAvatar}
                      disabled={purchasing || !canAfford || !meetsLevel}
                      className="w-full"
                      size="lg"
                    >
                      {purchasing ? "Comprando..." : 
                       !meetsLevel ? `Requer Nível ${avatar.level_required}` :
                       !canAfford ? "Beetz Insuficientes" : 
                       "Comprar Avatar"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avatar Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                  {avatar.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{avatar.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Classe:</span>
                    <p className="text-muted-foreground">{avatar.avatar_class || 'Cidadão Digital'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Distrito:</span>
                    <p className="text-muted-foreground">{avatar.district_theme || 'Neutro'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backstory */}
            {avatar.backstory && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    História
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{avatar.backstory}</p>
                </CardContent>
              </Card>
            )}

            {/* Bonus Effects */}
            {avatar.bonus_effects && Object.keys(avatar.bonus_effects).length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Habilidades Especiais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(avatar.bonus_effects).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm">{key}:</span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Hint */}
            <Card className="bg-card/50 backdrop-blur-sm border-dashed">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Use as setas no topo para navegar entre os avatares
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}