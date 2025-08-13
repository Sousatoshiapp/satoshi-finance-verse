import { Card } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { XPCard } from "@/components/shared/ui/xp-card";
import { StreakBadge } from "@/components/shared/ui/streak-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Trophy, Star, Zap } from "lucide-react";
import { OptimizedImage } from "@/components/shared/ui/optimized-image";
import { cn } from "@/lib/utils";

interface LevelHeroSectionProps {
  user: {
    level: number;
    xp: number;
    streak?: number;
    avatar_url?: string;
    nickname?: string;
  };
  currentLevelInfo: {
    name: string;
    description: string;
  };
  nextLevelXP: number;
  className?: string;
}

export function LevelHeroSection({ 
  user, 
  currentLevelInfo, 
  nextLevelXP,
  className 
}: LevelHeroSectionProps) {
  const progressPercentage = nextLevelXP > 0 
    ? Math.min(100, (user.xp / nextLevelXP) * 100) 
    : 100;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 border border-primary/20",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative p-6 md:p-8">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                <AvatarImage src={user.avatar_url} alt={user.nickname || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {user.nickname?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.level}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">{currentLevelInfo.name}</h1>
              <p className="text-xs text-muted-foreground">Nível {user.level}</p>
              {user.streak && user.streak > 0 && (
                <div className="mt-1">
                  <StreakBadge days={user.streak} className="text-xs" />
                </div>
              )}
            </div>
          </div>

          {/* Progress Card */}
          <XPCard 
            currentXP={user.xp}
            nextLevelXP={nextLevelXP}
            level={user.level}
            className="bg-card/80 backdrop-blur-sm"
          />

          {/* Quick Stats - 2 columns on very small screens */}
          <div className="grid grid-cols-2 gap-2 max-w-full">
            <Card className="p-2 text-center bg-card/60 backdrop-blur-sm min-h-[52px] overflow-hidden">
              <div className="text-base font-bold text-primary truncate">{user.xp}</div>
              <div className="text-[10px] text-muted-foreground">XP Total</div>
            </Card>
            <Card className="p-2 text-center bg-card/60 backdrop-blur-sm min-h-[52px] overflow-hidden">
              <div className="text-base font-bold text-secondary">{progressPercentage.toFixed(0)}%</div>
              <div className="text-[10px] text-muted-foreground">Progresso</div>
            </Card>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex items-start gap-8">
            {/* Left: User Avatar & Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-primary/30">
                  <AvatarImage src={user.avatar_url} alt={user.nickname || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                    {user.nickname?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-lg font-bold ring-4 ring-background">
                  {user.level}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{currentLevelInfo.name}</h1>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Nível {user.level}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3 max-w-md">{currentLevelInfo.description}</p>
                {user.streak && user.streak > 0 && (
                  <StreakBadge days={user.streak} />
                )}
              </div>
            </div>

            {/* Right: Progress & Stats */}
            <div className="flex-1 space-y-4">
              <XPCard 
                currentXP={user.xp}
                nextLevelXP={nextLevelXP}
                level={user.level}
                className="bg-card/80 backdrop-blur-sm"
              />
              
              <div className="grid grid-cols-4 gap-3">
                <Card className="p-4 text-center bg-card/60 backdrop-blur-sm">
                  <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{user.xp}</div>
                  <div className="text-xs text-muted-foreground">XP Total</div>
                </Card>
                <Card className="p-4 text-center bg-card/60 backdrop-blur-sm">
                  <Star className="w-5 h-5 text-secondary mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{progressPercentage.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Progresso</div>
                </Card>
                <Card className="p-4 text-center bg-card/60 backdrop-blur-sm">
                  <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
                  <div className="text-lg font-bold text-foreground">{100 - user.level}</div>
                  <div className="text-xs text-muted-foreground">Restantes</div>
                </Card>
                <Card className="p-4 text-center bg-card/60 backdrop-blur-sm">
                  <div className="text-lg font-bold text-foreground">{Math.max(0, nextLevelXP - user.xp)}</div>
                  <div className="text-xs text-muted-foreground">XP Faltando</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}