import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Card, CardContent } from "@/components/shared/ui/card";
import { useDailyLessons } from "@/hooks/use-daily-lessons";
import { useState, useEffect } from "react";
import { X, BookOpen, Award, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DailyLessonModalProps {
  lessonId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DailyLessonModal({ lessonId, isOpen, onClose }: DailyLessonModalProps) {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(4);

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
      setIsRedirecting(false);
      setCountdown(4);
      
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

  // Auto redirect after quiz completion
  useEffect(() => {
    console.log('🎯 [MODAL DEBUG] useEffect - auto redirect:', { quizCompleted, isRedirecting });
    
    if (quizCompleted && !isRedirecting) {
      console.log('⏱️ [MODAL DEBUG] Iniciando timer para redirecionamento em 2s...');
      const timer = setTimeout(() => {
        console.log('🚀 [MODAL DEBUG] Timer expirado - iniciando redirecionamento');
        setIsRedirecting(true);
        setCountdown(4);
      }, 2000); // Wait 2 seconds to show rewards

      return () => {
        console.log('🧹 [MODAL DEBUG] Limpando timer de redirecionamento');
        clearTimeout(timer);
      };
    }
  }, [quizCompleted, isRedirecting]);

  // Countdown timer for redirection
  useEffect(() => {
    console.log('⏰ [MODAL DEBUG] useEffect - countdown:', { isRedirecting, countdown });
    
    if (isRedirecting && countdown > 0) {
      console.log(`⏳ [MODAL DEBUG] Countdown: ${countdown}s`);
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isRedirecting && countdown === 0) {
      console.log('🎯 [MODAL DEBUG] Redirecionando para dashboard...');
      navigate('/dashboard');
      handleClose();
    }
  }, [isRedirecting, countdown, navigate]);

  const handleViewLesson = async () => {
    if (!currentLesson || isLessonViewed(currentLesson.id)) return;
    await markLessonViewed(currentLesson.id);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    handleViewLesson();
  };

  const handleSubmitQuiz = async () => {
    if (!currentLesson || selectedAnswer === null || isSubmitting) {
      console.log('Cannot submit: selectedAnswer or currentLesson is null or already submitting');
      return;
    }

    console.log('Starting quiz submission...');
    setIsSubmitting(true);

    try {
      console.log('Submitting quiz:', { lessonId: currentLesson.id, selectedAnswer });
      
      const originalAnswer = shuffledOptions[selectedAnswer].originalIndex;
      console.log('Original answer index:', originalAnswer);
      
      const result = await completeLessonQuiz(currentLesson.id, originalAnswer);
      console.log('Quiz submission result:', result);
      
      if (result.success) {
        setQuizCompleted(true);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
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
      <DialogContent className="max-w-md sm:max-w-lg max-h-[95vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/50 dark:via-gray-900 dark:to-pink-950/50">
        <DialogHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="text-center space-y-3 pt-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
              {getCategoryIcon(currentLesson.category)}
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#adff2f] to-green-600 bg-clip-text text-transparent leading-tight">
                {currentLesson.title}
              </DialogTitle>
              <Badge variant="secondary" className="mt-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300">
                {getCategoryName(currentLesson.category)}
                {currentLesson.is_main_lesson && " • Principal"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200 dark:border-purple-700">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center mb-4">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {currentLesson.content}
                </p>
              </div>
              
              {/* Rewards Info */}
              <div className="flex items-center justify-center gap-4 text-xs sm:text-sm bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3">
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-semibold">+{currentLesson.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-semibold">+{currentLesson.btz_reward} BTZ</span>
                </div>
                <span className="text-xs text-muted-foreground">resposta correta</span>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Section */}
          {!showQuiz && !isCompleted && (
            <div className="text-center space-y-3">
              <Button 
                onClick={handleStartQuiz}
                style={{ backgroundColor: '#ADFF2F', color: '#000000' }}
                className="hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base font-semibold"
                size="lg"
              >
                🎯 Fazer Quiz e Ganhar BTZ
              </Button>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Uma pergunta rápida sobre o conteúdo
              </p>
            </div>
          )}

          {showQuiz && !quizCompleted && !isCompleted && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg sm:text-xl mb-2">🧠 Quiz Time!</h3>
                  <p className="font-medium text-sm sm:text-base text-white">
                    {currentLesson.quiz_question}
                  </p>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  {shuffledOptions.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === index ? "default" : "outline"}
                      className={`w-full text-left justify-start h-auto p-3 sm:p-4 transition-all duration-200 ${
                        selectedAnswer === index 
                          ? "text-black shadow-md transform scale-[1.02] border-[#ADFF2F]" 
                          : "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300"
                      }`}
                      style={selectedAnswer === index ? { backgroundColor: '#ADFF2F' } : {}}
                      onClick={() => setSelectedAnswer(index)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selectedAnswer === index ? "border-white" : "border-current"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-xs sm:text-sm flex-1 text-left">{option.text}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswer === null || isSubmitting}
                  style={selectedAnswer !== null && !isSubmitting ? { backgroundColor: '#ADFF2F', color: '#000000' } : {}}
                  className="w-full mt-4 hover:opacity-90 disabled:bg-gray-400 disabled:text-gray-600 shadow-lg disabled:shadow-none transition-all duration-300 text-sm sm:text-base font-semibold"
                  size="lg"
                >
                  {isSubmitting ? '⏳ Enviando...' : '✅ Confirmar Resposta'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Completed State */}
          {(isCompleted || quizCompleted) && (
            <Card className="bg-gradient-to-br from-[#adff2f]/10 to-[#adff2f]/20 dark:from-[#adff2f]/5 dark:to-[#adff2f]/10 border-2 border-[#adff2f]/30 dark:border-[#adff2f]/50">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="text-4xl sm:text-5xl mb-3">🎉</div>
                <h3 className="font-bold text-lg sm:text-xl mb-3 bg-gradient-to-r from-[#adff2f] to-green-600 bg-clip-text text-transparent">
                  Lição Concluída!
                </h3>
                
                {/* Redirection countdown */}
                {isRedirecting && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      🚀 Redirecionando para o Dashboard em {countdown}s...
                    </p>
                  </div>
                )}
                
                {lessonProgress && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground font-medium">
                      Recompensas ganhas:
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm sm:text-base">
                      <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="font-bold">+{lessonProgress.xp_earned} XP</span>
                      </div>
                      {lessonProgress.btz_earned > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                          <span className="font-bold">+{lessonProgress.btz_earned} BTZ</span>
                        </div>
                      )}
                    </div>
                    {lessonProgress.quiz_correct === false && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                        Resposta incorreta, mas você ganhou XP por tentar! 💪
                      </p>
                    )}
                  </div>
                )}

                {/* Immediate navigation button */}
                {!isRedirecting && quizCompleted && (
                  <div className="mt-4">
                    <Button
                      onClick={() => {
                        navigate('/dashboard');
                        handleClose();
                      }}
                      style={{ backgroundColor: '#ADFF2F', color: '#000000' }}
                      className="hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm font-semibold"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Continuar no Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="text-center pt-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}