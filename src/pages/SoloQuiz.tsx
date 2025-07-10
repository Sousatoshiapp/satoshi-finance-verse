import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Settings, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import confetti from "canvas-confetti";
import satoshiMascot from "@/assets/satoshi-mascot.png";
import { supabase } from "@/integrations/supabase/client";
import { AvatarDisplayOptimized as AvatarDisplay } from "@/components/avatar-display-optimized";
import { QuizFeedback } from "@/components/quiz/quiz-feedback";
import { useProgressionSystem } from "@/hooks/use-progression-system";
import { useQuizGamification } from "@/hooks/use-quiz-gamification";
import { BeetzAnimation } from "@/components/quiz/beetz-animation";
import { StreakAnimation } from "@/components/quiz/streak-animation";
import { VideoExplanationFullscreen } from "@/components/quiz/video-explanation-fullscreen";
import { BTZCounter } from "@/components/quiz/btz-counter";
import { ProgressiveIntensity } from "@/components/quiz/progressive-intensity";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

interface QuizTopic {
  id: string;
  title: string;
  category: string;
  difficulty: string;
}

const quizTopics: QuizTopic[] = [
  { id: "easy-basics", title: "Educação Financeira Básica", category: "Educação Financeira", difficulty: "easy" },
  { id: "easy-investments", title: "Investimentos para Iniciantes", category: "Investimentos Básicos", difficulty: "easy" },
  { id: "medium-analysis", title: "Análise de Investimentos", category: "Análise de Investimentos", difficulty: "medium" },
  { id: "hard-advanced", title: "Estratégias Avançadas", category: "Trading Quantitativo", difficulty: "hard" }
];

const fireConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#adff2f', '#32cd32', '#00ff00', '#7fff00', '#9aff9a']
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

export default function SoloQuiz() {
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [intensityLevel, setIntensityLevel] = useState(0);
  const navigate = useNavigate();
  const { awardXP, updateStreak } = useProgressionSystem();
  const gamification = useQuizGamification();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            *,
            avatars (*)
          `)
          .eq('user_id', user.id)
          .single();
        
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, []);

  const getNextTopic = () => {
    const nextIndex = (currentTopicIndex + 1) % quizTopics.length;
    setCurrentTopicIndex(nextIndex);
    return quizTopics[nextIndex];
  };

  const fetchQuestions = async (topic: QuizTopic, updateIndex = true) => {
    setLoading(true);
    try {
      const { data: questionsData, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', topic.category)
        .eq('difficulty', topic.difficulty)
        .limit(7);

      if (error) throw error;

      if (questionsData && questionsData.length > 0) {
        // Shuffle questions and take random 7, convert options from JSON to string array
        const shuffled = questionsData
          .map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
          }))
          .sort(() => Math.random() - 0.5)
          .slice(0, 7);
        setQuestions(shuffled);
        setSelectedTopic(topic);
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setShowResults(false);
        
        // Update the current topic index if this is a new topic selection
        if (updateIndex) {
          const topicIndex = quizTopics.findIndex(t => t.id === topic.id);
          if (topicIndex !== -1) {
            setCurrentTopicIndex(topicIndex);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (selectedAnswer || showAnswer) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !questions[currentQuestion]) return;
    
    setShowAnswer(true);
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
      // Award XP for correct answer
      await awardXP(15, 'quiz_correct');
      // Handle gamification for correct answer
      await gamification.handleCorrectAnswer();
      // Dispara confetti quando acerta
      setTimeout(() => fireConfetti(), 500);
    } else {
      // Handle wrong answer with video explanation
      gamification.handleWrongAnswer(
        currentQ.question,
        currentQ.correct_answer,
        currentQ.explanation
      );
    }

    // Update streak on quiz participation
    if (currentQuestion === 0) {
      await updateStreak();
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
      } else {
        // Award completion bonus
        const completionBonus = Math.round((score / questions.length) * 60);
        awardXP(completionBonus, 'quiz_completion');
        setShowResults(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    gamification.resetGamification();
  };

  // Topic Selection Screen
  if (!selectedTopic || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/game-mode")}
              className="text-foreground hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Escolha o Tópico</h1>
            <div className="w-8" />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Carregando questões...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {quizTopics.map((topic) => (
                <Card key={topic.id} className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => fetchQuestions(topic)}>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">{topic.category}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        topic.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {topic.difficulty === 'easy' ? 'Fácil' : 
                         topic.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <FloatingNavbar />
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl p-8 shadow-card text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-b from-green-400 to-green-600 rounded-full p-1">
              <div className="w-full h-full bg-card rounded-full flex items-center justify-center overflow-hidden">
                {userProfile?.avatars ? (
                  <AvatarDisplay 
                    avatar={userProfile.avatars} 
                    size="lg" 
                    showBadge={false}
                  />
                ) : userProfile?.profile_image_url ? (
                  <img 
                    src={userProfile.profile_image_url} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                ) : (
                  <img src={satoshiMascot} alt="Default" className="w-16 h-16" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Solo Finalizado!</h1>
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🏆" : percentage >= 60 ? "🥉" : "📚"}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-muted-foreground mb-4">
              {percentage >= 80 ? "Excelente! Você domina o tema! 🎉" : 
               percentage >= 60 ? "Muito bom! Continue estudando! 👏" : 
               "Continue praticando! 💪"}
            </p>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Seu desempenho:</p>
              <ProgressBar 
                value={score} 
                max={questions.length} 
                className="mb-2"
              />
              <p className="text-sm font-semibold">
                {Math.round(percentage)}% de acerto
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tópico: {selectedTopic?.title}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => {
                resetQuiz();
                const nextTopic = getNextTopic();
                fetchQuestions(nextTopic, false);
              }}
              className="w-full text-black font-semibold"
              style={{ backgroundColor: '#adff2f' }}
            >
              Próximo Quiz
            </Button>
            <Button 
              onClick={() => {
                resetQuiz();
                if (selectedTopic) {
                  fetchQuestions(selectedTopic, false);
                }
              }} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Tentar Novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/game-mode")} 
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background"
         style={{
           background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)'
         }}>
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/game-mode")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">Solo Quiz</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* BTZ Counter - Substitui Avatar e Card de Rewards */}
        <div className="text-center mb-8">
          <BTZCounter className="mb-6" />
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {selectedTopic?.title}
          </h1>
          <p className="text-slate-300 text-sm mb-6">
            {selectedTopic?.category} - {selectedTopic?.difficulty === 'easy' ? 'Fácil' : 
             selectedTopic?.difficulty === 'medium' ? 'Médio' : 'Difícil'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar 
            value={currentQuestion + 1} 
            max={questions.length}
            className="mb-2 bg-slate-700"
          />
          <p className="text-sm text-slate-400 text-right">
            {String(currentQuestion + 1).padStart(2, '0')} / {questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-2">
            Pergunta: {String(currentQuestion + 1).padStart(2, '0')}
          </p>
          <h2 className="text-xl font-bold text-white leading-relaxed">
            {questions[currentQuestion]?.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {questions[currentQuestion]?.options?.map((option, index) => {
            const optionId = String.fromCharCode(97 + index); // a, b, c, d
            const isSelected = selectedAnswer === option;
            const isCorrect = option === questions[currentQuestion]?.correct_answer;
            
            let optionClass = "bg-card border-border text-foreground hover:bg-card/80 hover:border-primary/50";
            
            if (showAnswer) {
              if (isSelected && isCorrect) {
                optionClass = "bg-green-600 border-green-500 text-white animate-pulse";
              } else if (isSelected && !isCorrect) {
                optionClass = "bg-red-600 border-red-500 text-white animate-pulse";
              } else if (isCorrect) {
                optionClass = "bg-green-600 border-green-500 text-white";
              } else {
                optionClass = "bg-muted/50 border-border text-muted-foreground";
              }
            } else if (isSelected) {
              optionClass = "bg-primary/10 border-primary text-foreground";
            }
            
            return (
              <Button
                key={index}
                variant="outline"
                className={`w-full text-left justify-start min-h-[56px] text-wrap whitespace-normal p-4 ${optionClass}`}
                onClick={() => handleOptionSelect(option)}
                disabled={showAnswer}
              >
                <span className="font-medium mr-3">{optionId.toUpperCase()}.</span>
                {option}
              </Button>
            );
          })}
        </div>


        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer || showAnswer}
            className="w-full py-4 text-lg font-semibold text-black"
            style={{ backgroundColor: '#adff2f' }}
          >
            {showAnswer ? "Próxima Pergunta..." : "Enviar"}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full py-4 text-lg"
              >
                <X className="h-4 w-4 mr-2" />
                Encerrar Quiz
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar Quiz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja encerrar o quiz? Seu progresso será perdido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate("/game-mode")}>
                  Encerrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <FloatingNavbar />

      {/* Gamification Animations */}
      {gamification.showBeetzAnimation && (
        <BeetzAnimation
          isVisible={gamification.showBeetzAnimation}
          amount={gamification.currentMultiplier}
          onComplete={gamification.hideBeetzAnimation}
        />
      )}

      {gamification.showStreakAnimation && (
        <StreakAnimation
          isVisible={gamification.showStreakAnimation}
          onComplete={gamification.hideStreakAnimation}
        />
      )}

      {/* Progressive Intensity Background */}
      <ProgressiveIntensity 
        streak={gamification.streak}
        isActive={!showResults}
        onIntensityChange={setIntensityLevel}
      />

      {/* Full-screen Video Explanation */}
      {gamification.showVideoExplanation && gamification.currentVideoUrl && (
        <VideoExplanationFullscreen
          videoUrl={gamification.currentVideoUrl}
          onClose={() => {
            gamification.hideVideoExplanation();
            // Continue to next question after video
            setTimeout(() => {
              if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowAnswer(false);
              } else {
                setShowResults(true);
              }
            }, 500);
          }}
        />
      )}
    </div>
  );
}