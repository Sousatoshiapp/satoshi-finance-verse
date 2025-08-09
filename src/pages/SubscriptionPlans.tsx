import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { Check, Star, Crown, ArrowLeft, Zap, Shield, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionPlan {
  tier: 'free' | 'pro' | 'elite';
  name: string;
  description: string;
  price_monthly: number;
  features: string[];
  id: string;
  is_active: boolean;
  price_yearly: number;
  created_at: string;
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentTier, setCurrentTier] = useState<'free' | 'pro' | 'elite'>('free');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadPlansAndCurrentTier();
  }, []);

  const loadPlansAndCurrentTier = async () => {
    try {
      // Load subscription plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (plansData) {
        const transformedPlans = plansData.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) 
            ? plan.features.map(f => String(f)) 
            : [],
          description: plan.description || '',
          is_active: plan.is_active || false,
          price_yearly: plan.price_yearly || 0
        }));
        setPlans(transformedPlans);
      }

      // Load current user tier
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setCurrentTier(profile.subscription_tier || 'free');
        }
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSubscribe = async (tier: 'pro' | 'elite') => {
    if (currentTier === tier) {
      toast({
        title: "Você já tem este plano",
        description: "Este é seu plano atual ativo.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'pro': return <Star className="w-6 h-6 text-yellow-500" />;
      case 'elite': return <Crown className="w-6 h-6 text-purple-500" />;
      default: return <Shield className="w-6 h-6 text-blue-500" />;
    }
  };

  const getPlanBadge = (tier: string) => {
    switch (tier) {
      case 'pro': return <Badge className="bg-yellow-500 text-black">⭐ POPULAR</Badge>;
      case 'elite': return <Badge className="bg-purple-500 text-white">💎 PREMIUM</Badge>;
      default: return null;
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'pb-24' : 'pb-20'}`} 
         style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
      {/* Header - Enhanced mobile spacing */}
      <div className={`${isMobile ? 'px-6 pt-18 pb-6' : 'px-4 pt-8 pb-6'}`}>
        <div className={`mx-auto ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Escolha seu Plano
            </h1>
            <p className="text-muted-foreground text-lg">
              Desbloqueie todo o potencial de Satoshi City
            </p>
          </div>

          {/* Plans Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.tier}
                className={`relative ${
                  currentTier === plan.tier 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : plan.tier === 'pro' 
                      ? 'border-yellow-500/30' 
                      : plan.tier === 'elite'
                        ? 'border-purple-500/30'
                        : 'border-border'
                } ${plan.tier === 'elite' ? 'md:scale-105 order-first md:order-none' : ''}`}
              >
                {plan.tier === 'elite' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      RECOMENDADO
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    {getPlanIcon(plan.tier)}
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    {getPlanBadge(plan.tier)}
                  </div>

                  <div className="py-4">
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">
                      {plan.price_monthly === 0 ? 'Grátis' : formatPrice(plan.price_monthly)}
                    </div>
                    {plan.price_monthly > 0 && (
                      <div className="text-sm text-muted-foreground">/mês</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    {currentTier === plan.tier ? (
                      <Button className="w-full" disabled>
                        <Trophy className="w-4 h-4 mr-2" />
                        Plano Atual
                      </Button>
                    ) : plan.tier === 'free' ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/dashboard')}
                      >
                        Continuar Grátis
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full ${
                          plan.tier === 'pro' 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        }`}
                        onClick={() => handleSubscribe(plan.tier as 'pro' | 'elite')}
                        disabled={loading}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {loading ? 'Processando...' : 'Assinar Agora'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Comparison - Mobile Optimized */}
          <div className="mt-8 sm:mt-12">
            <h2 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-8">Compare os Benefícios</h2>
            
            <Card>
              <CardContent className="p-3 sm:p-6">
                {/* Mobile: Show key benefits only */}
                <div className="block md:hidden">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
                      <div className="text-blue-500">FREE</div>
                      <div className="text-yellow-500">PRO</div>
                      <div className="text-purple-500">ELITE</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-1 text-xs items-center">
                        <div className="text-left text-muted-foreground">Duelos</div>
                        <div className="text-center">10/dia</div>
                        <div className="text-center">∞</div>
                        <div className="text-center">∞</div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs items-center">
                        <div className="text-left text-muted-foreground">XP</div>
                        <div className="text-center">1x</div>
                        <div className="text-center">2x</div>
                        <div className="text-center">3x</div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs items-center">
                        <div className="text-left text-muted-foreground">Beetz</div>
                        <div className="text-center">0</div>
                        <div className="text-center">50</div>
                        <div className="text-center">100</div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs items-center">
                        <div className="text-left text-muted-foreground">AI Advisor</div>
                        <div className="text-center">❌</div>
                        <div className="text-center">❌</div>
                        <div className="text-center">✅</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop: Full comparison */}
                <div className="hidden md:grid md:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Funcionalidades</h3>
                    <div className="space-y-3 text-sm">
                      <div>Duelos diários</div>
                      <div>Multiplicador XP</div>
                      <div>Beetz mensais</div>
                      <div>Avatares especiais</div>
                      <div>Sem anúncios</div>
                      <div>AI Trading Advisor</div>
                      <div>Suporte prioritário</div>
                    </div>
                  </div>

                  <div className="space-y-4 text-center">
                    <h3 className="font-semibold text-blue-500">
                      <Shield className="w-4 h-4 inline mr-1" />
                      FREE
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>10 por dia</div>
                      <div>1x</div>
                      <div>0</div>
                      <div>Básicos</div>
                      <div>❌</div>
                      <div>❌</div>
                      <div>❌</div>
                    </div>
                  </div>

                  <div className="space-y-4 text-center">
                    <h3 className="font-semibold text-yellow-500">
                      <Star className="w-4 h-4 inline mr-1" />
                      PRO
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>Ilimitados</div>
                      <div>2x</div>
                      <div>50</div>
                      <div>Exclusivos ⭐</div>
                      <div>✅</div>
                      <div>❌</div>
                      <div>✅</div>
                    </div>
                  </div>

                  <div className="space-y-4 text-center">
                    <h3 className="font-semibold text-purple-500">
                      <Crown className="w-4 h-4 inline mr-1" />
                      ELITE
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>Ilimitados</div>
                      <div>3x</div>
                      <div>100</div>
                      <div>Lendários 💎</div>
                      <div>✅</div>
                      <div>✅</div>
                      <div>✅</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-12 text-center">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Perguntas Frequentes</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Posso cancelar a qualquer momento? Sim, sem taxas de cancelamento.</p>
                  <p>• Os benefícios são aplicados imediatamente? Sim, assim que o pagamento for confirmado.</p>
                  <p>• Posso fazer downgrade? Sim, as mudanças entram em vigor no próximo ciclo.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}
