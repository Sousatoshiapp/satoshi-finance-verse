import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shared/ui/collapsible";
import { useDailyLessons } from "@/hooks/use-daily-lessons";
import { useState, useEffect, Suspense } from "react";
import { DailyLessonModal } from "./daily-lesson-modal";
import { CyberpunkEmptyState3D } from "./CyberpunkEmptyState3D";
import { ChevronDown, ChevronUp } from "lucide-react";

export function DailyLessonCard() {
  const {
    mainLesson,
    extraLessons,
    userStreak,
    loading,
    isLessonCompleted,
    availableLesson,
    hasAnyLesson
  } = useDailyLessons();

  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState("");

  // Função para calcular tempo até a próxima lição
  const getTimeUntilNextLesson = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `Próxima lição em ${hours}h ${minutes}min`;
    }
    return `Próxima lição em ${minutes}min`;
  };

  // Timer para atualizar o countdown a cada minuto
  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilNext(getTimeUntilNextLesson());
    };
    
    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <Card className="h-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <CardContent className="p-3 h-full flex items-center justify-between">
          <div className="flex-1">
            <div className="w-32 h-4 bg-purple-200 dark:bg-purple-800 rounded animate-pulse mb-2" />
            <div className="w-24 h-3 bg-purple-200 dark:bg-purple-800 rounded animate-pulse" />
          </div>
          <div className="w-16 h-8 bg-purple-200 dark:bg-purple-800 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyLesson) {
    return (
      <Card className="h-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 overflow-hidden">
        <div className="h-full flex">
          {/* Lado esquerdo - Texto */}
          <div className="flex-1 p-3 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">💸</span>
              <h3 className="font-semibold text-sm">Pílulas de Conhecimento</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {timeUntilNext}
            </p>
          </div>
          
          {/* Lado direito - 3D Cyberpunk */}
          <div className="w-20 h-full">
            <Suspense fallback={
              <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-cyan-900/20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <CyberpunkEmptyState3D />
            </Suspense>
          </div>
        </div>
      </Card>
    );
  }

  const completedLessons = [mainLesson, ...extraLessons].filter(l => l && isLessonCompleted(l.id)).length;
  const totalLessons = [mainLesson, ...extraLessons].filter(Boolean).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <>
      <Collapsible open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-300 overflow-hidden">
          <CollapsibleTrigger className="w-full">
            <CardContent className="p-2 h-16">
              <div className="flex items-center justify-between h-full">
                {/* Left side - Title and Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold truncate">💸 Pílulas de Conhecimento</span>
                    {userStreak && userStreak.current_streak > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] px-1 py-0">
                        🔥 {userStreak.current_streak}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <Progress value={progressPercentage} className="h-1 w-full" />
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{completedLessons}/{totalLessons} completas</span>
                      <span>2-3 min</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Main lesson or status */}
                <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                  {availableLesson ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLesson(availableLesson.id);
                      }}
                      size="sm"
                      style={{ backgroundColor: '#ADFF2F', color: '#000000' }}
                      className="hover:opacity-90 px-2 py-1 text-[10px] font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLessonCompleted(availableLesson.id) ? "✓ Ver" : "Começar"}
                    </Button>
                  ) : (
                    <div className="text-[10px] text-muted-foreground">
                      {timeUntilNext}
                    </div>
                  )}
                  {isDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="space-y-3 text-xs">
                {/* Informações sobre recompensas */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💰 Ganhos por Lição</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Visualizar lição:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">+1 XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Quiz correto:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">+10 XP + 0,5 BTZ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Quiz incorreto:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">+1 XP apenas</span>
                    </div>
                  </div>
                </div>

                {/* Informações sobre streak */}
                {userStreak && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">🔥 Sequência Atual</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Dias consecutivos:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">{userStreak.current_streak}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Melhor sequência:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">{userStreak.current_streak}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progresso do dia */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">📊 Progresso Hoje</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lições completas:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{completedLessons}/{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tempo estimado:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">2-3 min cada</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {selectedLesson && (
        <DailyLessonModal
          lessonId={selectedLesson}
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </>
  );
}