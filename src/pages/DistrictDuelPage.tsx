import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Clock, Trophy, Users, Target, Flame, Timer, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

interface DuelQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface DistrictDuel {
  id: string;
  initiator_district_id: string;
  challenged_district_id: string;
  status: string;
  total_questions: number;
  start_time: string;
  end_time: string;
  questions: DuelQuestion[];
  participants_count_initiator: number;
  participants_count_challenged: number;
  average_score_initiator: number;
  average_score_challenged: number;
  winner_district_id: string | null;
  initiator_district: { name: string; color_primary: string };
  challenged_district: { name: string; color_primary: string };
}

export default function DistrictDuelPage() {
  const { duelId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [duel, setDuel] = useState<DistrictDuel | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [duelStarted, setDuelStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [userDistrict, setUserDistrict] = useState<string | null>(null);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const { toast } = useToast();

  useEffect(() => {
    if (duelId) {
      loadDuelData();
    }
  }, [duelId]);

  useEffect(() => {
    if (duelStarted && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timeLeft, duelStarted, showResult]);

  const loadDuelData = async () => {
    try {
      // Load duel info
      const { data: duelData, error: duelError } = await supabase
        .from('district_duels')
        .select(`
          *,
          initiator_district:districts!district_duels_initiator_district_id_fkey(name, color_primary),
          challenged_district:districts!district_duels_challenged_district_id_fkey(name, color_primary)
        `)
        .eq('id', duelId)
        .single();

      if (duelError) throw duelError;
      
      if (!duelData || duelData.status === 'completed') {
        toast({
          title: "Duelo não disponível",
          description: "Este duelo já foi finalizado ou não existe",
          variant: "destructive"
        });
        navigate('/satoshi-city');
        return;
      }

      const formattedDuel = {
        ...duelData,
        questions: Array.isArray(duelData.questions) ? duelData.questions : JSON.parse(duelData.questions as string)
      };
      setDuel(formattedDuel);

      // Load user profile and check participation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setCurrentProfile(profile);
          
          // Check user's district residence
          const { data: userDistrictData } = await supabase
            .from('user_districts')
            .select('district_id')
            .eq('user_id', profile.id)
            .eq('is_residence', true)
            .single();

          if (userDistrictData) {
            setUserDistrict(userDistrictData.district_id);
            
            // Check if user is eligible (must be from one of the dueling districts)
            if (userDistrictData.district_id !== duelData.initiator_district_id && 
                userDistrictData.district_id !== duelData.challenged_district_id) {
              toast({
                title: "Não elegível",
                description: "Você deve ser morador de um dos distritos participantes",
                variant: "destructive"
              });
              navigate('/satoshi-city');
              return;
            }
          }

          // Check if user already participated
          const { data: participationData } = await supabase
            .from('district_duel_participants')
            .select('*')
            .eq('duel_id', duelId)
            .eq('user_id', profile.id)
            .single();

          if (participationData) {
            setHasParticipated(true);
            setScore(participationData.score);
            setShowResult(true);
          }
        }
      }

    } catch (error) {
      console.error('Erro ao carregar duelo:', error);
      toast({
        title: t('errors.error'),
        description: t('errors.couldNotLoadDuel'),
        variant: "destructive"
      });
      navigate('/satoshi-city');
    } finally {
      setLoading(false);
    }
  };

  const startDuel = () => {
    setDuelStarted(true);
    setTimeLeft(30);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!duel) return;

    const currentQ = duel.questions[currentQuestion];
    const newAnswers = { ...userAnswers, [currentQ.id]: selectedAnswer };
    setUserAnswers(newAnswers);

    if (selectedAnswer === currentQ.correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < duel.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setTimeLeft(30);
    } else {
      setShowResult(true);
      saveDuelResult(newAnswers);
    }
  };

  const saveDuelResult = async (answers: Record<string, string>) => {
    try {
      if (!currentProfile || !duel) return;

      const participationTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

      const { data, error } = await supabase.rpc('complete_duel_participation', {
        p_duel_id: duelId,
        p_user_id: currentProfile.id,
        p_answers: answers,
        p_participation_time_seconds: participationTimeSeconds
      });

      if (error) throw error;

      toast({
        title: "Participação Registrada!",
        description: `Você acertou ${score}/${duel.questions.length} perguntas!`,
        duration: 5000
      });

      setHasParticipated(true);

    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua participação",
        variant: "destructive"
      });
    }
  };

  if (loading || !duel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">{t('admin.loadingDuel')}</p>
        </div>
      </div>
    );
  }

  const timeRemaining = new Date(duel.end_time).getTime() - Date.now();
  const isExpired = timeRemaining <= 0;

  if (hasParticipated || isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/satoshi-city')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('admin.backToCity')}
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: duel.initiator_district.color_primary }}
                >
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold">VS</div>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: duel.challenged_district.color_primary }}
                >
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                {duel.initiator_district.name} vs {duel.challenged_district.name}
              </CardTitle>
              <CardDescription>
                {isExpired ? t('admin.duelFinished') : hasParticipated ? t('admin.alreadyParticipated') : t('admin.activeDuel')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: duel.initiator_district.color_primary }}>
                    {duel.average_score_initiator.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">{duel.initiator_district.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {duel.participants_count_initiator} {t('admin.participants')}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: duel.challenged_district.color_primary }}>
                    {duel.average_score_challenged.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">{duel.challenged_district.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {duel.participants_count_challenged} {t('admin.participants')}
                  </div>
                </div>
              </div>

              {hasParticipated && (
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-green-400">{t('admin.yourParticipation')}</div>
                  <div className="text-xl font-bold">{score}/{duel.questions.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((score / duel.questions.length) * 100)}% {t('admin.accuracy')}
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button 
                  onClick={() => navigate('/satoshi-city')}
                  className="w-full"
                >
                  {t('admin.backToCity')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <FloatingNavbar />
      </div>
    );
  }

  if (!duelStarted) {
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: duel.initiator_district.color_primary }}
              >
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold text-orange-500">VS</div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: duel.challenged_district.color_primary }}
              >
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl">
              {duel.initiator_district.name} vs {duel.challenged_district.name}
            </CardTitle>
            <CardDescription>
              Duelo entre Distritos - {duel.questions.length} {t('admin.questions')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Timer className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="font-semibold text-orange-400">{t('admin.timeRemaining')}</div>
              <div className="text-lg">{hoursRemaining}h {minutesRemaining}m</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold">{duel.questions.length}</div>
                <div className="text-muted-foreground">{t('admin.questions')}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold">30s</div>
                <div className="text-muted-foreground">{t('admin.perQuestion')}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-semibold">{duel.participants_count_initiator + duel.participants_count_challenged}</div>
                <div className="text-muted-foreground">{t('admin.participants')}</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={startDuel}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <Target className="w-4 h-4 mr-2" />
                {t('admin.participateInDuel')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/satoshi-city')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('admin.backToCity')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = duel.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / duel.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <h1 className="text-xl font-bold">
                {duel.initiator_district.name} vs {duel.challenged_district.name}
              </h1>
              <p className="text-gray-300">{t('admin.question')} {currentQuestion + 1} {t('admin.of')} {duel.questions.length}</p>
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
                      isSelected ? 'border-2 bg-orange-500 hover:bg-orange-600' : ''
                    }`}
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
            className="bg-orange-500 hover:bg-orange-600"
          >
            {currentQuestion + 1 === duel.questions.length ? t('admin.finish') : t('admin.next')}
          </Button>
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}
