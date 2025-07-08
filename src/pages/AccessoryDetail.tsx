import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, Star, Gem, Zap, Shield, Eye, ArrowRight, Shirt } from "lucide-react";

// Import accessory images
import neuralHeadband from "@/assets/accessories/neural-headband.jpg";
import quantumGloves from "@/assets/accessories/quantum-gloves.jpg";
import holoSneakers from "@/assets/accessories/holo-sneakers.jpg";
import neuralVisor from "@/assets/accessories/neural-visor.jpg";
import quantumChestArmor from "@/assets/accessories/quantum-chest-armor.jpg";
import cyberWings from "@/assets/accessories/cyber-wings.jpg";
import powerGauntlets from "@/assets/accessories/power-gauntlets.jpg";
import exoBoots from "@/assets/accessories/exo-boots.jpg";
import dataCrown from "@/assets/accessories/data-crown.jpg";
import neonJacket from "@/assets/accessories/neon-jacket.jpg";
import holoCape from "@/assets/accessories/holo-cape.jpg";
import cyberMask from "@/assets/accessories/cyber-mask.jpg";
import plasmaSword from "@/assets/accessories/plasma-sword.jpg";
import energyShield from "@/assets/accessories/energy-shield.jpg";
import stealthCloak from "@/assets/accessories/stealth-cloak.jpg";
import bioScanner from "@/assets/accessories/bio-scanner.jpg";
import neuralCollar from "@/assets/accessories/neural-collar.jpg";
import gravityBoots from "@/assets/accessories/gravity-boots.jpg";
import dataBracelet from "@/assets/accessories/data-bracelet.jpg";
import cyberMohawk from "@/assets/accessories/cyber-mohawk.jpg";

interface Accessory {
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

const accessoryImages = {
  'Neural Headband': neuralHeadband,
  'Quantum Gloves': quantumGloves,
  'Holo Sneakers': holoSneakers,
  'Neural Visor': neuralVisor,
  'Quantum Chest Armor': quantumChestArmor,
  'Cyber Wings': cyberWings,
  'Power Gauntlets': powerGauntlets,
  'Exo Boots': exoBoots,
  'Data Crown': dataCrown,
  'Neon Jacket': neonJacket,
  'Holo Cape': holoCape,
  'Cyber Mask': cyberMask,
  'Plasma Sword': plasmaSword,
  'Energy Shield': energyShield,
  'Stealth Cloak': stealthCloak,
  'Bio Scanner': bioScanner,
  'Neural Collar': neuralCollar,
  'Gravity Boots': gravityBoots,
  'Data Bracelet': dataBracelet,
  'Cyber Mohawk': cyberMohawk,
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const accessoryIcons = {
  head: Crown,
  hands: Star,
  feet: Gem,
  body: Shield,
  weapon: Zap,
  accessory: Eye,
  default: Shirt,
};

// Mock expanded accessory data
const expandedAccessoryData = {
  'Neural Headband': {
    backstory: 'Banda neural desenvolvida pela TechCorp para amplificar a capacidade de processamento cerebral. Conecta diretamente aos lobos frontais, aumentando a velocidade de pensamento.',
    slot: 'Cabeça',
    material: 'Fibra Neural Sintética + Quantum Mesh',
    manufacturer: 'TechCorp Industries',
    compatible_with: ['Neural Visor', 'Data Crown'],
    installation_notes: 'Requer cirurgia menor para implantação dos conectores neurais',
  },
  'Quantum Gloves': {
    backstory: 'Luvas equipadas com computadores quânticos em miniatura. Permitem manipular dados financeiros com precisão subatômica e executar cálculos impossíveis.',
    slot: 'Mãos',
    material: 'Nanotubo de Carbono + Processadores Quânticos',
    manufacturer: 'Quantum Dynamics Ltd',
    compatible_with: ['Power Gauntlets', 'Data Bracelet'],
    installation_notes: 'Calibração neural necessária para sincronização completa',
  },
  'Holo Sneakers': {
    backstory: 'Tênis holográficos que projetam interfaces de trading diretamente no solo. Cada passo gera análises de mercado em tempo real através de sensores de pressão.',
    slot: 'Pés',
    material: 'Sola Inteligente + Projetores Holográficos',
    manufacturer: 'Future Footwear Co',
    compatible_with: ['Exo Boots', 'Gravity Boots'],
    installation_notes: 'Sincronização com rede de dados via Bluetooth Neural',
  }
};

export default function AccessoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [allAccessories, setAllAccessories] = useState<Accessory[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Mock accessories data
  const mockAccessories: Accessory[] = [
    {
      id: 'acc-1',
      name: 'Neural Headband',
      description: 'Banda neural que amplifica a capacidade de processamento cerebral',
      price: 1500,
      category: 'accessory',
      rarity: 'rare',
      level_required: 8,
      effects: { processing_speed: 25, neural_sync: 15 }
    },
    {
      id: 'acc-2',
      name: 'Quantum Gloves',
      description: 'Luvas equipadas com computadores quânticos para cálculos precisos',
      price: 2200,
      category: 'accessory',
      rarity: 'epic',
      level_required: 12,
      effects: { calculation_speed: 40, quantum_processing: 30 }
    },
    {
      id: 'acc-3',
      name: 'Holo Sneakers',
      description: 'Tênis holográficos que projetam interfaces de trading',
      price: 1800,
      category: 'accessory',
      rarity: 'rare',
      level_required: 10,
      effects: { mobility: 20, interface_speed: 15 }
    },
    // Add more mock accessories...
  ];

  useEffect(() => {
    if (id) {
      loadAccessoryData();
    }
  }, [id]);

  const loadAccessoryData = async () => {
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
      setAllAccessories(mockAccessories);
      const currentAccessory = mockAccessories.find(a => a.id === id);
      if (currentAccessory) {
        setAccessory(currentAccessory);
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
      console.error('Error loading accessory data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do acessório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseAccessory = async () => {
    if (!accessory || !userProfile || purchasing) return;

    if (userProfile.points < accessory.price) {
      toast({
        title: "Beetz Insuficientes",
        description: "Você não tem Beetz suficientes para comprar este acessório",
        variant: "destructive"
      });
      return;
    }

    setPurchasing(true);
    try {
      // Mock purchase for now
      toast({
        title: "👑 Acessório Comprado!",
        description: `${accessory.name} foi adicionado ao seu inventário!`,
      });
      
      setUserProfile(prev => prev ? { ...prev, points: prev.points - accessory.price } : null);
      setUserProducts(prev => [...prev, accessory.id]);
    } catch (error) {
      console.error('Error purchasing accessory:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível comprar o acessório",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const getAccessoryImage = (accessoryName: string) => {
    return accessoryImages[accessoryName as keyof typeof accessoryImages] || '/placeholder.svg';
  };

  const getAccessoryIcon = (accessoryName: string) => {
    if (accessoryName.toLowerCase().includes('headband') || accessoryName.toLowerCase().includes('crown') || accessoryName.toLowerCase().includes('visor')) return accessoryIcons.head;
    if (accessoryName.toLowerCase().includes('gloves') || accessoryName.toLowerCase().includes('gauntlets')) return accessoryIcons.hands;
    if (accessoryName.toLowerCase().includes('sneakers') || accessoryName.toLowerCase().includes('boots')) return accessoryIcons.feet;
    if (accessoryName.toLowerCase().includes('armor') || accessoryName.toLowerCase().includes('chest')) return accessoryIcons.body;
    if (accessoryName.toLowerCase().includes('sword') || accessoryName.toLowerCase().includes('weapon')) return accessoryIcons.weapon;
    return accessoryIcons.default;
  };

  const getCurrentAccessoryIndex = () => {
    return allAccessories.findIndex(a => a.id === id);
  };

  const navigateToAccessory = (direction: 'prev' | 'next') => {
    const currentIndex = getCurrentAccessoryIndex();
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allAccessories.length - 1;
    } else {
      newIndex = currentIndex < allAccessories.length - 1 ? currentIndex + 1 : 0;
    }
    
    navigate(`/accessory/${allAccessories[newIndex].id}`);
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

  if (!accessory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent">
        <FloatingNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Acessório não encontrado</CardTitle>
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

  const IconComponent = getAccessoryIcon(accessory.name);
  const isOwned = userProducts.includes(accessory.id);
  const canAfford = userProfile ? userProfile.points >= accessory.price : false;
  const meetsLevel = userProfile ? userProfile.level >= accessory.level_required : false;
  const expandedData = expandedAccessoryData[accessory.name as keyof typeof expandedAccessoryData];

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
              onClick={() => navigateToAccessory('prev')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToAccessory('next')}
              className="bg-card/50 backdrop-blur-sm"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Accessory Display */}
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="relative">
                {/* Accessory Image */}
                <div className="aspect-square bg-gradient-to-b from-muted to-card rounded-2xl p-8 mb-6 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[accessory.rarity as keyof typeof rarityColors]} opacity-10`} />
                  <img 
                    src={getAccessoryImage(accessory.name)}
                    alt={accessory.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className={`bg-gradient-to-r ${rarityColors[accessory.rarity as keyof typeof rarityColors]} text-white`}>
                      <IconComponent className="mr-1 h-3 w-3" />
                      {accessory.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Level Required */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary">
                      Nível {accessory.level_required}
                    </Badge>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-cyan-500 text-white">
                      <Shirt className="mr-1 h-3 w-3" />
                      ACESSÓRIO
                    </Badge>
                  </div>
                </div>

                {/* Purchase Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{accessory.price} Beetz</span>
                    {isOwned && (
                      <Badge className="bg-green-500 text-white">
                        ✓ Possui
                      </Badge>
                    )}
                  </div>
                  
                  {!isOwned && (
                    <Button 
                      onClick={purchaseAccessory}
                      disabled={purchasing || !canAfford || !meetsLevel}
                      className="w-full"
                      size="lg"
                    >
                      {purchasing ? "Comprando..." : 
                       !meetsLevel ? `Requer Nível ${accessory.level_required}` :
                       !canAfford ? "Beetz Insuficientes" : 
                       "Comprar Acessório"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessory Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                  {accessory.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{accessory.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Slot:</span>
                    <p className="text-muted-foreground">{expandedData?.slot || 'Universal'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Material:</span>
                    <p className="text-muted-foreground">{expandedData?.material || 'Cybernético'}</p>
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

            {/* Effects */}
            {accessory.effects && Object.keys(accessory.effects).length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Efeitos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(accessory.effects).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-sm font-medium text-green-400">+{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Specs */}
            {expandedData?.manufacturer && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-primary" />
                    Especificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Fabricante:</span>
                      <span className="text-sm font-medium">{expandedData.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Material:</span>
                      <span className="text-sm font-medium">{expandedData.material}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compatibility */}
            {expandedData?.compatible_with && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Compatibilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {expandedData.compatible_with.map((item, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Installation Notes */}
            {expandedData?.installation_notes && (
              <Card className="bg-card/50 backdrop-blur-sm border-amber-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-400">
                    <Eye className="h-5 w-5" />
                    Notas de Instalação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-300/80">{expandedData.installation_notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}