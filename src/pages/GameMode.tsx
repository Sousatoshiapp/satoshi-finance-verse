import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { ArrowLeft, Settings, Zap, Users, Trophy, Gamepad2 } from "lucide-react";
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
    <div className={`min-h-screen bg-background flex items-center justify-center ${isMobile ? 'pb-24' : 'pb-20'}`} 
         style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
      <div className={`mx-auto ${isMobile ? 'max-w-sm px-6' : 'max-w-md px-4'}`}>
        {/* Header com apenas botões de navegação */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div></div> {/* Espaço vazio onde estava o título */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="text-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Game Mode Selection */}
        <Card className="mb-8 backdrop-blur-xl bg-background/30 border border-white/10 shadow-2xl shadow-purple-500/20">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">
                Como você quer arrasar hoje?
              </h2>
              <p className="text-muted-foreground text-base">
                Escolha seu estilo de jogo
              </p>
            </div>

            <div className="space-y-5">
              {/* Modo Solo */}
              <Button
                onClick={() => handleModeSelect('solo')}
                variant={selectedMode === 'solo' ? 'default' : 'outline'}
                className="group w-full py-6 text-lg font-semibold hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 bg-transparent border-purple-400/30 hover:border-purple-400/60"
                disabled={selectedMode !== null}
              >
                <div className="flex items-center justify-center gap-4">
                  <Gamepad2 className="h-6 w-6 group-hover:scale-110 transition-transform text-purple-400" />
                  <span className="text-foreground">Solo Mission</span>
                </div>
              </Button>

              {/* Modo Duelo */}
              <Button
                onClick={() => handleModeSelect('duelo')}
                variant={selectedMode === 'duelo' ? 'default' : 'outline'}
                className="group w-full py-6 text-lg font-semibold hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 bg-transparent border-pink-400/30 hover:border-pink-400/60"
                disabled={selectedMode !== null}
              >
                <div className="flex items-center justify-center gap-4">
                  <Users className="h-6 w-6 group-hover:scale-110 transition-transform text-pink-400" />
                  <span className="text-foreground">1v1 Me Bro</span>
                </div>
              </Button>

              {/* Torneio */}
              <Button
                variant="outline"
                className="w-full py-6 text-lg font-semibold relative opacity-60 cursor-not-allowed border-dashed border-muted-foreground/30 bg-muted/20"
                disabled={true}
              >
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="h-6 w-6 opacity-50 text-muted-foreground" />
                  <span className="text-muted-foreground">Torneios</span>
                  <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 rounded-full border border-orange-400/30">
                    Soon™
                  </span>
                </div>
              </Button>

              {/* Conectar Conceitos */}
              <Button
                onClick={() => navigate('/concept-connections?theme=basic_finance')}
                variant="outline"
                className="group w-full py-6 text-lg font-semibold hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 bg-transparent border-cyan-400/40 hover:border-cyan-400/70"
              >
                <div className="flex items-center justify-center gap-4">
                  <Zap className="h-6 w-6 group-hover:scale-110 transition-transform text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  <span className="text-foreground font-bold">Connect the Dots</span>
                  <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-cyan-400 to-blue-400 text-black rounded-full font-bold animate-pulse">
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
          onClose={() => setShowThemeModal(false)}
          onSelectTheme={handleThemeSelect}
        />
      </div>
    </div>
  );
}
