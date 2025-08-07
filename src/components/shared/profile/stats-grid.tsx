
import { Card } from "@/components/shared/ui/card";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { LightningIcon, BookIcon, StreakIcon } from "@/components/icons/game-icons";
import { useNavigate } from "react-router-dom";

interface StatsGridProps {
  xp: number;
  completedLessons: number;
  streak: number;
  points: number;
}

export function StatsGrid({ xp, completedLessons, streak, points }: StatsGridProps) {
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'XP Atual', 
      value: xp, 
      icon: <LightningIcon size="lg" />,
      route: '/levels',
      color: 'text-blue-500'
    },
    { 
      label: 'Lições Completas', 
      value: completedLessons, 
      icon: <BookIcon size="lg" />,
      route: '/levels',
      color: 'text-green-500'
    },
    { 
      label: 'Dias de Sequência', 
      value: streak, 
      icon: <StreakIcon size="lg" />,
      route: '/profile',
      color: 'text-orange-500'
    },
    { 
      label: 'Beetz', 
      value: points, 
      icon: <BeetzIcon size="lg" />,
      route: '/beetz-info',
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.label} 
          className="p-3 md:p-4 text-center cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md border-2 hover:border-primary/30"
          onClick={() => navigate(stat.route)}
        >
          <div className={`text-xl md:text-2xl mb-2 ${stat.color}`}>
            {stat.icon}
          </div>
          <div className="text-lg md:text-2xl font-bold text-foreground mb-1">
            {stat.value}
          </div>
          <div className="text-xs text-muted-foreground">
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  );
}
