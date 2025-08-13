import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Card, CardContent } from "@/components/shared/ui/card";
import { useDailyLessons } from "@/hooks/use-daily-lessons";
import { useState, useEffect } from "react";
import { X, BookOpen, Award, Zap } from "lucide-react";

interface DailyLessonModalProps {
  lessonId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DailyLessonModal({ lessonId, isOpen, onClose }: DailyLessonModalProps) {
  const {
    lessons,
    mainLesson,
    markLessonViewed,
    completeLessonQuiz,
    getCategoryIcon,
    getCategoryName,
    isLessonCompleted,
    isLessonViewed,
    getLessonProgress,
    markModalShown,
    shouldShowModal
  } = useDailyLessons();

  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<Array<{ text: string; originalIndex: number }>>([]);

  // Determinar qual lição mostrar
  const currentLesson = lessonId 
    ? lessons.find(l => l.id === lessonId)
    : shouldShowModal && mainLesson 
    ? mainLesson 
    : null;

  // Reset state when lesson changes
  useEffect(() => {
    if (currentLesson) {
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizCompleted(false);
      
      // Shuffle quiz options
      const options = currentLesson.quiz_options.map((text, index) => ({
        text,
        originalIndex: index
      }));
      
      // Fisher-Yates shuffle
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      setShuffledOptions(options);
    }
  }, [currentLesson]);

  const handleViewLesson = async () => {
    if (!currentLesson || isLessonViewed(currentLesson.id)) return;
    await markLessonViewed(currentLesson.id);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    handleViewLesson();
  };

  const handleSubmitQuiz = async () => {
    if (!currentLesson || selectedAnswer === null) return;

    const originalAnswer = shuffledOptions[selectedAnswer].originalIndex;
    const result = await completeLessonQuiz(currentLesson.id, originalAnswer);
    
    if (result.success) {
      setQuizCompleted(true);
    }
  };

  const handleClose = () => {
    if (shouldShowModal && !lessonId) {
      markModalShown();
    }
    onClose();
  };

  if (!currentLesson) return null;

  const lessonProgress = getLessonProgress(currentLesson.id);
  const isCompleted = isLessonCompleted(currentLesson.id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCategoryIcon(currentLesson.category)}
              <div>
                <DialogTitle className="text-xl">{currentLesson.title}</DialogTitle>
                <Badge variant="secondary" className="mt-1">
                  {getCategoryName(currentLesson.category)}
                  {currentLesson.is_main_lesson && " • Principal"}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {currentLesson.content}
                  </p>
                </div>
              </div>
              
              {/* Rewards Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>+{currentLesson.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>+{currentLesson.btz_reward} BTZ</span>
                </div>
                <span className="text-xs">por resposta correta</span>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Section */}
          {!showQuiz && !isCompleted && (
            <div className="text-center">
              <Button 
                onClick={handleStartQuiz}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                🎯 Fazer Quiz e Ganhar BTX
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Uma pergunta rápida sobre o conteúdo
              </p>
            </div>
          )}

          {showQuiz && !quizCompleted && !isCompleted && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-lg">🧠 Quiz Time!</h3>
                <p className="mb-4 font-medium">{currentLesson.quiz_question}</p>
                
                <div className="space-y-3">
                  {shuffledOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto p-4"
                      onClick={() => setSelectedAnswer(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswer === null}
                  className="w-full mt-4"
                  size="lg"
                >
                  Confirmar Resposta
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Completed State */}
          {(isCompleted || quizCompleted) && (
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-semibold mb-2">Lição Concluída!</h3>
                {lessonProgress && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Você ganhou:
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-blue-500" />
                        +{lessonProgress.xp_earned} XP
                      </span>
                      {lessonProgress.btz_earned > 0 && (
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          +{lessonProgress.btz_earned} BTZ
                        </span>
                      )}
                    </div>
                    {lessonProgress.quiz_correct === false && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Resposta incorreta, mas você ganhou XP por tentar! 💪
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="text-center">
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}