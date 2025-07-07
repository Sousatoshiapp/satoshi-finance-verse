import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingNavbar } from '@/components/floating-navbar';
import { EnhancedQuizCard } from '@/components/quiz/enhanced-quiz-card';
import { LootInventory } from '@/components/quiz/loot-inventory';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Zap, Target, Gift, Trophy, Brain, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizResult {
  score: number;
  combo: number;
  maxCombo: number;
  lootEarned: any[];
  performanceScore: number;
  totalQuestions: number;
}

export default function EnhancedQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'medium';
  const category = searchParams.get('category') || 'all';
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalLoot: 0,
    currentStreak: 0
  });

  useEffect(() => {
    loadQuestions();
    loadUserStats();
  }, [difficulty, category]);

  const loadQuestions = async () => {
    try {
      let query = supabase
        .from('quiz_questions')
        .select('*')
        .eq('difficulty', difficulty)
        .limit(10);

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data: questionsData } = await query;

      if (questionsData && questionsData.length > 0) {
        const formattedQuestions = questionsData.map(q => ({
          ...q,
          options: JSON.parse(q.options as string)
        }));
        setQuestions(formattedQuestions);
      } else {
        // Fallback to general questions
        const { data: fallbackQuestions } = await supabase
          .from('quiz_questions')
          .select('*')
          .limit(10);
        
        const formatted = fallbackQuestions?.map(q => ({
          ...q,
          options: JSON.parse(q.options as string)
        })) || [];
        
        setQuestions(formatted);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, streak')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get quiz session stats
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', profile.id);

      // Get user loot count
      const { data: loot } = await supabase
        .from('user_loot')
        .select('id')
        .eq('user_id', profile.id);

      const totalQuizzes = sessions?.length || 0;
      const averageScore = totalQuizzes > 0 
        ? sessions!.reduce((acc, session) => acc + (session.questions_correct / session.questions_total * 100), 0) / totalQuizzes
        : 0;

      setUserStats({
        totalQuizzes,
        averageScore: Math.round(averageScore),
        totalLoot: loot?.length || 0,
        currentStreak: profile.streak || 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleQuizComplete = (results: QuizResult) => {
    setQuizResults(results);
    setQuizCompleted(true);
    
    // Celebration effects
    if (results.performanceScore > 800) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#00f5ff', '#ff0080', '#ffff00', '#00ff80']
      });
    }

    // Update user stats
    loadUserStats();
  };

  const handleRetry = () => {
    setQuizCompleted(false);
    setQuizResults(null);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="cyber-card p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-cyan-400">Inicializando Matriz Cyber...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-32">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-cyan-500 text-cyan-400">
              {difficulty.toUpperCase()}
            </Badge>
            {category !== 'all' && (
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                {category}
              </Badge>
            )}
          </div>
        </div>

        {/* User Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400">{userStats.totalQuizzes}</div>
              <div className="text-xs text-muted-foreground">Quizzes Completados</div>
            </CardContent>
          </Card>
          
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400">{userStats.averageScore}%</div>
              <div className="text-xs text-muted-foreground">Precisão Média</div>
            </CardContent>
          </Card>
          
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <Gift className="h-6 w-6 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400">{userStats.totalLoot}</div>
              <div className="text-xs text-muted-foreground">Itens Coletados</div>
            </CardContent>
          </Card>
          
          <Card className="cyber-card">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400">{userStats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Streak Atual</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Cyber Quiz
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Inventário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quiz">
            {!quizCompleted ? (
              <EnhancedQuizCard
                questions={questions}
                onComplete={handleQuizComplete}
              />
            ) : (
              <Card className="cyber-card max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                  <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    🎉 HACK SEQUENCE COMPLETED!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
                      <div className="text-3xl font-bold text-green-400">{quizResults?.score}</div>
                      <div className="text-sm text-muted-foreground">Score Final</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                      <div className="text-3xl font-bold text-yellow-400">{quizResults?.maxCombo}</div>
                      <div className="text-sm text-muted-foreground">Max Combo</div>
                    </div>
                  </div>

                  {quizResults && quizResults.lootEarned.length > 0 && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <h3 className="font-bold text-purple-400 mb-2">🎁 Loot Coletado:</h3>
                      <div className="space-y-1">
                        {quizResults.lootEarned.map((item, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button 
                      onClick={handleRetry}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                    >
                      🔄 Retry Mission
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                    >
                      📊 Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inventory">
            <LootInventory />
          </TabsContent>
        </Tabs>
      </div>

      <FloatingNavbar />
    </div>
  );
}