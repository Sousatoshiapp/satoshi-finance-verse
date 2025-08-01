import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { ArrowLeft, Settings, Zap, Users, Trophy, Gamepad2 } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export default function GameMode() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hologramRotation, setHologramRotation] = useState(0);

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
          navigate('/solo-quiz');
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

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            {t('gameMode.title')}
          </h1>
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
                onClick={() => handleModeSelect('torneio')}
                variant={selectedMode === 'torneio' ? 'default' : 'outline'}
                className="w-full py-4 text-base font-medium"
                disabled={selectedMode !== null}
              >
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="h-5 w-5" />
                  {t('gameMode.tournament')}
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
