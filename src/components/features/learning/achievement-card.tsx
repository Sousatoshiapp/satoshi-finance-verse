import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Trophy, Star, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  badge_icon?: string;
  earned_at?: string;
  progress_data?: any;
}

interface AchievementCardProps {
  achievement: Achievement;
  isEarned?: boolean;
  className?: string;
}

const rarityConfig = {
  common: {
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Medal,
    glow: ''
  },
  uncommon: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Star,
    glow: 'shadow-green-200/50'
  },
  rare: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Award,
    glow: 'shadow-blue-200/50'
  },
  epic: {
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Trophy,
    glow: 'shadow-purple-200/50'
  },
  legendary: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Trophy,
    glow: 'shadow-yellow-200/50'
  }
};

export function AchievementCard({ achievement, isEarned = false, className }: AchievementCardProps) {
  const config = rarityConfig[achievement.rarity as keyof typeof rarityConfig] || rarityConfig.common;
  const IconComponent = config.icon;

  return (
    <Card className={cn(
      "transition-all duration-300 hover:scale-105",
      isEarned ? `shadow-lg ${config.glow}` : "opacity-60 grayscale",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full",
            isEarned ? config.color : "bg-gray-100 text-gray-400"
          )}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">{achievement.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs capitalize",
                  isEarned ? config.color : "bg-gray-50 text-gray-500"
                )}
              >
                {achievement.rarity}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {achievement.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm">
          {achievement.description}
        </CardDescription>
        
        {isEarned && achievement.earned_at && (
          <div className="mt-3 text-xs text-muted-foreground">
            Conquistado em {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
          </div>
        )}
        
        {achievement.progress_data && (
          <div className="mt-2 text-xs text-muted-foreground">
            {JSON.stringify(achievement.progress_data)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
