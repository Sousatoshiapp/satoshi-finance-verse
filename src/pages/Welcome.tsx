import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { ArrowRight, Users, Shield } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cyberpunk Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(/lovable-uploads/7e6ff88b-c066-483e-9f80-3a3f362f67ac.png)`,
          filter: 'brightness(0.4) contrast(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70"></div>
      </div>

      {/* Content - Centralized for mobile */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className={`w-full ${isMobile ? 'px-6 py-8' : 'px-4 py-12'} max-w-md mx-auto`}>
          {/* App Logo/Title */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex justify-center mb-4 lg:mb-6">
              <img 
                src="/lovable-uploads/85640d9f-9c11-41ee-a94b-960e0cf9a946.png" 
                alt="Satoshi City Logo" 
                className={`w-auto animate-pulse ${isMobile ? 'h-24' : 'h-32'}`}
              />
            </div>
            <p className={`text-muted-foreground mb-6 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {t('welcome.title')}
            </p>
            
            {/* Responsive badges layout */}
            <div className={`flex justify-center mb-6 lg:mb-8 ${isMobile ? 'flex-wrap gap-2' : 'space-x-2'}`}>
              <Badge variant="outline" className={`border-cyan-400 text-cyan-400 ${isMobile ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1'}`}>
                {t('welcome.badges.neuralSystem')}
              </Badge>
              <Badge variant="outline" className={`border-purple-400 text-purple-400 ${isMobile ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1'}`}>
                {t('welcome.badges.districts')}
              </Badge>
              <Badge variant="outline" className={`border-pink-400 text-pink-400 ${isMobile ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1'}`}>
                {t('welcome.badges.multiplayer')}
              </Badge>
            </div>
          </div>

          {/* Auth Options with optimal touch targets */}
          <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
            <Button 
              onClick={() => navigate('/auth?mode=login')}
              className={`w-full font-bold transition-all duration-300 ${isMobile ? 'py-3 text-base min-h-[48px]' : 'py-4 text-lg'}`}
              style={{ backgroundColor: '#adff2f', color: '#000000' }}
            >
              <Shield className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {t('welcome.buttons.enterGame')}
              <ArrowRight className={`ml-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>

            <Button 
              onClick={() => navigate('/auth?mode=signup')}
              variant="outline"
              className={`w-full font-bold transition-all duration-300 ${isMobile ? 'py-3 text-base min-h-[48px]' : 'py-4 text-lg'}`}
              style={{ borderColor: '#adff2f', color: '#adff2f' }}
            >
              <Users className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {t('welcome.buttons.createAccount')}
              <ArrowRight className={`ml-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
