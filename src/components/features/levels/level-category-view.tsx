import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shared/ui/collapsible";
import { ChevronDown, ChevronUp, Trophy, Star, Lock, CheckCircle, Crown, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelTier {
  level: number;
  name: string;
  description: string;
  xp_required?: number;
}

interface LevelCategoryViewProps {
  levels: LevelTier[];
  userLevel: number;
  userXP: number;
  getNextLevelXP?: (level: number) => number;
  className?: string;
}

const categories = [
  {
    name: "Iniciante",
    description: "Primeiros passos na jornada",
    range: [1, 10],
    icon: <Target className="w-5 h-5" />,
    gradient: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30"
  },
  {
    name: "Intermediário", 
    description: "Desenvolvendo conhecimento",
    range: [11, 30],
    icon: <Star className="w-5 h-5" />,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30"
  },
  {
    name: "Avançado",
    description: "Dominando conceitos",
    range: [31, 60],
    icon: <Zap className="w-5 h-5" />,
    gradient: "from-purple-500/20 to-violet-500/20",
    borderColor: "border-purple-500/30"
  },
  {
    name: "Expert",
    description: "Maestria completa",
    range: [61, 100],
    icon: <Crown className="w-5 h-5" />,
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30"
  }
];

export function LevelCategoryView({ 
  levels, 
  userLevel, 
  userXP, 
  getNextLevelXP,
  className 
}: LevelCategoryViewProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(
    // Auto-open category containing current level
    categories
      .filter(cat => userLevel >= cat.range[0] && userLevel <= cat.range[1])
      .map(cat => cat.name)
  );

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const getLevelStatus = (level: number) => {
    if (level < userLevel) return 'completed';
    if (level === userLevel) return 'current';
    return 'locked';
  };

  const getLevelIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'current': return <Star className="h-4 w-4 text-primary" />;
      default: return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryProgress = (range: [number, number]) => {
    const completed = Math.min(userLevel, range[1]) - range[0] + 1;
    const total = range[1] - range[0] + 1;
    return Math.max(0, completed) / total * 100;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {categories.map((category) => {
        const categoryLevels = levels.filter(
          level => level.level >= category.range[0] && level.level <= category.range[1]
        );
        const isOpen = openCategories.includes(category.name);
        const progress = getCategoryProgress(category.range as [number, number]);
        const isCurrentCategory = userLevel >= category.range[0] && userLevel <= category.range[1];

        return (
          <Collapsible key={category.name} open={isOpen} onOpenChange={() => toggleCategory(category.name)}>
            <Card className={cn(
              "transition-all duration-200",
              isCurrentCategory && "ring-2 ring-primary/20",
              category.borderColor
            )}>
              <CollapsibleTrigger asChild>
                <CardHeader className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  "bg-gradient-to-r",
                  category.gradient
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {category.name}
                          <Badge variant="outline" className="text-xs">
                            {category.range[0]}-{category.range[1]}
                          </Badge>
                          {isCurrentCategory && (
                            <Badge variant="default" className="text-xs">
                              Atual
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{progress.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Completo</div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-muted/50 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-3 grid-cols-1">
                    {categoryLevels.map((level) => {
                      const status = getLevelStatus(level.level);
                      const isLocked = status === 'locked';
                      
                      return (
                        <Card 
                          key={level.level}
                          className={cn(
                            "transition-all hover:shadow-md touch-manipulation min-h-[80px] overflow-hidden w-full",
                            "active:scale-[0.98] active:shadow-sm",
                            status === 'current' && "ring-2 ring-primary/30 bg-primary/5",
                            status === 'completed' && "bg-green-500/5 border-green-500/20",
                            isLocked && "opacity-60"
                          )}
                        >
                          <CardHeader className="pb-2 p-3">
                            <div className="flex items-center justify-between min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                  status === 'current' && "bg-primary text-primary-foreground",
                                  status === 'completed' && "bg-green-500 text-white",
                                  isLocked && "bg-muted text-muted-foreground"
                                )}>
                                  {level.level}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <CardTitle className="text-sm truncate">{level.name}</CardTitle>
                                  <p className="text-xs text-muted-foreground">Nível {level.level}</p>
                                </div>
                              </div>
                              <div className="shrink-0 ml-1">
                                {getLevelIcon(status)}
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0 p-3">
                            <CardDescription className={cn(
                              "text-xs mb-2 line-clamp-2",
                              isLocked && "text-muted-foreground/60"
                            )}>
                              {level.description}
                            </CardDescription>
                            
                            <div className="text-xs">
                              <span className={cn(
                                "font-medium",
                                isLocked && "text-muted-foreground/60"
                              )}>
                                XP: {level.xp_required || level.level * 100}
                              </span>
                              
                              {status === 'current' && (
                                <div className="mt-1">
                                  <span className="text-primary font-medium text-xs">
                                    {(() => {
                                      const currentXP = level.xp_required || (level.level - 1) * 100;
                                      const nextXP = getNextLevelXP ? getNextLevelXP(level.level) : level.level * 100;
                                      const xpForLevel = Math.max(1, nextXP - currentXP);
                                      const earned = Math.max(0, userXP - currentXP);
                                      return Math.round(Math.min(100, (earned / xpForLevel) * 100));
                                    })()}% completo
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}