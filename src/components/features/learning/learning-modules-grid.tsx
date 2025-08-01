import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Clock, BookOpen, Trophy, Lock, Star, Users } from "lucide-react";
import { useLearningModules } from "@/hooks/use-learning-modules";
import { cn } from "@/lib/utils";

interface LearningModulesGridProps {
  onModuleSelect?: (moduleId: string) => void;
  showSponsoredOnly?: boolean;
  difficulty?: number;
}

export function LearningModulesGrid({ 
  onModuleSelect, 
  showSponsoredOnly = false,
  difficulty 
}: LearningModulesGridProps) {
  const { 
    modules, 
    getModuleProgress, 
    getAvailableModules, 
    startModule,
    getModulesByDifficulty,
    getSponsoredModules,
    getRecommendedModule,
    loading 
  } = useLearningModules();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  let displayModules = modules;
  
  if (showSponsoredOnly) {
    displayModules = getSponsoredModules();
  } else if (difficulty) {
    displayModules = getModulesByDifficulty(difficulty);
  }

  const availableModules = getAvailableModules();
  const recommendedModule = getRecommendedModule();

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return "bg-green-500";
    if (level <= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return "Iniciante";
    if (level <= 4) return "Intermediário";
    return "Avançado";
  };

  const isModuleAvailable = (moduleId: string) => {
    return availableModules.some(m => m.id === moduleId);
  };

  const handleModuleClick = async (moduleId: string) => {
    if (!isModuleAvailable(moduleId)) return;
    
    const progress = getModuleProgress(moduleId);
    if (!progress) {
      await startModule(moduleId);
    }
    
    onModuleSelect?.(moduleId);
  };

  return (
    <div className="space-y-6">
      {/* Recommended Module */}
      {recommendedModule && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Recomendado para Você</h3>
          </div>
          <Card className="border-2 border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{recommendedModule.icon}</span>
                    <h4 className="font-bold text-lg">{recommendedModule.name}</h4>
                    {recommendedModule.sponsor_company && (
                      <Badge variant="secondary" className="text-xs">
                        {recommendedModule.sponsor_company}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendedModule.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recommendedModule.estimated_duration_minutes}min
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getDifficultyColor(recommendedModule.difficulty_level))}
                    >
                      {getDifficultyLabel(recommendedModule.difficulty_level)}
                    </Badge>
                  </div>
                </div>
                <Button onClick={() => handleModuleClick(recommendedModule.id)}>
                  Começar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayModules.map((module) => {
          const progress = getModuleProgress(module.id);
          const isAvailable = isModuleAvailable(module.id);
          const isRecommended = recommendedModule?.id === module.id;

          return (
            <Card 
              key={module.id} 
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                !isAvailable && "opacity-60",
                isRecommended && "hidden" // Hide recommended module from grid since it's shown above
              )}
            >
              {module.banner_image_url && (
                <div className="h-32 w-full bg-gradient-to-r from-primary/10 to-secondary/10 relative overflow-hidden">
                  <img 
                    src={module.banner_image_url} 
                    alt={module.name}
                    className="w-full h-full object-cover"
                  />
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{module.icon}</span>
                    <div>
                      <CardTitle className="text-base">{module.name}</CardTitle>
                      {module.sponsor_company && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {module.sponsor_company}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!isAvailable && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {module.description}
                </p>

                {/* Learning Objectives */}
                {module.learning_objectives.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium">
                      <BookOpen className="h-3 w-3" />
                      Objetivos:
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {module.learning_objectives.slice(0, 2).map((objective, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          {objective}
                        </li>
                      ))}
                      {module.learning_objectives.length > 2 && (
                        <li className="text-xs text-muted-foreground">
                          +{module.learning_objectives.length - 2} outros objetivos
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Progress */}
                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progresso</span>
                      <span>{Math.round(progress.mastery_score * 100)}%</span>
                    </div>
                    <Progress value={progress.mastery_score * 100} className="h-2" />
                    {progress.is_completed && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Trophy className="h-3 w-3" />
                        Módulo Concluído!
                      </div>
                    )}
                  </div>
                )}

                {/* Module Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {module.estimated_duration_minutes}min
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {getDifficultyLabel(module.difficulty_level)}
                  </Badge>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  variant={progress?.is_completed ? "outline" : "default"}
                  disabled={!isAvailable}
                  onClick={() => handleModuleClick(module.id)}
                >
                  {!isAvailable ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Bloqueado
                    </>
                  ) : progress?.is_completed ? (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Revisar
                    </>
                  ) : progress ? (
                    "Continuar"
                  ) : (
                    "Começar"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayModules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Nenhum módulo encontrado</h3>
              <p className="text-muted-foreground">
                {showSponsoredOnly 
                  ? "Não há módulos patrocinados disponíveis no momento."
                  : difficulty 
                  ? `Não há módulos de nível ${getDifficultyLabel(difficulty)} disponíveis.`
                  : "Não há módulos disponíveis no momento."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
