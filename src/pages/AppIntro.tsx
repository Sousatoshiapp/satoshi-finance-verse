import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { ArrowRight, Cpu, Gamepad2, Coins, Users, Zap, Globe } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppIntro() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const features = [
    {
      icon: Gamepad2,
      title: t('intro.features.gaming.title'),
      description: t('intro.features.gaming.description'),
      color: 'text-cyan-400'
    },
    {
      icon: Coins,
      title: t('intro.features.crypto.title'),
      description: t('intro.features.crypto.description'),
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      title: t('intro.features.social.title'),
      description: t('intro.features.social.description'),
      color: 'text-purple-400'
    },
    {
      icon: Globe,
      title: t('intro.features.districts.title'),
      description: t('intro.features.districts.description'),
      color: 'text-green-400'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/7e6ff88b-c066-483e-9f80-3a3f362f67ac.png')] bg-cover bg-center bg-no-repeat opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-transparent to-slate-900/70"></div>
        {/* Glowing particles effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center">
        <div className={`w-full ${isMobile ? 'px-6 py-8' : 'px-8 py-12'} max-w-4xl mx-auto`}>
          
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/lovable-uploads/85640d9f-9c11-41ee-a94b-960e0cf9a946.png" 
                  alt="Satoshi City Logo" 
                  className={`w-auto animate-pulse ${isMobile ? 'h-20' : 'h-28'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
              </div>
            </div>
            
            <h1 className={`font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
              {t('intro.welcome.title')}
            </h1>
            
            <p className={`text-muted-foreground mb-6 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {t('intro.welcome.subtitle')}
            </p>

            <div className="flex justify-center mb-8">
              <Badge 
                variant="outline" 
                className="border-cyan-400 text-cyan-400 px-4 py-2 text-sm animate-pulse"
              >
                <Cpu className="w-4 h-4 mr-2" />
                {t('intro.welcome.badge')}
              </Badge>
            </div>
          </div>

          {/* Features Grid */}
          <div className={`grid gap-6 mb-12 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-card/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                <h3 className={`font-bold mb-2 text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '800ms' }}>
            <h2 className={`font-bold text-white mb-6 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {t('intro.cta.title')}
            </h2>
            
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row justify-center space-x-4'}`}>
              <Button 
                onClick={() => navigate('/welcome')}
                className={`font-bold transition-all duration-300 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 ${isMobile ? 'py-3 text-base min-h-[48px]' : 'py-4 text-lg px-8'}`}
              >
                <Zap className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {t('intro.cta.start')}
                <ArrowRight className={`ml-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </Button>

              {!isMobile && (
                <Button 
                  onClick={() => navigate('/welcome')}
                  variant="outline"
                  className="font-bold transition-all duration-300 border-white/20 text-white hover:bg-white/10 py-4 text-lg px-8"
                >
                  {t('intro.cta.skip')}
                </Button>
              )}
            </div>

            {isMobile && (
              <Button 
                onClick={() => navigate('/welcome')}
                variant="ghost"
                className="text-muted-foreground text-sm underline"
              >
                {t('intro.cta.skip')}
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '1000ms' }}>
            <p className="text-muted-foreground text-sm">
              {t('intro.footer.text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}