import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { IconSystem } from "@/components/icons/icon-system";

// Import cyberpunk images
import duelCyberpunk from "@/assets/duel-cyberpunk-3d.jpg";
import playgroundCyberpunk from "@/assets/playground-cyberpunk-3d.jpg";

export function DuelPlaygroundGrid() {
  const navigate = useNavigate();

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
            <h4 className="font-semibold text-foreground text-lg">Duelo Financeiro</h4>
            <span className="text-xs text-primary font-bold bg-primary/20 px-2 py-1 rounded">
              DISPONÍVEL
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Desafie outros jogadores em batalhas épicas de conhecimento financeiro
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
            Duelar Agora
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
            <h4 className="font-semibold text-foreground text-lg">Playground</h4>
            <span className="text-xs text-success font-bold bg-success/20 px-2 py-1 rounded">
              NOVO!
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Pratique investimentos, siga outros jogadores e construa seu império
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
            Explorar
          </Button>
        </div>
      </Card>
    </div>
  );
}