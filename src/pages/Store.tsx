import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/shared/ui/dialog";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { PaymentMethodSelector } from "@/components/shared/ui/payment-method-selector";
import { CryptoCheckout } from "@/components/crypto/crypto-checkout";
import { useCryptoPayments } from "@/hooks/use-crypto-payments";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Crown, Star, Gem, Zap, Clock, Gift, Shield, Infinity, Eye, Sparkles } from "lucide-react";
import { ComingSoonOverlay } from "@/components/shared/coming-soon-overlay";

// Import cyberpunk avatar images
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
import universeArchitect from "@/assets/avatars/universe-architect.jpg";
import eternalTrader from "@/assets/avatars/eternal-trader.jpg";
import infinityGuardian from "@/assets/avatars/infinity-guardian.jpg";
import omniscientSage from "@/assets/avatars/omniscient-sage.jpg";
import galaxyCommander from "@/assets/avatars/galaxy-commander.jpg";
import digitalDeity from "@/assets/avatars/digital-deity.jpg";
import voidArchitect from "@/assets/avatars/void-architect.jpg";
import timeWeaver from "@/assets/avatars/time-weaver.jpg";

// Import cyberpunk skins
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

// Import accessories and boosts
import neuralHeadband from "@/assets/accessories/neural-headband.jpg";
import quantumGloves from "@/assets/accessories/quantum-gloves.jpg";
import holoSneakers from "@/assets/accessories/holo-sneakers.jpg";

// New cyberpunk accessories
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
import techBackpack from "@/assets/accessories/tech-backpack.jpg";
import holoEarrings from "@/assets/accessories/holo-earrings.jpg";
import powerBelt from "@/assets/accessories/power-belt.jpg";
import cyberTattoos from "@/assets/accessories/cyber-tattoos.jpg";
import quantumRings from "@/assets/accessories/quantum-rings.jpg";
import spinalImplant from "@/assets/accessories/spinal-implant.jpg";
import holoPet from "@/assets/accessories/holo-pet.jpg";
import timeWatch from "@/assets/accessories/time-watch.jpg";
import cyberEye from "@/assets/accessories/cyber-eye.jpg";
import digitalAura from "@/assets/accessories/digital-aura.jpg";

import xpMultiplier from "@/assets/boosts/xp-multiplier.jpg";
import cryptoBooster from "@/assets/boosts/crypto-booster.jpg";
import timeWarp from "@/assets/boosts/time-warp.jpg";
import neuralXpBooster from "@/assets/boosts/neural-xp-booster.jpg";
import quantumEnergyDrink from "@/assets/boosts/quantum-energy-drink.jpg";
import megaPointsAmplifier from "@/assets/boosts/mega-points-amplifier.jpg";
import streakShield from "@/assets/boosts/streak-shield.jpg";
import wisdomElixir from "@/assets/boosts/wisdom-elixir.jpg";

interface Avatar {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rarity: string;
  level_required: number;
  is_available: boolean;
  is_starter?: boolean;
  backstory?: string;
}

interface Product {
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

export default function Store() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [skins, setSkins] = useState<Product[]>([]);
  const [userAvatars, setUserAvatars] = useState<string[]>([]);
  const [userProducts, setUserProducts] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showBeetzModal, setShowBeetzModal] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [showCryptoCheckout, setShowCryptoCheckout] = useState(false);
  const [cryptoPaymentData, setCryptoPaymentData] = useState<any>(null);
  const [selectedBeetzPackage, setSelectedBeetzPackage] = useState<{ amount: number; price: number; name: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const { createCryptoPayment, redirectToCryptoPayment, isLoading: cryptoLoading } = useCryptoPayments();

  useEffect(() => {
    loadStoreData();
    
    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const paymentType = urlParams.get('type');
    
    if (paymentStatus === 'success' && paymentType === 'beetz') {
      processBeetzPayment();
    }
  }, [navigate]);

  const loadStoreData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load user profile from Supabase or fallback to localStorage
      let profile = null;
      if (user) {
        const { data: supabaseProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        profile = supabaseProfile;
      }

      // If no Supabase profile, use localStorage data
      if (!profile) {
        const userData = localStorage.getItem('satoshi_user');
        if (userData) {
          const localUser = JSON.parse(userData);
          profile = {
            id: 'local-user',
            level: localUser.level || 1,
            points: localUser.coins || 0,
            nickname: localUser.nickname || 'Usuário',
            xp: localUser.xp || 0,
            streak: localUser.streak || 0,
            completed_lessons: localUser.completedLessons || 0
          };
        }
      }

      if (profile) {
        setUserProfile(profile);
      }

      // Load avatars and products
      const [avatarsData, productsData] = await Promise.all([
        supabase.from('avatars').select('*').eq('is_available', true).order('price'),
        supabase.from('products').select('*').eq('is_available', true).order('category').order('price')
      ]);

      if (avatarsData.data) {
        setAvatars(avatarsData.data);
      }
      if (productsData.data) {
        setProducts(productsData.data);
      }

      // Load mock cyberpunk skins data
      const mockSkins: Product[] = [
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
        {
          id: 'skin-4',
          name: 'Digital Ghost Mode',
          description: 'Aparência fantasmagórica translúcida com efeitos glitch',
          price: 3800,
          category: 'skin',
          rarity: 'epic',
          level_required: 18,
          effects: { type: 'visual', transparency: true }
        },
        {
          id: 'skin-5',
          name: 'Plasma Energy Coating',
          description: 'Revestimento de energia plasma laranja e vermelha',
          price: 2800,
          category: 'skin',
          rarity: 'rare',
          level_required: 12,
          effects: { type: 'visual', energy: true }
        },
        {
          id: 'skin-6',
          name: 'Void Dark Matter',
          description: 'Matéria escura do vazio com redemoinhos de energia roxa',
          price: 5000,
          category: 'skin',
          rarity: 'legendary',
          level_required: 25,
          effects: { type: 'visual', void: true }
        },
        {
          id: 'skin-7',
          name: 'Holographic Rainbow',
          description: 'Padrão holográfico iridescente com fluxos de dados',
          price: 3500,
          category: 'skin',
          rarity: 'epic',
          level_required: 16,
          effects: { type: 'visual', rainbow: true }
        },
        {
          id: 'skin-8',
          name: 'Crystal Nano Armor',
          description: 'Estrutura cristalina transparente com padrões nanotecnológicos',
          price: 4200,
          category: 'skin',
          rarity: 'epic',
          level_required: 19,
          effects: { type: 'visual', crystal: true }
        },
        {
          id: 'skin-9',
          name: 'Binary Code Stream',
          description: 'Fluxos de código binário verde e azul',
          price: 2700,
          category: 'skin',
          rarity: 'rare',
          level_required: 11,
          effects: { type: 'visual', code: true }
        },
        {
          id: 'skin-10',
          name: 'Electric Storm Aura',
          description: 'Aura de tempestade elétrica com raios azuis',
          price: 3900,
          category: 'skin',
          rarity: 'epic',
          level_required: 17,
          effects: { type: 'visual', lightning: true }
        },
        {
          id: 'skin-11',
          name: 'Cyber Phoenix Flames',
          description: 'Chamas digitais laranja e vermelhas de fênix cibernética',
          price: 4800,
          category: 'skin',
          rarity: 'legendary',
          level_required: 22,
          effects: { type: 'visual', flames: true }
        },
        {
          id: 'skin-12',
          name: 'Neural Network Web',
          description: 'Rede neural interconectada com fluxo de dados',
          price: 3600,
          category: 'skin',
          rarity: 'epic',
          level_required: 16,
          effects: { type: 'visual', network: true }
        },
        {
          id: 'skin-13',
          name: 'Quantum Entanglement',
          description: 'Partículas quânticas conectadas por fios de energia',
          price: 5200,
          category: 'skin',
          rarity: 'legendary',
          level_required: 26,
          effects: { type: 'visual', quantum: true }
        },
        {
          id: 'skin-14',
          name: 'Viral Code Infection',
          description: 'Padrões de vírus digital verde se espalhando',
          price: 2900,
          category: 'skin',
          rarity: 'rare',
          level_required: 13,
          effects: { type: 'visual', virus: true }
        },
        {
          id: 'skin-15',
          name: 'Diamond Data Core',
          description: 'Núcleo de dados cristalino com nós de processamento',
          price: 4600,
          category: 'skin',
          rarity: 'legendary',
          level_required: 21,
          effects: { type: 'visual', diamond: true }
        },
        {
          id: 'skin-16',
          name: 'Time Distortion Field',
          description: 'Campo de distorção temporal com elementos de relógio',
          price: 5500,
          category: 'skin',
          rarity: 'legendary',
          level_required: 28,
          effects: { type: 'visual', time: true }
        },
        {
          id: 'skin-17',
          name: 'Shadow Stealth Mode',
          description: 'Modo furtivo sombrio com padrões de tecnologia stealth',
          price: 4100,
          category: 'skin',
          rarity: 'epic',
          level_required: 18,
          effects: { type: 'visual', stealth: true }
        },
        {
          id: 'skin-18',
          name: 'Cosmic Nebula Drift',
          description: 'Padrões de galáxia com poeira cósmica e estrelas',
          price: 5800,
          category: 'skin',
          rarity: 'legendary',
          level_required: 30,
          effects: { type: 'visual', cosmic: true }
        },
        {
          id: 'skin-19',
          name: 'Corrupted Reality Glitch',
          description: 'Efeitos de glitch digital com padrões de pixels corrompidos',
          price: 3300,
          category: 'skin',
          rarity: 'epic',
          level_required: 15,
          effects: { type: 'visual', glitch: true }
        }
      ];

      setSkins(mockSkins);

      // Load user's owned items
      if (profile) {
        const [ownedAvatars, ownedProducts] = await Promise.all([
          supabase.from('user_avatars').select('avatar_id').eq('user_id', profile.id),
          supabase.from('user_products').select('product_id').eq('user_id', profile.id)
        ]);

        if (ownedAvatars.data) {
          setUserAvatars(ownedAvatars.data.map(item => item.avatar_id));
        }
        if (ownedProducts.data) {
          setUserProducts(ownedProducts.data.map(item => item.product_id));
        }
      }
    } catch (error) {
      console.error('Error loading store data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a loja",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processBeetzPayment = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (!sessionId) return;

    try {
      const { data, error } = await supabase.functions.invoke('process-beetz-payment', {
        body: { sessionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "🎉 Compra Realizada!",
        description: "Seus Beetz foram adicionados à sua conta",
      });

      // Reload store data to update points
      loadStoreData();
      
      // Clean URL parameters
      window.history.replaceState({}, document.title, "/store");
    } catch (error) {
      console.error('Error processing Beetz payment:', error);
      toast({
        title: "Erro no Pagamento",
        description: "Não foi possível processar o pagamento de Beetz",
        variant: "destructive"
      });
    }
  };

  const handleBeetzPurchaseClick = (amount: number, price: number, packageName: string) => {
    setSelectedBeetzPackage({ amount, price, name: packageName });
    setShowPaymentSelector(true);
  };

  const handlePaymentMethodSelect = async (method: 'card' | 'crypto') => {
    if (!selectedBeetzPackage || !userProfile) return;
    
    const { amount, price, name } = selectedBeetzPackage;
    setPurchasing(`beetz-${amount}`);
    setShowPaymentSelector(false);

    try {
      if (method === 'card') {
        // Stripe payment
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            productId: `beetz-${amount}`,
            productName: `${name} - ${amount} Beetz`,
            amount: price * 100, // Convert to centavos
            type: 'beetz'
          }
        });

        if (error) throw new Error(error.message);
        window.open(data.url, '_blank');
        
      } else {
        // Crypto payment - redirect to checkout page
        const cryptoPayment = await createCryptoPayment({
          productId: `beetz-${amount}`,
          productName: `${name} - ${amount} Beetz`,
          amount: price * 100, // Convert to centavos
          type: 'beetz'
        });

        if (cryptoPayment && cryptoPayment.success) {
          setCryptoPaymentData({
            ...cryptoPayment,
            productName: `${name} - ${amount} Beetz`,
            originalAmount: price * 100
          });
          setShowCryptoCheckout(true);
          setPurchasing(null); // Remove loading state since we're showing checkout
        }
      }
    } catch (error) {
      console.error('Error purchasing Beetz:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível processar a compra de Beetz",
        variant: "destructive"
      });
      setPurchasing(null);
      setSelectedBeetzPackage(null);
    }
  };

  const handleCryptoCheckoutBack = () => {
    setShowCryptoCheckout(false);
    setShowPaymentSelector(true);
    setCryptoPaymentData(null);
  };

  const handleCryptoSuccess = () => {
    setShowCryptoCheckout(false);
    setSelectedBeetzPackage(null);
    setCryptoPaymentData(null);
    toast({
      title: "Pagamento enviado!",
      description: "Aguardando confirmação da transação. Você receberá seus Beetz em alguns minutos.",
    });
  };

  const purchaseItem = async (item: Avatar | Product, type: 'avatar' | 'product' | 'skin') => {
    if (!userProfile) return;
    setPurchasing(item.id);

    try {
      if (userProfile.level < item.level_required) {
        toast({
          title: "Nível Insuficiente", 
          description: `Nível ${item.level_required} necessário`,
          variant: "destructive"
        });
        return;
      }

      // Check if user has enough Beetz for any item
      if (userProfile.points < item.price) {
        setShowBeetzModal(true);
        return;
      }

      // For items with Beetz balance, proceed with direct purchase
      if (type === 'avatar') {
        await supabase.from('user_avatars').insert({
          user_id: userProfile.id,
          avatar_id: item.id
        });
        setUserAvatars(prev => [...prev, item.id]);
      } else {
        // For products and skins
        await supabase.from('user_products').insert({
          user_id: userProfile.id,
          product_id: item.id
        });
        setUserProducts(prev => [...prev, item.id]);
      }

      // Deduct Beetz
      await supabase.from('profiles').update({
        points: userProfile.points - item.price
      }).eq('id', userProfile.id);

      setUserProfile(prev => prev ? { ...prev, points: prev.points - item.price } : null);

      toast({
        title: `🎉 ${type === 'avatar' ? 'Avatar' : type === 'skin' ? 'Skin' : 'Produto'} Comprado!`,
        description: `${item.name} foi adicionado à sua coleção`,
      });

    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Erro na Compra",
        description: "Não foi possível processar a compra",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500 text-white';
      case 'uncommon': return 'bg-green-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'epic': return 'bg-purple-500 text-white';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'uncommon': return <Gem className="h-4 w-4" />;
      case 'rare': return <Zap className="h-4 w-4" />;
      case 'epic': return <Crown className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'boost': return '⚡';
      case 'accessory': return '👟';
      case 'cosmetic': return '🎨';
      case 'utility': return '🛠️';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-full">
      <div className="max-w-md mx-auto p-mobile-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="touch-target">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-mobile-2xl font-bold text-foreground">{t('store.header.marketplace')}</h1>
            <p className="text-muted-foreground text-mobile-sm">{t('store.header.subtitle')}</p>
          </div>
        </div>

        {/* Premium Plans Promotion Card */}
        <Card className="mobile-card mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-mobile-sm font-bold text-foreground mb-1">{t('store.premium.title')}</h3>
                <p className="text-mobile-xs text-muted-foreground">{t('store.premium.subtitle')}</p>
              </div>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate('/subscription-plans')}
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-mobile-xs touch-target"
            >
              {t('store.premium.viewPlans')}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center">
              <div className="text-purple-400 font-bold text-mobile-base">∞</div>
              <div className="text-muted-foreground text-mobile-xs">{t('store.premium.duels')}</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold text-mobile-base">3x</div>
              <div className="text-muted-foreground text-mobile-xs">{t('store.premium.xpBoost')}</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold text-mobile-base">100</div>
              <div className="text-muted-foreground text-mobile-xs">{t('store.premium.beetzPerMonth')}</div>
            </div>
          </div>
        </Card>

        {/* User Points - BTZ Card Igual ao Dashboard */}
        {userProfile && (
          <div className="flex justify-center mb-6">
            <div 
              className="relative cursor-pointer hover:scale-105 transition-all duration-200 touch-target"
              onClick={() => navigate('/beetz-info')}
            >
              <div className="bg-transparent backdrop-blur-sm text-white font-bold p-mobile-4 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-[#adff2f]/20 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  {/* Logo Beetz simples */}
                  <div className="w-6 h-6 rounded-full bg-[#adff2f] flex items-center justify-center">
                    <span className="text-black font-bold text-mobile-sm">B</span>
                  </div>
                  <span className="font-mono text-mobile-2xl">
                    {userProfile.points.toLocaleString()} BTZ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros - Mobile Optimizado */}
        <Tabs defaultValue="avatars" className="mb-20">
          <div className="mb-6">
            <TabsList className="grid grid-cols-3 gap-2 h-auto bg-transparent p-0 mb-3">
              <TabsTrigger 
                value="avatars" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
              >
                <div className="text-lg">👤</div>
                <span className="text-xs font-medium">{t('store.tabs.avatars')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="skins" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
              >
                <div className="text-lg">🎨</div>
                <span className="text-xs font-medium">{t('store.tabs.skins')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="boosts" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
              >
                <div className="text-lg">⚡</div>
                <span className="text-xs font-medium">{t('store.tabs.boosts')}</span>
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-3 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger 
                value="accessories" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
              >
                <div className="text-lg">🎒</div>
                <span className="text-xs font-medium">{t('store.tabs.accessories')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="lives" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
              >
                <div className="text-lg">❤️</div>
                <span className="text-xs font-medium">{t('store.tabs.lives')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="beetz" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-border/50 bg-card/50 hover:bg-card data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30 data-[state=active]:text-primary transition-all duration-200"
              >
                <BeetzIcon size="sm" />
                <span className="text-xs font-medium">{t('store.tabs.beetz')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Avatars Tab */}
          <TabsContent value="avatars">
            <div className="grid grid-cols-2 gap-3">
              {avatars.map((avatar) => {
                const isOwned = userAvatars.includes(avatar.id);
                const canAfford = userProfile ? userProfile.points >= avatar.price : false;
                const meetsLevel = userProfile ? userProfile.level >= avatar.level_required : false;
                
                // Get avatar image from imports
                const getAvatarImage = () => {
                  const imageMap: { [key: string]: any } = {
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
                    'Universe Architect': universeArchitect,
                    'The Eternal Trader': eternalTrader,
                    'Infinity Guardian': infinityGuardian,
                    'Omniscient Sage': omniscientSage,
                    'Galaxy Commander': galaxyCommander,
                    'Digital Deity': digitalDeity,
                    'Void Architect': voidArchitect,
                    'Time Weaver': timeWeaver,
                  };
                  return imageMap[avatar.name] || avatar.image_url;
                };
                
                return (
                  <Card key={avatar.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/avatar/${avatar.id}`)}
                    >
                      <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-2">
                        <img 
                          src={getAvatarImage()} 
                          alt={avatar.name}
                          className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="absolute top-1 right-1">
                        <Badge className={`${getRarityColor(avatar.rarity)} flex items-center gap-1 text-xs`}>
                          {getRarityIcon(avatar.rarity)}
                        </Badge>
                      </div>
                      {/* Premium Avatars Visual Effect */}
                      {avatar.price >= 1000 && (
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none rounded-lg" />
                      )}
                      {avatar.is_starter && (
                        <div className="absolute top-1 left-1">
                          <Badge variant="secondary" className="text-xs">
                            <Gift className="h-3 w-3 mr-1" />
                            Grátis
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-3">
                      <div 
                        className="mb-2 cursor-pointer"
                        onClick={() => navigate(`/avatar/${avatar.id}`)}
                      >
                        <h3 className="font-bold text-foreground text-sm truncate hover:text-primary transition-colors">{avatar.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{avatar.description}</p>
                        {avatar.backstory && (
                          <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">"{avatar.backstory}"</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {avatar.price === 0 ? (
                            <span className="text-sm font-bold text-green-500">Grátis</span>
                          ) : (
                            <>
                              <span className="text-sm font-bold text-primary">{avatar.price}</span>
                              <span className="text-xs text-muted-foreground">Beetz</span>
                            </>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">Nv {avatar.level_required}</Badge>
                      </div>
                      
                      {isOwned ? (
                        <Button variant="secondary" className="w-full text-xs py-1 h-8" disabled>
                          ✅ {t('store.buttons.owns')}
                        </Button>
                      ) : (
                        <div className="space-y-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              purchaseItem(avatar, 'avatar');
                            }}
                            disabled={!canAfford || !meetsLevel || purchasing === avatar.id}
                            className="w-full text-xs py-1 h-8"
                            variant={canAfford && meetsLevel ? "default" : "outline"}
                          >
                            {purchasing === avatar.id ? "..." :
                             !meetsLevel ? `Nv ${avatar.level_required}` :
                             !canAfford ? (avatar.price === 0 ? t('store.buttons.buy') : t('store.buttons.noBeetz')) : 
                             avatar.price === 0 ? t('store.buttons.buy') : t('store.buttons.buy')
                            }
                          </Button>
                          <Button
                            onClick={() => navigate(`/avatar/${avatar.id}`)}
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs py-1 h-6 text-muted-foreground hover:text-primary"
                          >
                            {t('store.buttons.viewDetails')}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Skins Tab */}
          <TabsContent value="skins">
            <ComingSoonOverlay>
              <div className="grid grid-cols-2 gap-3">
                {skins.map((skin) => {
                const isOwned = userProducts.includes(skin.id);
                const canAfford = userProfile ? userProfile.points >= skin.price : false;
                const meetsLevel = userProfile ? userProfile.level >= skin.level_required : false;
                
                // Get skin image from imports
                const getSkinImage = () => {
                  const imageMap: { [key: string]: any } = {
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
                  return imageMap[skin.name] || '🎨';
                };
                
                return (
                  <Card key={skin.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/skin/${skin.id}`)}
                    >
                      <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-2">
                        <img 
                          src={getSkinImage()} 
                          alt={skin.name}
                          className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="absolute top-1 right-1">
                        <Badge className={`${getRarityColor(skin.rarity)} flex items-center gap-1 text-xs`}>
                          {getRarityIcon(skin.rarity)}
                        </Badge>
                      </div>
                      <div className="absolute top-1 left-1">
                        <Badge variant="secondary" className="text-xs bg-purple-500 text-white">
                          Skin
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <div 
                        className="mb-2 cursor-pointer"
                        onClick={() => navigate(`/skin/${skin.id}`)}
                      >
                        <h3 className="font-bold text-foreground text-sm truncate hover:text-primary transition-colors">{skin.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{skin.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">{skin.price}</span>
                          <span className="text-xs text-muted-foreground">Beetz</span>
                        </div>
                        <Badge variant="outline" className="text-xs">Nv {skin.level_required}</Badge>
                      </div>
                      
                      {isOwned ? (
                        <Button variant="secondary" className="w-full text-xs py-1 h-8" disabled>
                          ✅ {t('store.buttons.owns')}
                        </Button>
                      ) : (
                        <div className="space-y-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              purchaseItem(skin, 'skin');
                            }}
                            disabled={!canAfford || !meetsLevel || purchasing === skin.id}
                            className="w-full text-xs py-1 h-8"
                            variant={canAfford && meetsLevel ? "default" : "outline"}
                          >
                            {purchasing === skin.id ? "..." :
                             !meetsLevel ? `Nv ${skin.level_required}` :
                             !canAfford ? "Sem Beetz" : "Comprar"
                            }
                          </Button>
                          <Button
                            onClick={() => navigate(`/skin/${skin.id}`)}
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs py-1 h-6 text-muted-foreground hover:text-primary"
                          >
                            {t('store.buttons.viewDetails')}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </ComingSoonOverlay>
          </TabsContent>

          {/* Boosts Tab */}
          <TabsContent value="boosts">
            <ComingSoonOverlay>
              <div className="grid grid-cols-2 gap-3">
                {products.filter(p => p.category === 'boost').map((product) => {
                const isOwned = userProducts.includes(product.id);
                const canAfford = userProfile ? userProfile.points >= product.price : false;
                const meetsLevel = userProfile ? userProfile.level >= product.level_required : false;
                
                // Get product image from imports
                const getProductImage = () => {
                  const imageMap: { [key: string]: any } = {
                    'XP Multiplier Chip': xpMultiplier,
                    'Crypto Mining Booster': cryptoBooster,
                    'Time Warp Device': timeWarp,
                    'Mega XP': neuralXpBooster,
                    'Energia Infinita': quantumEnergyDrink,
                    'Chuva de Pontos': megaPointsAmplifier,
                    'Escudo Anti-Streak': streakShield,
                    'Poção de Sabedoria': wisdomElixir,
                    'Protetor de Sequência': streakShield,
                    'XP em Dobro': neuralXpBooster,
                    'Neural Focus Enhancer': neuralXpBooster,
                    'Quantum Memory Bank': megaPointsAmplifier,
                    'Cyber Streak Protector': streakShield,
                    'Digital Wisdom Serum': wisdomElixir,
                    'Energy Core Reactor': quantumEnergyDrink,
                  };
                  return imageMap[product.name] || getCategoryIcon(product.category);
                };
                
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/boost/${product.id}`)}
                    >
                      <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-2">
                        {(() => {
                          const imageSource = getProductImage();
                          // Check if it's an emoji/icon (short string) or image path (longer string with /)
                          const isEmoji = typeof imageSource === 'string' && imageSource.length <= 2 && !imageSource.includes('/');
                          
                          return isEmoji ? (
                            <div className="text-4xl">{imageSource}</div>
                          ) : (
                            <img 
                              src={imageSource} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          );
                        })()}
                      </div>
                      <div className="absolute top-1 right-1">
                        <Badge className={`${getRarityColor(product.rarity)} flex items-center gap-1 text-xs`}>
                          {getRarityIcon(product.rarity)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="mb-2">
                        <h3 className="font-bold text-foreground text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">{product.price}</span>
                          <span className="text-xs text-muted-foreground">Beetz</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {product.duration_hours && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {product.duration_hours}h
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">Nv {product.level_required}</Badge>
                        </div>
                      </div>
                      
                      {isOwned ? (
                        <Button variant="secondary" className="w-full text-xs py-1 h-8" disabled>
                          ✅ {t('store.buttons.owns')}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => purchaseItem(product, 'product')}
                          disabled={!canAfford || !meetsLevel || purchasing === product.id}
                          className="w-full text-xs py-1 h-8"
                          variant={canAfford && meetsLevel ? "default" : "outline"}
                        >
                          {purchasing === product.id ? "..." :
                           !meetsLevel ? `Nv ${product.level_required}` :
                           !canAfford ? "Sem Beetz" : "Comprar"
                          }
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </ComingSoonOverlay>
          </TabsContent>

          {/* Accessories Tab */}
          <TabsContent value="accessories">
            <ComingSoonOverlay>
              <div className="grid grid-cols-2 gap-3">
                {products.filter(p => p.category === 'accessory').map((product) => {
                const isOwned = userProducts.includes(product.id);
                const canAfford = userProfile ? userProfile.points >= product.price : false;
                const meetsLevel = userProfile ? userProfile.level >= product.level_required : false;
                
                // Get accessory image from imports
                const getAccessoryImage = () => {
                  const imageMap: { [key: string]: any } = {
                    'Neural Enhancement Headband': neuralHeadband,
                    'Quantum Gloves': quantumGloves,
                    'Holo Sneakers': holoSneakers,
                    'Neural AR Visor': neuralVisor,
                    'Quantum Chest Armor': quantumChestArmor,
                    'Mechanical Cyber Wings': cyberWings,
                    'Power Combat Gauntlets': powerGauntlets,
                    'Exoskeleton Boots': exoBoots,
                    'Data Processing Crown': dataCrown,
                    'Neon Light Jacket': neonJacket,
                    'Holographic Cape': holoCape,
                    'Cyber Protection Mask': cyberMask,
                    'Plasma Energy Sword': plasmaSword,
                    'Energy Shield Generator': energyShield,
                    'Stealth Cloaking Device': stealthCloak,
                    'Bio Scanner Goggles': bioScanner,
                    'Neural Interface Collar': neuralCollar,
                    'Anti-Gravity Boots': gravityBoots,
                    'Data Interface Bracelet': dataBracelet,
                    'Cyber Mohawk Implant': cyberMohawk,
                    'Tech Command Backpack': techBackpack,
                    'Holographic Earrings': holoEarrings,
                    'Power Core Utility Belt': powerBelt,
                    'Glowing Circuit Tattoos': cyberTattoos,
                    'Quantum Particle Rings': quantumRings,
                    'Spinal Neural Implant': spinalImplant,
                    'Holographic Companion Pet': holoPet,
                    'Time Dilator Watch': timeWatch,
                    'Cyber Optic Implant': cyberEye,
                    'Digital Energy Aura': digitalAura,
                  };
                  return imageMap[product.name] || getCategoryIcon(product.category);
                };
                
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => navigate(`/accessory/${product.id}`)}
                    >
                      <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-2">
                        {(() => {
                          const imageSource = getAccessoryImage();
                          // Check if it's an emoji/icon (short string) or image path (longer string with /)
                          const isEmoji = typeof imageSource === 'string' && imageSource.length <= 2 && !imageSource.includes('/');
                          
                          return isEmoji ? (
                            <div className="text-4xl">{imageSource}</div>
                          ) : (
                            <img 
                              src={imageSource} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          );
                        })()}
                      </div>
                      <div className="absolute top-1 right-1">
                        <Badge className={`${getRarityColor(product.rarity)} flex items-center gap-1 text-xs`}>
                          {getRarityIcon(product.rarity)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="mb-2">
                        <h3 className="font-bold text-foreground text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-primary">{product.price}</span>
                          <span className="text-xs text-muted-foreground">Beetz</span>
                        </div>
                        <Badge variant="outline" className="text-xs">Nv {product.level_required}</Badge>
                      </div>
                      
                      {isOwned ? (
                        <Button variant="secondary" className="w-full text-xs py-1 h-8" disabled>
                          ✅ {t('store.buttons.owns')}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => purchaseItem(product, 'product')}
                          disabled={!canAfford || !meetsLevel || purchasing === product.id}
                          className="w-full text-xs py-1 h-8"
                          variant={canAfford && meetsLevel ? "default" : "outline"}
                        >
                          {purchasing === product.id ? "..." :
                           !meetsLevel ? `Nv ${product.level_required}` :
                           !canAfford ? "Sem Beetz" : "Comprar"
                          }
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            </ComingSoonOverlay>
          </TabsContent>

          {/* Lives Tab */}
          <TabsContent value="lives">
            <ComingSoonOverlay>
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" /> {t('store.livesProtection')}
                  </h2>
                  <p className="text-sm text-muted-foreground">{t('store.maintainStreak')}</p>
                </div>
              
              {/* Go to Lives Marketplace Card */}
              <Card 
                className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => navigate('/marketplace/lives')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{t('store.marketplaceLives')}</h3>
                      <p className="text-sm text-muted-foreground">{t('store.buyLivesKeepStreak')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <Shield className="w-3 h-3 mr-1" />
                          {t('store.savesStreak')}
                        </Badge>
                        <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                          <Zap className="w-3 h-3 mr-1" />
                          {t('store.multipliesBTZ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button 
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {t('store.viewLives')}
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Benefits Info */}
              <div className="grid grid-cols-1 gap-3">
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{t('store.streakProtection')}</h4>
                      <p className="text-xs text-muted-foreground">{t('store.useLifeKeepStreak')}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Gem className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{t('store.keepMultipliers')}</h4>
                      <p className="text-xs text-muted-foreground">{t('store.preserveBTZMultipliers')}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{t('store.continueWithoutStop')}</h4>
                      <p className="text-xs text-muted-foreground">{t('store.dontLoseMomentum')}</p>
                    </div>
                  </div>
                </Card>
                </div>
              </div>
            </ComingSoonOverlay>
          </TabsContent>

          {/* Beetz Tab */}
          <TabsContent value="beetz">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                  <BeetzIcon size="lg" /> {t('store.beetzPackages')}
                </h2>
                <p className="text-sm text-muted-foreground">{t('store.buyBeetzReal')}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {products.filter(p => p.category === 'beetz').map((beetzPackage) => {
                  const beetzAmount = beetzPackage.effects?.beetz_amount || 0;
                  const priceInReais = beetzPackage.price / 100; // Convert from centavos to reais
                  
                  return (
                    <Card key={beetzPackage.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Estilo igual ao Dashboard BTZ Card */}
                            <div className="w-8 h-8 rounded-full bg-[#adff2f] flex items-center justify-center">
                              <span className="text-black font-bold text-lg">B</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground font-mono text-lg">
                                {beetzAmount.toLocaleString()} BTZ
                              </h3>
                              <p className="text-sm text-muted-foreground">{beetzPackage.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getRarityColor(beetzPackage.rarity)} text-xs`}>
                                  {getRarityIcon(beetzPackage.rarity)}
                                  {beetzPackage.rarity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary mb-1">
                              R$ {priceInReais.toFixed(2)}
                            </div>
                            <Button
                              onClick={() => handleBeetzPurchaseClick(
                                beetzAmount, 
                                priceInReais, 
                                beetzPackage.name
                              )}
                              disabled={purchasing === `beetz-${beetzAmount}`}
                              className="w-full"
                              size="sm"
                            >
                              {purchasing === `beetz-${beetzAmount}` ? "..." : t('store.buy')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <h3 className="font-bold text-foreground mb-2">🔒 {t('store.securePayment')}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('store.processedStripe')}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>SSL • Criptografia 256-bit • PCI DSS</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <FloatingNavbar />
      
      {/* Beetz Purchase Modal */}
      <Dialog open={showBeetzModal} onOpenChange={setShowBeetzModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>💎 {t('store.buyBeetz')}</DialogTitle>
            <DialogDescription>
              {t('store.notEnoughBeetz')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    handleBeetzPurchaseClick(20, 2, "Pacote Básico");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">20 Beetz</div>
                  <div className="text-sm text-muted-foreground">{t('store.basicPackage')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 2,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-20'}
                  >
                    {purchasing === 'beetz-20' ? '...' : t('store.buy')}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    handleBeetzPurchaseClick(50, 4, "Pacote Popular");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">50 Beetz</div>
                  <div className="text-sm text-muted-foreground">{t('store.popularPackage')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 4,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-50'}
                  >
                    {purchasing === 'beetz-50' ? '...' : t('store.buy')}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    handleBeetzPurchaseClick(100, 7, "Pacote Premium");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">100 Beetz</div>
                  <div className="text-sm text-muted-foreground">{t('store.premiumPackage')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 7,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-100'}
                  >
                    {purchasing === 'beetz-100' ? '...' : t('store.buy')}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => {
                    handleBeetzPurchaseClick(500, 50, "Pacote Supremo");
                    setShowBeetzModal(false);
                  }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">500 Beetz</div>
                  <div className="text-sm text-muted-foreground">{t('store.supremePackage')}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">R$ 50,00</div>
                  <Button 
                    size="sm" 
                    disabled={purchasing === 'beetz-500'}
                  >
                    {purchasing === 'beetz-500' ? '...' : t('store.buy')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Selector Dialog */}
      <Dialog open={showPaymentSelector} onOpenChange={setShowPaymentSelector}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedBeetzPackage && (
            <PaymentMethodSelector 
              onPaymentMethodSelect={handlePaymentMethodSelect}
              isLoading={purchasing !== null || cryptoLoading}
              amount={selectedBeetzPackage.price * 100} // Convert to cents
              productName={`${selectedBeetzPackage.name} - ${selectedBeetzPackage.amount} Beetz`}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Crypto Checkout Dialog */}
      <Dialog open={showCryptoCheckout} onOpenChange={setShowCryptoCheckout}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {cryptoPaymentData && (
            <CryptoCheckout
              paymentData={cryptoPaymentData}
              productName={cryptoPaymentData.productName}
              originalAmount={cryptoPaymentData.originalAmount}
              onBack={handleCryptoCheckoutBack}
              onSuccess={handleCryptoSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
