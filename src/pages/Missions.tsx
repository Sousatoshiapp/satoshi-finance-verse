import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { Check, Clock, Trophy, Zap, ArrowLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Missions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { 
    missions, 
    loading, 
    completedToday, 
    completionRate, 
    timeUntilReset,
    getDifficultyColor,
    getCategoryIcon
  } = useDailyMissions();

  const handleMissionClick = (mission: any) => {
    if (mission.completed) return;
    
    switch (mission.category) {
      case 'quiz':
        navigate('/quiz');
        break;
      case 'social':
        if (mission.mission_type === 'duel_wins') {
          navigate('/duels');
        } else {
          navigate('/social');
        }
        break;
      case 'shop':
        navigate('/store');
        break;
      case 'exploration':
        navigate('/satoshi-city');
        break;
      default:
        navigate('/quiz');
    }
  };

  const filteredMissions = missions.filter(mission => {
    switch (filter) {
      case 'active': return !mission.completed;
      case 'completed': return mission.completed;
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Missões Diárias</h1>
              <p className="text-muted-foreground">Complete suas missões e ganhe recompensas</p>
            </div>
          </div>

          {/* Stats Card */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-br from-background to-muted/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Progresso de Hoje
                  <Badge variant="secondary">
                    {completedToday}/{missions.length}
                  </Badge>
                </CardTitle>
                
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Reset em</div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeUntilReset}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Progresso Diário</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-3" />
              </div>
              
              {completedToday >= 4 && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    🎉 Combo Completado! +500 XP + 1000 Beetz + Loot Box Rara!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({missions.length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Ativas ({missions.filter(m => !m.completed).length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completas ({completedToday})
            </Button>
          </div>

          {/* Missions List */}
          <div className="space-y-4">
            {filteredMissions.map((mission) => (
              <div
                key={mission.id}
                onClick={() => handleMissionClick(mission)}
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]",
                  mission.completed 
                    ? "bg-green-500/10 border-green-500/30 cursor-default" 
                    : mission.is_weekend_special
                    ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">
                      {getCategoryIcon(mission.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={cn(
                          "font-medium text-base",
                          mission.completed ? "line-through text-muted-foreground" : ""
                        )}>
                          {mission.title}
                        </h3>
                        
                        {mission.is_weekend_special && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                            ⭐ Especial
                          </Badge>
                        )}
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getDifficultyColor(mission.difficulty))}
                        >
                          {mission.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {mission.description}
                      </p>
                      
                      {/* Progress */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span className="font-medium">
                            {Math.min(mission.progress || 0, mission.target_value)}/{mission.target_value}
                          </span>
                        </div>
                        <Progress 
                          value={(Math.min(mission.progress || 0, mission.target_value) / mission.target_value) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      {/* Rewards */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1 text-blue-500">
                          <Zap className="h-4 w-4" />
                          +{mission.xp_reward} XP
                        </div>
                        <div className="flex items-center gap-1 text-orange-500">
                          🥕 +{mission.beetz_reward} Beetz
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Icon */}
                  <div className="ml-4">
                    {mission.completed ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-muted"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMissions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma missão encontrada</p>
              <p className="text-sm">
                {filter === 'completed' 
                  ? 'Complete algumas missões para vê-las aqui!'
                  : 'Novas missões aparecerão em breve!'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}