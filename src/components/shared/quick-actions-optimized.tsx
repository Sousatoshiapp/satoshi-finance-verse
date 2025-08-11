import { memo, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { 
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

  // Memoize action cards
  const actionCards = useMemo(() => {
    return actions.map((action) => {
      const Icon = action.icon;
      
      return (
        <Card 
          key={action.id}
          className={`cursor-pointer hover:scale-105 transition-all duration-200 border-0 bg-gradient-to-br ${action.bgGradient} hover:shadow-md`}
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
        </Card>
      );
    });
  }, [actions, handleNavigation]);

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