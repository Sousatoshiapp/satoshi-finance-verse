import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { ArrowLeft, Settings, User, Users, Sword } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeSelectionModal } from "@/components/features/quiz/theme-selection-modal";
import { useUniversalPullRefresh } from "@/hooks/use-universal-pull-refresh";
import { MobilePullIndicator } from "@/components/shared/ui/mobile-pull-indicator";

export default function GameMode() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hologramRotation, setHologramRotation] = useState(0);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Pull to refresh functionality
  const {
    containerRef,
    isRefreshing,
    pullDistance,
    indicators,
    pullThreshold
  } = useUniversalPullRefresh({
    pullThreshold: 120
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setHologramRotation(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleModeSelect = (mode: 'solo' | 'duelo' | 'torneio' | 'battle-royale') => {
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
        case 'battle-royale':
          console.log('⚔️ Navegando para Battle Royale...');
          navigate('/battle-royale');
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
    <div className="relative">
      {/* Pull to refresh indicator */}
      {isMobile && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <MobilePullIndicator
            pullDistance={pullDistance}
            pullThreshold={pullThreshold}
            isRefreshing={isRefreshing}
          />
        </div>
      )}
      
      <div 
        ref={isMobile ? containerRef : undefined}
        className={`min-h-screen casino-futuristic overflow-hidden ${isMobile ? 'flex flex-col' : 'flex items-center justify-center'}`} 
        style={isMobile ? { 
          paddingTop: indicators.pullToRefresh 
            ? `${Math.max(Math.min(pullDistance, 60), 16)}px` 
            : 'env(safe-area-inset-top, 8px)',
          transition: 'padding-top 0.1s ease-out'
        } : {}}
      >
      {/* Cyber grid background */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none"></div>
      
      {/* Floating particles */}
      <div className="floating-particle particle-1"></div>
      <div className="floating-particle particle-2"></div>
      <div className="floating-particle particle-3"></div>
      <div className="floating-particle particle-4"></div>
      <div className="floating-particle particle-5"></div>

      {/* Main content with proper spacing */}
      <div className={`relative z-10 w-full ${isMobile ? 'flex-1 flex flex-col justify-center px-4 pb-24' : 'p-6'}`}>
        {/* Header with casino styling - Positioned at the very top */}
        <div className={`flex items-center justify-start ${isMobile ? 'mb-8' : 'mb-16'}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="casino-button border-purple-500/40 text-white bg-black/20 backdrop-blur-sm hover:bg-purple-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className={`${isMobile ? 'max-w-sm mx-auto' : 'max-w-md mx-auto'} ${isMobile ? 'space-y-3' : 'space-y-6'}`}>

          {/* Game Mode Selection with casino styling */}
          <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className={`${isMobile ? 'p-2' : 'p-3'}`}>
              <div className={`text-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
                <h2 className="text-sm font-bold text-white mb-2">
                  Como você quer arrasar hoje?
                </h2>
                <p className="text-muted-foreground text-xs">
                  Escolha seu estilo de jogo
                </p>
              </div>

              <div className={`grid grid-cols-2 ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
                {/* Modo Solo */}
                <button
                  onClick={() => handleModeSelect('solo')}
                  className={`group w-full ${isMobile ? 'p-1.5' : 'p-2'} rounded-lg border-2 transition-all duration-300 casino-topic-card shadow-lg shadow-purple-500/50 animate-pulse ${
                    selectedMode === 'solo'
                      ? 'casino-selected border-purple-500 bg-purple-500/20 text-white shadow-2xl shadow-purple-500/80'
                      : 'border-purple-500/30 bg-black/20 text-gray-300 casino-hover hover:border-purple-500/60 hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/80'
                  }`}
                  disabled={selectedMode !== null}
                >
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'gap-1' : 'gap-1.5'} ${isMobile ? 'py-1' : 'py-2'}`}>
                    <User className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-center">Solo Mission</span>
                  </div>
                </button>

                {/* Modo Duelo */}
                <button
                  onClick={() => handleModeSelect('duelo')}
                  className={`group w-full ${isMobile ? 'p-1.5' : 'p-2'} rounded-lg border-2 transition-all duration-300 casino-topic-card shadow-lg shadow-pink-500/50 animate-pulse ${
                    selectedMode === 'duelo'
                      ? 'casino-selected border-pink-500 bg-pink-500/20 text-white shadow-2xl shadow-pink-500/80'
                      : 'border-pink-500/30 bg-black/20 text-gray-300 casino-hover hover:border-pink-500/60 hover:bg-pink-500/10 hover:shadow-lg hover:shadow-pink-500/80'
                  }`}
                  disabled={selectedMode !== null}
                >
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'gap-1' : 'gap-1.5'} ${isMobile ? 'py-1' : 'py-2'}`}>
                    <Users className="h-3 w-3 text-white" />
                    <span className="text-xs font-medium text-center">Multiplayer</span>
                  </div>
                </button>

                {/* Torneio */}
                <button
                  className={`w-full ${isMobile ? 'p-1.5' : 'p-2'} rounded-lg border-2 relative opacity-60 cursor-not-allowed bg-black/20 border-muted-foreground/30`}
                  disabled={true}
                >
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'gap-1' : 'gap-1.5'} ${isMobile ? 'py-1' : 'py-2'}`}>
                    <span className="text-xs text-muted-foreground text-center">Torneios</span>
                    <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-orange-400 to-yellow-400 text-black font-bold rounded-full border border-orange-300 shadow-lg shadow-orange-400/50 animate-pulse" style={{ filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.8))' }}>
                      Soon™
                    </span>
                  </div>
                </button>

                {/* Battle Royale */}
                <button
                  className={`w-full ${isMobile ? 'p-1.5' : 'p-2'} rounded-lg border-2 relative opacity-60 cursor-not-allowed bg-black/20 border-muted-foreground/30`}
                  disabled={true}
                >
                  <div className={`flex flex-col items-center justify-center ${isMobile ? 'gap-1' : 'gap-1.5'} ${isMobile ? 'py-1' : 'py-2'}`}>
                    <Sword className="h-3 w-3 text-muted-foreground opacity-60" />
                    <span className="text-xs text-muted-foreground text-center">Battle Royale</span>
                    <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-orange-400 to-yellow-400 text-black font-bold rounded-full border border-orange-300 shadow-lg shadow-orange-400/50 animate-pulse" style={{ filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.8))' }}>
                      Soon™
                    </span>
                  </div>
                </button>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
