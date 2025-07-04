import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Clock, Trophy } from "lucide-react";

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
  color_primary: string;
  color_secondary: string;
}

export default function DistrictQuiz() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (districtId) {
      loadQuizData();
    }
  }, [districtId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !showResult && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, showResult]);

  const loadQuizData = async () => {
    try {
      // Load district
      const { data: districtData, error: districtError } = await supabase
        .from('districts')
        .select('id, name, color_primary, color_secondary')
        .eq('id', districtId)
        .single();

      if (districtError) throw districtError;
      setDistrict(districtData);

      // Load questions for this district
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('district_id', districtId)
        .limit(10);

      if (questionsError) {
        // If no district-specific questions, load general questions
        const { data: generalQuestions } = await supabase
          .from('quiz_questions')
          .select('*')
          .is('district_id', null)
          .limit(10);
        
        setQuestions(generalQuestions?.map(q => ({
          ...q,
          options: JSON.parse(q.options as string)
        })) || []);
      } else {
        setQuestions(questionsData?.map(q => ({
          ...q,
          options: JSON.parse(q.options as string)
        })) || []);
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(30);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion]?.correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setTimeLeft(30);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setShowResult(true);
    
    // Update user XP and level
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, xp, points')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const xpGained = score * 10; // 10 XP per correct answer

      // Get current user district data
      const { data: currentDistrict } = await supabase
        .from('user_districts')
        .select('*')
        .eq('user_id', profile.id)
        .eq('district_id', districtId)
        .single();

      if (currentDistrict) {
        const newXP = currentDistrict.xp + xpGained;
        const newLevel = Math.floor(newXP / 1000) + 1;

        await supabase
          .from('user_districts')
          .update({
            xp: newXP,
            level: newLevel
          })
          .eq('user_id', profile.id)
          .eq('district_id', districtId);

        // Update global profile XP
        await supabase
          .from('profiles')
          .update({
            xp: (profile.xp || 0) + xpGained,
            points: (profile.points || 0) + xpGained
          })
          .eq('id', profile.id);
      }
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!district || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz não disponível</h1>
          <Button onClick={() => navigate(`/satoshi-city/district/${districtId}`)}>
            Voltar ao Distrito
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/satoshi-city/district/${districtId}`)}
          className="text-gray-300 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Distrito
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!quizStarted && !showResult && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
              <CardHeader>
                <CardTitle className="text-white text-3xl">
                  Quiz: {district.name}
                </CardTitle>
                <p className="text-gray-300">
                  Prepare-se para testar seus conhecimentos!
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-gray-300">
                    <p>• {questions.length} perguntas</p>
                    <p>• 30 segundos por pergunta</p>
                    <p>• 10 XP por resposta correta</p>
                  </div>
                  <Button 
                    onClick={startQuiz}
                    className="w-full text-black font-bold text-lg py-6"
                    style={{ backgroundColor: district.color_primary }}
                  >
                    Iniciar Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {quizStarted && !showResult && (
          <div className="max-w-2xl mx-auto">
            {/* Quiz Progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">
                  Pergunta {currentQuestion + 1} de {questions.length}
                </span>
                <div className="flex items-center text-gray-300">
                  <Clock className="mr-1 h-4 w-4" />
                  {timeLeft}s
                </div>
              </div>
              <Progress 
                value={((currentQuestion + 1) / questions.length) * 100}
                className="h-2"
              />
            </div>

            {/* Question Card */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {questions[currentQuestion]?.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswer === option ? "default" : "outline"}
                      className={`w-full text-left justify-start p-4 ${
                        selectedAnswer === option 
                          ? 'text-black font-bold' 
                          : 'text-white border-gray-600 hover:border-gray-400'
                      }`}
                      style={selectedAnswer === option ? { backgroundColor: district.color_primary } : {}}
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="w-full mt-6 text-black font-bold"
                  style={{ backgroundColor: district.color_primary }}
                >
                  {currentQuestion + 1 === questions.length ? 'Finalizar' : 'Próxima'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {showResult && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Trophy className="h-16 w-16" style={{ color: district.color_primary }} />
                </div>
                <CardTitle className="text-white text-3xl">
                  Quiz Concluído!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-4xl font-bold mb-2" style={{ color: district.color_primary }}>
                      {score}/{questions.length}
                    </p>
                    <p className="text-gray-300">
                      {Math.round((score / questions.length) * 100)}% de precisão
                    </p>
                  </div>

                  <div className="text-gray-300">
                    <p>XP Ganho: <span style={{ color: district.color_primary }}>+{score * 10}</span></p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate(`/satoshi-city/district/${districtId}`)}
                      className="w-full text-black font-bold"
                      style={{ backgroundColor: district.color_primary }}
                    >
                      Voltar ao Distrito
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setCurrentQuestion(0);
                        setSelectedAnswer("");
                        setScore(0);
                        setShowResult(false);
                        setQuizStarted(false);
                        setTimeLeft(30);
                      }}
                      className="w-full text-gray-300 border-gray-600"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <FloatingNavbar />
    </div>
  );
}