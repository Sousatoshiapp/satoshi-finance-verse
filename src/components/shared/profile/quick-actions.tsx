
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ShoppingCart, Trophy, Users, BookOpen, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  subscription: {
    tier: string;
    xpMultiplier: number;
    monthlyBeetz: number;
  };
}

export function QuickActions({ subscription }: QuickActionsProps) {
  const navigate = useNavigate();

  const quickActions = [
    { 
      label: 'Lições', 
      icon: <BookOpen className="h-4 w-4" />, 
      route: '/levels',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      label: 'Loja', 
      icon: <ShoppingCart className="h-4 w-4" />, 
      route: '/shop',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      label: 'Torneios', 
      icon: <Trophy className="h-4 w-4" />, 
      route: '/tournaments',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    { 
      label: 'Social', 
      icon: <Users className="h-4 w-4" />, 
      route: '/social',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      label: 'Boost', 
      icon: <Zap className="h-4 w-4" />, 
      route: '/powerups',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    { 
      label: 'Config', 
      icon: <Settings className="h-4 w-4" />, 
      route: '/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Ações Rápidas</h3>
          {subscription.tier !== 'free' && (
            <Badge variant="secondary" className="text-xs">
              {subscription.tier === 'pro' ? 'PRO' : 'ELITE'}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              onClick={() => navigate(action.route)}
              className={`flex flex-col items-center gap-1 h-auto py-3 ${action.color} text-white hover:text-white`}
            >
              {action.icon}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
