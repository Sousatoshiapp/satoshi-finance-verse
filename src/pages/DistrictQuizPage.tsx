import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { ArrowLeft, BookOpen, Clock, CheckCircle, XCircle, Trophy, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { XP_CONFIG } from "@/config/xp-config";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface District {
  id: string;
  name: string;
  theme: string;
  color_primary: string;
  color_secondary: string;
}

export default function DistrictQuizPage() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [district, setDistrict] = useState<District | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    if (districtId) {
      loadQuizData();
    }
  }, [districtId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timeLeft, quizStarted, showResult]);

  const loadQuizData = async () => {
    try {
      // Load district info
      const { data: districtData, error: districtError } = await supabase
        .from('districts')
        .select('id, name, theme, color_primary, color_secondary')
        .eq('id', districtId)
        .single();

      if (districtError) throw districtError;
      setDistrict(districtData);

      // Load questions for this district
      const { data: questionsData, error: questionsError } = await supabase
        .from('district_quiz_questions')
        .select('*')
        .eq('district_id', districtId)
        .eq('is_active', true)
        .order('difficulty_level')
        .limit(10);

      if (questionsError) throw questionsError;
      
      if (questionsData && questionsData.length > 0) {
        const formattedQuestions = questionsData.map(q => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }));
        setQuestions(formattedQuestions);
      } else {
        toast({
          title: t('errors.warning'),
          description: t('errors.noQuestionsAvailable'),
          variant: "destructive"
        });
        navigate(`/satoshi-city/district/${districtId}`);
      }

    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: t('errors.error'),
        description: t('errors.couldNotLoadQuiz'),
        variant: "destructive"
      });
      navigate(`/satoshi-city/district/${districtId}`);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(30);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestion];
    const newAnswers = { ...userAnswers, [currentQ.id]: selectedAnswer };
    setUserAnswers(newAnswers);

    if (selectedAnswer === currentQ.correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setTimeLeft(30);
    } else {
      setShowResult(true);
      saveQuizResult(newAnswers);
    }
  };

  const saveQuizResult = async (answers: Record<string, string>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        // Award XP and update district progress
        const xpGained = score * XP_CONFIG.DISTRICT_QUIZ_CORRECT; // XP per correct answer (reduced)
        
        await supabase.rpc('award_xp', {
          profile_id: profile.id,
          xp_amount: xpGained,
          source: 'district_quiz'
        });

        // Update district user progress
        const { error: progressError } = await supabase
          .from('user_districts')
          .upsert({
            user_id: profile.id,
            district_id: districtId,
            xp: xpGained,
            level: Math.floor(score / 2) + 1,
            last_activity_date: new Date().toISOString().split('T')[0]
          }, {
            onConflict: 'user_id,district_id'
          });

        if (progressError) {
          console.error('Error updating progress:', progressError);
        }

        toast({
          title: t('districtQuiz.quizCompleted2'),
          description: t('districtQuiz.youGained', { xp: xpGained, score: score, total: questions.length }),
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setUserAnswers({});
    setScore(0);
    setShowResult(false);
    setTimeLeft(30);
    setQuizStarted(false);
  };

  if (loading || !district) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">{t('errors.loadingQuiz')}</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: district.color_primary }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Quiz: {district.name}</CardTitle>
            <CardDescription>
              {t('districtQuiz.testYourKnowledge', { theme: district.theme.replace('_', ' ') })}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold">{questions.length}</div>
                <div className="text-muted-foreground">{t('districtQuiz.questions')}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold">30s</div>
                <div className="text-muted-foreground">{t('districtQuiz.perQuestion')}</div>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={startQuiz}
                className="w-full"
                style={{ backgroundColor: district.color_primary }}
              >
                {t('districtQuiz.startQuiz')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/satoshi-city/district/${districtId}`)}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('districtQuiz.backToDistrict')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const performance = percentage >= 80 ? t('districtQuiz.excellent') : percentage >= 60 ? t('districtQuiz.good') : t('districtQuiz.keepPracticing');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: district.color_primary }}
            >
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{t('districtQuiz.quizCompleted2')}</CardTitle>
            <CardDescription>{performance}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-4xl font-bold" style={{ color: district.color_primary }}>
              {score}/{questions.length}
            </div>
            <div className="text-lg text-muted-foreground">
              {percentage}% {t('districtQuiz.accuracy')}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="font-semibold text-green-400">{score}</div>
                <div className="text-muted-foreground">{t('districtQuiz.correctAnswers')}</div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="font-semibold text-red-400">{questions.length - score}</div>
                <div className="text-muted-foreground">{t('districtQuiz.incorrectAnswers')}</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={restartQuiz}
                className="w-full"
                style={{ backgroundColor: district.color_primary }}
              >
                {t('districtQuiz.tryAgain')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/satoshi-city/district/${districtId}`)}
                className="w-full"
              >
                {t('districtQuiz.backToDistrict')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/satoshi-city/district/${districtId}`)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{district.name}</h1>
              <p className="text-gray-300">{t('districtQuiz.questionXofY', { current: currentQuestion + 1, total: questions.length })}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant="outline" 
              className="border-white/30 text-white"
            >
              <Clock className="w-3 h-3 mr-1" />
              {timeLeft}s
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {currentQ.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = selectedAnswer === letter;
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleAnswerSelect(letter)}
                    className={`p-4 h-auto text-left justify-start ${
                      isSelected ? 'border-2' : ''
                    }`}
                    style={isSelected ? { 
                      backgroundColor: district.color_primary,
                      borderColor: district.color_primary 
                    } : {}}
                  >
                    <span className="font-bold mr-3">{letter})</span>
                    <span>{option}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            size="lg"
            style={{ backgroundColor: district.color_primary }}
          >
            {currentQuestion + 1 === questions.length ? t('districtQuiz.finish') : t('districtQuiz.next')}
          </Button>
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}
