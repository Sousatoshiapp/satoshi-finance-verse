import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Progress } from '@/components/shared/ui/progress';
import { Badge } from '@/components/shared/ui/badge';
import { 
  Sword, 
  Timer, 
  Trophy, 
  Zap, 
  Clock,
  CheckCircle,
  XCircle,
  Coins
} from 'lucide-react';
import { useDuels } from '@/hooks/use-duels';
import { useProfile } from '@/hooks/use-profile';
import { useI18n } from '@/hooks/use-i18n';
import { useAdvancedQuizAudio } from '@/hooks/use-advanced-quiz-audio';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  category: string;
  difficulty: string;
}

export function RealTimeDuelInterface() {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();
  const { duels, submitAnswer, completeDuel, getDuelAnswers } = useDuels();
  const { profile } = useProfile();
  const { t } = useI18n();
  const { 
    playCorrectSound, 
    playWrongSound, 
    playStreakSound, 
    playCashRegisterSound
  } = useAdvancedQuizAudio();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [opponentAnswers, setOpponentAnswers] = useState<any[]>([]);
  const [duelCompleted, setDuelCompleted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const duel = duels.find(d => d.id === duelId);
  const questions: Question[] = duel?.questions || [];
  const isChallenger = duel?.challenger_id === profile?.id;
  const opponentProfile = isChallenger ? duel?.challenged_profile : duel?.challenger_profile;

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !duelCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, duelCompleted]);

  // Load existing answers
  useEffect(() => {
    if (duelId) {
      loadAnswers();
    }
  }, [duelId]);

  // Start question timer
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setTimeLeft(30);
  }, [currentQuestion]);

  const loadAnswers = async () => {
    if (!duelId) return;
    
    // Temporarily disabled - requires duel_answers table
    console.log('Load answers: duel_answers table not available');
    setUserAnswers([]);
    setOpponentAnswers([]);
  };

  const handleTimeUp = useCallback(async () => {
    if (!selectedAnswer) {
      // Auto-submit wrong answer if time runs out
      await handleAnswer('');
    }
  }, [selectedAnswer]);

  const handleAnswer = async (answer: string) => {
    if (!duelId || showResult) return;

    playCashRegisterSound();
    setSelectedAnswer(answer);
    
    const responseTime = Date.now() - questionStartTime;
    const result = await submitAnswer(duelId, currentQuestion, answer, responseTime);
    
    if (result) {
      setIsCorrect(result.isCorrect);
      setShowResult(true);
      
      if (result.isCorrect) {
        playCorrectSound();
        // Trigger celebration animation
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        playWrongSound();
      }

      // Auto-advance to next question after 2 seconds
      setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          // Quiz completed - wait for opponent or finish
          setDuelCompleted(true);
          setTimeout(async () => {
            if (duelId) {
              const result = await completeDuel(duelId);
              if (result && typeof result === 'object' && 'winner_id' in result) {
                if (result.winner_id === profile?.id) {
                  playStreakSound(3);
                } else {
                  playWrongSound();
                }
              }
            }
          }, 1000);
        }
      }, 2000);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const userScore = userAnswers.filter(a => a.is_correct).length;
  const opponentScore = opponentAnswers.filter(a => a.is_correct).length;

  if (!duel || !currentQ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>{t('duel.notFound')}</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              {t('common.goBack')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (duelCompleted) {
    const winner = duel.winner_id === profile?.id;
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <Card className={`border-2 ${winner ? 'border-green-500' : 'border-red-500'}`}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                {winner ? (
                  <>
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    {t('duel.victory.title')}
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    {t('duel.defeat.title')}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Final Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">{t('common.you')}</h3>
                  <p className="text-2xl font-bold text-primary">{userScore}/{questions.length}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">{opponentProfile?.nickname}</h3>
                  <p className="text-2xl font-bold text-secondary">{opponentScore}/{questions.length}</p>
                </div>
              </div>

              {/* Prize Info */}
              {duel.final_bet_amount > 0 && (
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Coins className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">
                      {winner 
                        ? t('duel.victory.prize', { amount: duel.final_bet_amount * 2 })
                        : t('duel.defeat.prize', { amount: duel.final_bet_amount })
                      }
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {duel.reason === 'score' 
                      ? t('duel.victory.byScore') 
                      : t('duel.victory.byTime')
                    }
                  </p>
                </div>
              )}

              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
              >
                {t('common.continue')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sword className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('duel.battle.title')}</h1>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {currentQuestion + 1}/{questions.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-3 mb-4" />

        {/* Scores & Timer */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="p-3">
            <div className="text-center">
              <h3 className="font-semibold text-sm">{t('common.you')}</h3>
              <p className="text-xl font-bold text-primary">{userScore}</p>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-medium">{t('common.time')}</span>
              </div>
              <p className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
                {timeLeft}s
              </p>
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="text-center">
              <h3 className="font-semibold text-sm">{opponentProfile?.nickname}</h3>
              <p className="text-xl font-bold text-secondary">{opponentScore}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQ.question}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{currentQ.category}</Badge>
            <Badge variant="outline">{currentQ.difficulty}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Answer Options */}
      <div className="grid gap-3 mb-6">
        {currentQ.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === currentQ.correct_answer;
          const showFeedback = showResult;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: showResult ? 1 : 1.02 }}
              whileTap={{ scale: showResult ? 1 : 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => !showResult && handleAnswer(option)}
                disabled={showResult}
                className={`w-full p-4 h-auto text-left justify-start relative overflow-hidden ${
                  showFeedback
                    ? isCorrectAnswer
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : ''
                    : isSelected
                    ? 'border-primary bg-primary/10'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    showFeedback
                      ? isCorrectAnswer
                        ? 'border-green-500 bg-green-500 text-white'
                        : isSelected
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300'
                      : isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}>
                    {showFeedback ? (
                      isCorrectAnswer ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : isSelected ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                  {showFeedback && isCorrectAnswer && (
                    <Zap className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Bet Info */}
      {duel.final_bet_amount > 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold">
                {t('duel.bet.prize', { amount: duel.final_bet_amount * 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}