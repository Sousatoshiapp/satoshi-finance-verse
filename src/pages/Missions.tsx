import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { useDailyMissions } from "@/hooks/use-daily-missions";
import { useDailyChallenges } from "@/hooks/use-daily-challenges";
import { Check, Clock, Trophy, Zap, ArrowLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Missions() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'missions' | 'challenges' | 'completed'>('all');
  const { 
    missions, 
    loading: missionsLoading, 
    completedToday: missionsCompleted, 
    completionRate: missionsCompletionRate, 
    timeUntilReset,
    getDifficultyColor,
    getCategoryIcon
  } = useDailyMissions();
  
  const {
    challenges,
    loading: challengesLoading,
    completedToday: challengesCompleted,
    completionRate: challengesCompletionRate,
    getChallengeIcon,
    getChallengeTypeColor
  } = useDailyChallenges();

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

  const handleChallengeClick = (challenge: any) => {
    if (challenge.completed) return;
    
    switch (challenge.challenge_type) {
      case 'speed':
      case 'combo':
        navigate('/quiz');
        break;
      case 'social':
        navigate('/duels');
        break;
      case 'exploration':
        navigate('/satoshi-city');
        break;
      default:
        navigate('/quiz');
    }
  };

  // Combined data for filtering
  const allItems = [
    ...missions.map(m => ({ ...m, type: 'mission' })),
    ...challenges.map(c => ({ ...c, type: 'challenge' }))
  ];

  const filteredItems = allItems.filter(item => {
    switch (filter) {
      case 'missions': return item.type === 'mission';
      case 'challenges': return item.type === 'challenge';
      case 'completed': return item.completed;
      default: return true;
    }
  });

  const loading = missionsLoading || challengesLoading;
  const totalCompleted = missionsCompleted + challengesCompleted;
  const totalItems = missions.length + challenges.length;
  const overallCompletionRate = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

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
              <h1 className="text-2xl font-bold">Missões & Desafios</h1>
              <p className="text-muted-foreground">Complete suas tarefas diárias e ganhe recompensas</p>
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
                    {totalCompleted}/{totalItems}
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
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Geral</span>
                    <span className="font-medium">{overallCompletionRate}%</span>
                  </div>
                  <Progress value={overallCompletionRate} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Missões: {missionsCompleted}/{missions.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Desafios: {challengesCompleted}/{challenges.length}</span>
                  </div>
                </div>
              </div>
              
              {totalCompleted >= 6 && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    🎉 Combo Épico! +800 XP + 1500 Beetz + Loot Box Épica!
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({totalItems})
            </Button>
            <Button
              variant={filter === 'missions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('missions')}
            >
              📋 Missões ({missions.length})
            </Button>
            <Button
              variant={filter === 'challenges' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('challenges')}
            >
              ⚡ Desafios ({challenges.length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              ✅ Completas ({totalCompleted})
            </Button>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => item.type === 'mission' ? handleMissionClick(item) : handleChallengeClick(item)}
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]",
                  item.completed 
                    ? "bg-green-500/10 border-green-500/30 cursor-default" 
                    : item.type === 'challenge'
                    ? `bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 hover:border-orange-500/50 border-l-4 ${getChallengeTypeColor((item as any).challenge_type)}`
                    : (item as any).is_weekend_special
                    ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">
                      {item.type === 'mission' 
                        ? getCategoryIcon((item as any).category) 
                        : getChallengeIcon((item as any).challenge_type)
                      }
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={cn(
                          "font-medium text-base",
                          item.completed ? "line-through text-muted-foreground" : ""
                        )}>
                          {item.title}
                        </h3>
                        
                        {item.type === 'challenge' && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/30">
                            ⚡ Desafio
                          </Badge>
                        )}
                        
                        {(item as any).is_weekend_special && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
                            ⭐ Especial
                          </Badge>
                        )}
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getDifficultyColor(item.difficulty))}
                        >
                          {item.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                      </p>
                      
                      {/* Progress */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span className="font-medium">
                            {Math.min(item.progress || 0, item.target_value)}/{item.target_value}
                          </span>
                        </div>
                        <Progress 
                          value={(Math.min(item.progress || 0, item.target_value) / item.target_value) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      {/* Rewards */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1 text-blue-500">
                          <Zap className="h-4 w-4" />
                          +{item.xp_reward} XP
                        </div>
                        <div className="flex items-center gap-1 text-orange-500">
                          🥕 +{item.beetz_reward} Beetz
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Icon */}
                  <div className="ml-4">
                    {item.completed ? (
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
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma tarefa encontrada</p>
              <p className="text-sm">
                {filter === 'completed' 
                  ? 'Complete algumas tarefas para vê-las aqui!'
                  : 'Novas tarefas aparecerão em breve!'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
