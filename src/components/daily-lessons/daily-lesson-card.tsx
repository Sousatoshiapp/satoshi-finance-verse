import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { useDailyLessons } from "@/hooks/use-daily-lessons";
import { Clock, BookOpen, Zap } from "lucide-react";
import { useState } from "react";
import { DailyLessonModal } from "./daily-lesson-modal";

export function DailyLessonCard() {
  const {
    mainLesson,
    extraLessons,
    userStreak,
    loading,
    getCategoryIcon,
    getCategoryName,
    isLessonCompleted,
    isLessonViewed
  } = useDailyLessons();

  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-200 dark:bg-purple-800 rounded animate-pulse" />
            <div className="w-32 h-5 bg-purple-200 dark:bg-purple-800 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="w-full h-12 bg-purple-200 dark:bg-purple-800 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="w-16 h-8 bg-purple-200 dark:bg-purple-800 rounded animate-pulse" />
              <div className="w-16 h-8 bg-purple-200 dark:bg-purple-800 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mainLesson && extraLessons.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            💸 Pílulas de Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Nenhuma lição disponível hoje
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Volte amanhã para mais conhecimento financeiro!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedLessons = [mainLesson, ...extraLessons].filter(l => l && isLessonCompleted(l.id)).length;
  const totalLessons = [mainLesson, ...extraLessons].filter(Boolean).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              💸 Pílulas de Conhecimento
            </CardTitle>
            {userStreak && userStreak.current_streak > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                🔥 {userStreak.current_streak} dias
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>2-3 min cada</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{completedLessons}/{totalLessons} completas</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progresso do Dia</span>
              <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Main Lesson */}
          {mainLesson && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {getCategoryIcon(mainLesson.category)}
                <span>Lição Principal</span>
                {isLessonCompleted(mainLesson.id) && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                    ✅ Completa
                  </Badge>
                )}
              </div>
              <Button
                variant={isLessonCompleted(mainLesson.id) ? "secondary" : "default"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => setSelectedLesson(mainLesson.id)}
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm line-clamp-1">
                    {mainLesson.title}
                  </div>
                  <div className="text-xs opacity-80 line-clamp-1">
                    {getCategoryName(mainLesson.category)} • +{mainLesson.xp_reward} XP • +{mainLesson.btz_reward} BTZ
                  </div>
                </div>
              </Button>
            </div>
          )}

          {/* Extra Lessons */}
          {extraLessons.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                ⭐ Lições Extras
              </div>
              <div className="grid gap-2">
                {extraLessons.slice(0, 2).map((lesson) => (
                  <Button
                    key={lesson.id}
                    variant={isLessonCompleted(lesson.id) ? "secondary" : "outline"}
                    className="justify-start text-left h-auto p-2 text-xs"
                    onClick={() => setSelectedLesson(lesson.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(lesson.category)}
                        <span className="font-medium line-clamp-1">{lesson.title}</span>
                        {isLessonCompleted(lesson.id) && (
                          <span className="text-green-600 dark:text-green-400">✅</span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {userStreak && (
            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-purple-200 dark:border-purple-800">
              <span>Recorde: {userStreak.longest_streak} dias</span>
              <span>Total: {userStreak.total_lessons_completed} lições</span>
            </div>
          )}
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