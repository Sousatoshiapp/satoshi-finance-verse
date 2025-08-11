import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { ArrowLeft, Settings, User, Users } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeSelectionModal } from "@/components/features/quiz/theme-selection-modal";

export default function GameMode() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hologramRotation, setHologramRotation] = useState(0);
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHologramRotation(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleModeSelect = (mode: 'solo' | 'duelo' | 'torneio') => {
    console.log('🎮 Modo selecionado:', mode);
    setSelectedMode(mode);
    setTimeout(() => {
      switch (mode) {
        case 'solo':
          console.log('🎯 Abrindo modal de temas...');
          setShowThemeModal(true);
          break;
        case 'duelo':
          console.log('🥊 Navegando para duelo...');
          navigate('/find-opponent');
          break;
        case 'torneio':
          console.log('🏆 Navegando para torneios...');
          navigate('/tournaments');
          break;
      }
    }, 300);
  };

  const handleThemeSelect = (category: string) => {
    console.log('🎨 Tema selecionado:', category);
    // Navegar para o novo sistema de quiz com categoria e modo adaptativo
    const url = `/quiz/solo?category=${encodeURIComponent(category)}&mode=adaptive`;
    console.log('🚀 Navegando para:', url);
    navigate(url);
  };

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center ${isMobile ? 'pb-16' : 'pb-20'}`} 
         style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 8px)' } : {}}>
      <div className={`mx-auto ${isMobile ? 'max-w-sm px-4' : 'max-w-md px-4'}`}>
        {/* Header simplificado */}
        <div className="flex items-center justify-start mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Game Mode Selection */}
        <Card className="mb-6 bg-transparent border border-white/30 shadow-2xl shadow-white/10 ring-2 ring-white/20">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="text-center mb-4">
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-white mb-2`}>
                Como você quer arrasar hoje?
              </h2>
              <p className="text-muted-foreground text-sm">
                Escolha seu estilo de jogo
              </p>
            </div>

            <div className="space-y-3">
              {/* Modo Solo */}
              <Button
                onClick={() => handleModeSelect('solo')}
                variant={selectedMode === 'solo' ? 'default' : 'outline'}
                className={`group w-full ${isMobile ? 'py-4 text-base' : 'py-6 text-lg'} font-semibold hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 bg-transparent border border-purple-400/60 hover:border-purple-400/80 ring-2 ring-purple-400/30 hover:ring-purple-400/50`}
                disabled={selectedMode !== null}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4 text-white" />
                  <span className="text-foreground">Solo Mission</span>
                </div>
              </Button>

              {/* Modo Duelo */}
              <Button
                onClick={() => handleModeSelect('duelo')}
                variant={selectedMode === 'duelo' ? 'default' : 'outline'}
                className={`group w-full ${isMobile ? 'py-4 text-base' : 'py-6 text-lg'} font-semibold hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 bg-transparent border border-pink-400/60 hover:border-pink-400/80 ring-2 ring-pink-400/30 hover:ring-pink-400/50`}
                disabled={selectedMode !== null}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-foreground">1 vs 1</span>
                </div>
              </Button>

              {/* Torneio */}
              <Button
                variant="outline"
                className={`w-full ${isMobile ? 'py-4 text-base' : 'py-6 text-lg'} font-semibold relative opacity-60 cursor-not-allowed bg-transparent border border-muted-foreground/30`}
                disabled={true}
              >
                <div className="flex items-center justify-center gap-4">
                  <span className="text-muted-foreground">Torneios</span>
                  <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-orange-400 to-yellow-400 text-black font-bold rounded-full border border-orange-300 shadow-lg shadow-orange-400/50 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px rgba(251,146,60,0.8))' }}>
                    Soon™
                  </span>
                </div>
              </Button>

              {/* Conectar Conceitos */}
              <Button
                onClick={() => navigate('/concept-connections?theme=basic_finance')}
                variant="outline"
                className={`group w-full ${isMobile ? 'py-4 text-base' : 'py-6 text-lg'} font-semibold hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 bg-transparent border border-cyan-400/60 hover:border-cyan-400/80 ring-2 ring-cyan-400/30 hover:ring-cyan-400/50`}
              >
                <div className="flex items-center justify-center gap-4">
                  <span className="text-foreground font-bold">Connect the Dots</span>
                  <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-cyan-400 to-blue-400 text-white rounded-full font-bold animate-pulse">
                    Fire
                  </span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Seleção de Tema */}
        <ThemeSelectionModal
          isOpen={showThemeModal}
          onClose={() => {
            setShowThemeModal(false);
            setSelectedMode(null);
          }}
          onSelectTheme={handleThemeSelect}
        />
      </div>
    </div>
  );
}
