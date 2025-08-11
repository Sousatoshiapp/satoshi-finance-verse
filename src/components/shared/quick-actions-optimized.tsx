import { memo, useMemo, useCallback, useState } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Zap, 
  BookOpen, 
  Target 
} from "@/components/icons/optimized-icons";
import { useNavigate } from "react-router-dom";
import { useRenderPerformance } from "@/hooks/use-performance-monitor";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
  bgGradient: string;
}

const QuickActionsOptimized = memo(function QuickActionsOptimized() {
  useRenderPerformance('QuickActionsOptimized');
  const navigate = useNavigate();
  const [flashActive, setFlashActive] = useState(false);

  // Memoize actions configuration
  const actions = useMemo<QuickAction[]>(() => [
    {
      id: 'game-mode',
      title: 'Jogar',
      description: 'Escolha seu modo de jogo',
      icon: BookOpen,
      route: '/game-mode',
      color: 'text-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/5'
    },
    {
      id: 'social',
      title: 'Social',
      description: 'Conecte-se com outros',
      icon: Users,
      route: '/social',
      color: 'text-green-600',
      bgGradient: 'from-green-500/10 to-green-600/5'
    },
    {
      id: 'missions',
      title: 'Missões',
      description: 'Desafios diários',
      icon: Target,
      route: '/missions',
      color: 'text-purple-600',
      bgGradient: 'from-purple-500/10 to-purple-600/5'
    },
    {
      id: 'satoshi-city',
      title: 'Satoshi City',
      description: 'Explore os distritos',
      icon: Zap,
      route: '/satoshi-city',
      color: 'text-orange-600',
      bgGradient: 'from-orange-500/10 to-orange-600/5'
    }
  ], []);

  // Memoize navigation handler
  const handleNavigation = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // Handle duel navigation with flash effect
  const handleDuelNavigation = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => {
      setFlashActive(false);
      navigate('/find-opponent');
    }, 150);
  }, [navigate]);

  // Memoize action cards
  const actionCards = useMemo(() => {
    return actions.map((action) => {
      const Icon = action.icon;
      const isGameMode = action.id === 'game-mode';
      
      return (
        <Card 
          key={action.id}
          className={`relative cursor-pointer hover:scale-105 transition-all duration-200 border-0 bg-gradient-to-br ${action.bgGradient} hover:shadow-md`}
          onClick={() => handleNavigation(action.route)}
        >
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`p-2 rounded-full bg-white/80 ${action.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </CardContent>
          
          {/* Duel Icon - Only on Jogar card */}
          {isGameMode && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleDuelNavigation();
              }}
              className={`absolute -top-2 -right-2 w-10 h-10 rounded-full bg-transparent border-2 border-purple-500 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:border-purple-400 ${
                flashActive ? 'animate-ping bg-purple-500/50' : 'animate-pulse'
              }`}
              style={{
                animation: flashActive ? 'ping 0.15s ease-out' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <div className="flex items-center gap-0.5">
                <Gamepad2 className="h-3 w-3 text-purple-400" />
                <Gamepad2 className="h-3 w-3 text-purple-400" />
              </div>
            </div>
          )}
        </Card>
      );
    });
  }, [actions, handleNavigation, handleDuelNavigation, flashActive]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Ações Rápidas</h2>
        <Badge variant="outline" className="text-xs">
          4 opções
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actionCards}
      </div>
    </div>
  );
});

export { QuickActionsOptimized };
