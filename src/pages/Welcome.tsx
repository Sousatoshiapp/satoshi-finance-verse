import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Shield } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useI18n();

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

      {/* Content */}
      <div className="relative z-10 min-h-screen pb-20">
        <div className="px-4 pt-8 pb-4">
          <div className="container mx-auto max-w-md">
          {/* App Logo/Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/85640d9f-9c11-41ee-a94b-960e0cf9a946.png" 
                alt="Satoshi City Logo" 
                className="h-32 w-auto animate-pulse"
              />
            </div>
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {t('welcome.title')}
            </p>
            <div className="flex justify-center space-x-2 mb-8">
              <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs px-3 py-1">
                {t('welcome.badges.neuralSystem')}
              </Badge>
              <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs px-3 py-1">
                {t('welcome.badges.districts')}
              </Badge>
              <Badge variant="outline" className="border-pink-400 text-pink-400 text-xs px-3 py-1">
                {t('welcome.badges.multiplayer')}
              </Badge>
            </div>
          </div>

          {/* Auth Options */}
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/auth?mode=login')}
              className="w-full font-bold py-4 text-lg transition-all duration-300"
              style={{ backgroundColor: '#adff2f', color: '#000000' }}
            >
              <Shield className="mr-2 h-5 w-5" />
              {t('welcome.buttons.enterGame')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button 
              onClick={() => navigate('/auth?mode=signup')}
              variant="outline"
              className="w-full font-bold py-4 text-lg transition-all duration-300"
              style={{ borderColor: '#adff2f', color: '#adff2f' }}
            >
              <Users className="mr-2 h-5 w-5" />
              {t('welcome.buttons.createAccount')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
