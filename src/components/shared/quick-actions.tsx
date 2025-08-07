import { Button } from "@/components/shared/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Trophy, ShoppingBag, BarChart3 } from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Calendar,
      label: "Missões",
      description: "Desafios diários",
      route: "/missions",
      color: "bg-gradient-to-r from-blue-500 to-purple-500"
    },
    {
      icon: Users,
      label: "Social",
      description: "Amigos e guilds",
      route: "/social",
      color: "bg-gradient-to-r from-green-500 to-teal-500"
    },
    {
      icon: Trophy,
      label: "Torneios",
      description: "Competições",
      route: "/tournaments",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500"
    },
    {
      icon: ShoppingBag,
      label: "Loja",
      description: "Avatars e itens",
      route: "/store",
      color: "bg-gradient-to-r from-pink-500 to-red-500"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      description: "Seu progresso",
      route: "/advanced-analytics",
      color: "bg-gradient-to-r from-indigo-500 to-blue-500"
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">Ações Rápidas</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.route}
              variant="ghost"
              className="h-auto p-3 flex flex-col items-start text-left hover:scale-105 transition-all"
              onClick={() => navigate(action.route)}
            >
              <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-medium text-foreground">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.description}</div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
