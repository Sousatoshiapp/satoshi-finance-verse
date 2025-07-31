import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, Star, Zap, Gift, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SponsorActivationBannerProps {
  district: {
    id: string;
    name: string;
    sponsor_company: string;
    sponsor_logo_url: string;
    referral_link: string;
    color_primary: string;
    color_secondary: string;
    theme: string;
  };
  className?: string;
}

export function SponsorActivationBanner({ district, className = "" }: SponsorActivationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const trackBannerInteraction = async (action: 'view' | 'click' | 'close') => {
    try {
      await supabase.from('district_analytics').insert({
        district_id: district.id,
        metric_type: 'sponsor_banner_interaction',
        metric_value: 1,
        metric_data: {
          action,
          sponsor: district.sponsor_company,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Erro ao rastrear interação:', error);
    }
  };

  useEffect(() => {
    // Track banner view on mount
    trackBannerInteraction('view');
  }, []);

  const handleSponsorClick = () => {
    setHasInteracted(true);
    trackBannerInteraction('click');
    
    if (district.referral_link) {
      window.open(district.referral_link, '_blank');
    }
  };

  const getSponsorCTA = () => {
    switch (district.sponsor_company) {
      case 'XP Investimentos':
        return {
          title: 'Oferta Exclusiva XP!',
          subtitle: 'Conta digital gratuita + R$ 25 de bônus',
          highlight: 'OFERTA LIMITADA',
          icon: TrendingUp
        };
      case 'Ânima Educação':
        return {
          title: 'Educação de Elite!',
          subtitle: 'Desconto especial em cursos premium',
          highlight: '50% OFF',
          icon: Sparkles
        };
      default:
        return {
          title: 'Oferta Especial!',
          subtitle: 'Benefícios exclusivos para residentes',
          highlight: 'EXCLUSIVO',
          icon: Gift
        };
    }
  };

  const sponsorData = getSponsorCTA();
  const IconComponent = sponsorData.icon;

  if (!isVisible || !district.sponsor_company) return null;

  return (
    <div className={`sticky top-0 z-40 ${className}`}>
      <Card 
        className="relative overflow-hidden border-0 rounded-none md:rounded-lg md:mx-4 mb-6 shadow-2xl animate-fade-in"
        style={{
          background: `linear-gradient(135deg, ${district.color_primary}15, ${district.color_secondary}10)`,
          borderTop: `4px solid ${district.color_primary}`
        }}
      >
        {/* Animated Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${district.color_primary} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        
        {/* Glow Effect */}
        <div 
          className="absolute -top-1 left-0 right-0 h-1 opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${district.color_primary}, transparent)`,
            filter: 'blur(2px)'
          }}
        />

        <div className="relative p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            {/* Sponsor Logo */}
            <div className="flex-shrink-0">
              <div 
                className="w-16 h-16 md:w-20 md:h-20 rounded-full p-2 border-2 bg-white/10 backdrop-blur-sm flex items-center justify-center"
                style={{ borderColor: district.color_primary }}
              >
                {district.sponsor_logo_url ? (
                  <img 
                    src={district.sponsor_logo_url}
                    alt={district.sponsor_company}
                    className="w-full h-full object-contain rounded-full"
                  />
                ) : (
                  <IconComponent 
                    className="w-8 h-8 md:w-10 md:h-10"
                    style={{ color: district.color_primary }}
                  />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <Badge 
                  variant="secondary"
                  className="text-xs font-bold px-2 py-1 animate-pulse"
                  style={{ 
                    backgroundColor: district.color_primary,
                    color: 'white'
                  }}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {sponsorData.highlight}
                </Badge>
                <span className="text-sm text-gray-400">
                  Parceiro oficial do {district.name}
                </span>
              </div>
              
              <h3 
                className="text-xl md:text-2xl font-bold mb-1"
                style={{ color: district.color_primary }}
              >
                {sponsorData.title}
              </h3>
              
              <p className="text-gray-300 text-sm md:text-base mb-3">
                {sponsorData.subtitle}
              </p>

              {/* Mobile CTA Button */}
              <div className="md:hidden">
                <Button
                  onClick={handleSponsorClick}
                  className="w-full text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${district.color_primary}, ${district.color_secondary})`,
                    boxShadow: `0 4px 20px ${district.color_primary}40`
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  APROVEITAR OFERTA
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Desktop CTA Button */}
            <div className="hidden md:flex flex-col items-end gap-2">
              <Button
                onClick={handleSponsorClick}
                className="text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${district.color_primary}, ${district.color_secondary})`,
                  boxShadow: `0 4px 20px ${district.color_primary}40`
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                APROVEITAR OFERTA
                <Zap className="w-4 h-4 ml-2" />
              </Button>
              
              {hasInteracted && (
                <span className="text-xs text-green-400 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Obrigado pelo interesse!
                </span>
              )}
            </div>
          </div>

          {/* Progress Indicator for Limited Offers */}
          {sponsorData.highlight.includes('LIMITADA') && (
            <div className="mt-4 md:mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Oferta válida por tempo limitado</span>
                <span>87% das vagas preenchidas</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    background: `linear-gradient(90deg, ${district.color_primary}, ${district.color_secondary})`,
                    width: '87%',
                    boxShadow: `0 0 10px ${district.color_primary}60`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsVisible(false);
            trackBannerInteraction('close');
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-white w-8 h-8 p-0"
        >
          ×
        </Button>
      </Card>
    </div>
  );
}