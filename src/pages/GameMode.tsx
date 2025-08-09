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
    setSelectedMode(mode);
    setTimeout(() => {
      switch (mode) {
        case 'solo':
          setShowThemeModal(true);
          break;
        case 'duelo':
          navigate('/find-opponent');
          break;
        case 'torneio':
          navigate('/tournaments');
          break;
      }
    }, 300);
  };

  const handleThemeSelect = (theme: string) => {
    navigate(`/solo-quiz?theme=${theme}`);
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
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('gameMode.selectMode')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('gameMode.chooseHow')}
              </p>
            </div>

            <div className="space-y-4">
              {/* Modo Solo */}
              <Button
                onClick={() => handleModeSelect('solo')}
                variant={selectedMode === 'solo' ? 'default' : 'outline'}
                className="w-full py-4 text-base font-medium"
                disabled={selectedMode !== null}
              >
                <div className="flex items-center justify-center gap-3">
                  <Gamepad2 className="h-5 w-5" />
                  {t('gameMode.solo')}
                </div>
              </Button>

              {/* Modo Duelo */}
              <Button
                onClick={() => handleModeSelect('duelo')}
                variant={selectedMode === 'duelo' ? 'default' : 'outline'}
                className="w-full py-4 text-base font-medium"
                disabled={selectedMode !== null}
              >
                <div className="flex items-center justify-center gap-3">
                  <Users className="h-5 w-5" />
                  {t('gameMode.duel')}
                </div>
              </Button>

              {/* Torneio */}
              <Button
                variant="outline"
                className="w-full py-4 text-base font-medium relative opacity-75 cursor-not-allowed border-dashed"
                disabled={true}
              >
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="h-5 w-5 opacity-60" />
                  {t('gameMode.tournament')}
                  <span className="ml-2 px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                    {t('common.comingSoon')}
                  </span>
                </div>
              </Button>

              {/* Conectar Conceitos */}
              <Button
                onClick={() => navigate('/concept-connections?theme=basic_finance')}
                variant="outline"
                className="w-full py-4 text-base font-medium bg-black border-black hover:bg-gray-800 text-white"
              >
                <div className="flex items-center justify-center gap-3">
                  <Zap className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">Conectar Conceitos</span>
                  <span className="px-2 py-1 text-xs bg-white text-black rounded-full">Novo</span>
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
