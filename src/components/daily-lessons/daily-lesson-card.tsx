import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { useDailyLessons } from "@/hooks/use-daily-lessons";
import { useState, Suspense } from "react";
import { DailyLessonModal } from "./daily-lesson-modal";
import { CyberpunkEmptyState3D } from "./CyberpunkEmptyState3D";

export function DailyLessonCard() {
  const {
    mainLesson,
    extraLessons,
    userStreak,
    loading,
    isLessonCompleted
  } = useDailyLessons();

  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

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

  if (!mainLesson && extraLessons.length === 0) {
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
              Nada por hoje, fam. Volta amanhã que tem mais 🔥
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
      <Card className="h-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-300 overflow-hidden">
        <CardContent className="p-2 h-full">
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
            <div className="ml-2 flex-shrink-0">
              {mainLesson ? (
                <Button
                  onClick={() => setSelectedLesson(mainLesson.id)}
                  size="sm"
                  style={{ backgroundColor: '#ADFF2F', color: '#000000' }}
                  className="hover:opacity-90 px-2 py-1 text-[10px] font-semibold"
                >
                  {isLessonCompleted(mainLesson.id) ? "✓ Ver" : "Começar"}
                </Button>
              ) : (
                <div className="text-[10px] text-muted-foreground">
                  Nenhuma lição
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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