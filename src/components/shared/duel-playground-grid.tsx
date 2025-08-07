import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { useNavigate } from "react-router-dom";
import { IconSystem } from "@/components/icons/icon-system";
import { useI18n } from "@/hooks/use-i18n";

// Import cyberpunk images
import duelCyberpunk from "@/assets/duel-cyberpunk-3d.jpg";
import playgroundCyberpunk from "@/assets/playground-cyberpunk-3d.jpg";

export function DuelPlaygroundGrid() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Duel Card */}
      <Card className="relative overflow-hidden border border-border shadow-card group hover:scale-105 transition-transform duration-200">
        <div className="absolute inset-0">
          <img 
            src={duelCyberpunk} 
            alt="Duelo Cyberpunk" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/60 to-transparent" />
        </div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground text-lg">{t('duels.financialDuel')}</h4>
            <span className="text-xs text-primary font-bold bg-primary/20 px-2 py-1 rounded">
              {t('common.available')}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.duelDescription')}
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
            <div>
              <div className="text-experience font-bold">75 XP</div>
              <div className="text-muted-foreground">Ganhe</div>
            </div>
            <div>
              <div className="text-beetz font-bold">150</div>
              <div className="text-muted-foreground">Beetz</div>
            </div>
            <div>
              <IconSystem emoji="⚔️" size="lg" animated variant="glow" />
              <div className="text-muted-foreground">Troféu</div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-destructive to-warning text-white rounded-full font-semibold shadow-glow"
            onClick={() => navigate('/find-opponent')}
          >
            {t('duels.duelNow')}
          </Button>
        </div>
      </Card>

      {/* Playground Card */}
      <Card className="relative overflow-hidden border border-border shadow-card group hover:scale-105 transition-transform duration-200">
        <div className="absolute inset-0">
          <img 
            src={playgroundCyberpunk} 
            alt="Playground Cyberpunk" 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/60 to-transparent" />
        </div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground text-lg">{t('common.playground')}</h4>
            <span className="text-xs text-success font-bold bg-success/20 px-2 py-1 rounded">
              {t('common.new')}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {t('dashboard.playgroundDescription')}
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
            <div>
              <div className="text-primary font-bold">Carteiras</div>
              <div className="text-muted-foreground">Pratique</div>
            </div>
            <div>
              <div className="text-secondary font-bold">Outros</div>
              <div className="text-muted-foreground">Siga</div>
            </div>
            <div>
              <IconSystem emoji="📈" size="lg" animated variant="glow" />
              <div className="text-muted-foreground">Aprenda</div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-secondary to-primary text-black rounded-full font-semibold shadow-glow"
            onClick={() => navigate('/playground')}
          >
            {t('common.explore')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
