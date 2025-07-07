import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Settings, Trophy, Users, Crown, X, Star } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import satoshiMascot from "@/assets/satoshi-mascot.png";

// Import trophy images
import neuralCrown from "@/assets/trophies/neural-crown.jpg";
import quantumSphere from "@/assets/trophies/quantum-sphere.jpg";
import genesisCrystal from "@/assets/trophies/genesis-crystal.jpg";
import empireThrone from "@/assets/trophies/empire-throne.jpg";
import matrixCore from "@/assets/trophies/matrix-core.jpg";

const trophyImages = {
  'neural': neuralCrown,
  'quantum': quantumSphere,
  'crypto': genesisCrystal,
  'empire': empireThrone,
  'matrix': matrixCore,
};

const opponents = [
  { name: "CryptoBull", avatar: "🐂", eliminated: false },
  { name: "TokenMaster", avatar: "👑", eliminated: false },
  { name: "BlockChainer", avatar: "⛓️", eliminated: false },
  { name: "SatoshiFan", avatar: "₿", eliminated: false },
  { name: "DeFiGuru", avatar: "💎", eliminated: false },
  { name: "EthWhale", avatar: "🐋", eliminated: false },
  { name: "MoonLander", avatar: "🚀", eliminated: false },
];

const fireChampionConfetti = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#adff2f', '#ffd700', '#ff6347', '#32cd32', '#ff69b4', '#00bfff'];

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      particleCount,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: randomInRange(0.1, 0.3),
        y: Math.random() - 0.2
      },
      colors: colors
    });
    confetti({
      particleCount,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: randomInRange(0.7, 0.9),
        y: Math.random() - 0.2
      },
      colors: colors
    });
  }, 250);
};

export default function TournamentQuizSpecific() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [round, setRound] = useState(1);
  const [remainingOpponents, setRemainingOpponents] = useState(opponents);
  const [isChampion, setIsChampion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournamentAndQuestions();
  }, [tournamentId]);

  const loadTournamentAndQuestions = async () => {
    try {
      // Load tournament data
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tournamentData) {
        setTournament(tournamentData);
        
        // Load questions based on tournament category
        const { data: questionsData } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('category', tournamentData.category)
          .limit(10);

        if (questionsData && questionsData.length > 0) {
          // Transform questions to match component format
          const formattedQuestions = questionsData.map(q => {
            const optionsArray = Array.isArray(q.options) ? q.options : [];
            return {
              id: q.id,
              question: q.question,
              options: optionsArray.map((opt: any, index: number) => ({
                id: String.fromCharCode(97 + index), // a, b, c, d
                text: opt,
                isCorrect: opt === q.correct_answer
              }))
            };
          });
          setQuestions(formattedQuestions);
        } else {
          toast({
            title: "Erro",
            description: "Nenhuma pergunta encontrada para este torneio",
            variant: "destructive"
          });
          navigate('/tournaments');
        }
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o torneio",
        variant: "destructive"
      });
      navigate('/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'hsl(var(--success))';
      case 'medium': return 'hsl(var(--warning))';
      case 'hard': return 'hsl(var(--destructive))';
      case 'legendary': return 'hsl(var(--level))';
      default: return 'hsl(var(--warning))';
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (selectedAnswer || showAnswer) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || questions.length === 0) return;
    
    setShowAnswer(true);
    const selectedOption = questions[currentQuestion].options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;
    
    if (isCorrect) {
      setScore(score + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#adff2f', '#32cd32', '#00ff00']
      });
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);

        // Eliminate opponents based on performance
        if ((currentQuestion + 1) % 2 === 0 && remainingOpponents.length > 1) {
          const toEliminate = Math.floor(remainingOpponents.length / 2);
          const newRemaining = remainingOpponents.slice(0, remainingOpponents.length - toEliminate);
          setRemainingOpponents(newRemaining);
          setRound(round + 1);
        }
      } else {
        if (remainingOpponents.length === 0) {
          setIsChampion(true);
          fireChampionConfetti();
        }
        setShowResults(true);
      }
    }, 2000);
  };

  const resetTournament = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setRound(1);
    setRemainingOpponents(opponents);
    setIsChampion(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-foreground">Carregando torneio...</p>
        </div>
      </div>
    );
  }

  if (!tournament || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Torneio não encontrado</h1>
          <Button onClick={() => navigate('/tournaments')}>
            Voltar aos Torneios
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    
    return (
      <div 
        className="min-h-screen pb-20 flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${getDifficultyColor(tournament.difficulty || 'medium')}20, hsl(var(--background)))`
        }}
      >
        <div className="max-w-lg w-full bg-card rounded-xl p-8 shadow-card text-center border-2"
             style={{ borderColor: getDifficultyColor(tournament.difficulty || 'medium') }}>
          <div className="mb-6">
            <img 
              src={trophyImages[tournament.theme as keyof typeof trophyImages]}
              alt={tournament.trophy_name}
              className="w-24 h-24 mx-auto mb-4 rounded-lg shadow-glow"
            />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isChampion ? "🏆 CAMPEÃO!" : "Torneio Finalizado!"}
            </h1>
            <h2 className="text-xl text-primary mb-4">{tournament.name}</h2>
            <div className="text-6xl mb-4">
              {isChampion ? "👑" : percentage >= 70 ? "🥇" : percentage >= 50 ? "🥈" : "🥉"}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-muted-foreground mb-4">
              {isChampion ? "Parabéns! Você dominou o torneio! 🎉" :
               percentage >= 70 ? "Excelente desempenho! 🏅" :
               percentage >= 50 ? "Bom resultado! Continue praticando! 💪" :
               "Não desista! Pratique mais e volte! 📚"}
            </p>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Sua performance:</p>
              <ProgressBar 
                value={score} 
                max={questions.length} 
                className="mb-2"
              />
              <p className="text-sm font-semibold">
                {Math.round(percentage)}% de acerto
              </p>
            </div>

            {isChampion && (
              <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-6 w-6" />
                    <span className="font-bold">Recompensa de Campeão</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm opacity-90">XP</div>
                      <div className="text-xl font-bold">200</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-90">Beetz</div>
                      <div className="text-xl font-bold">{tournament.prize_pool || 500}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-90">Troféu</div>
                      <div className="text-2xl">🏆</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-3">
            <Button onClick={resetTournament} className="w-full">
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => navigate("/tournaments")} className="w-full">
              Ver Outros Torneios
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-20"
      style={{
        background: `linear-gradient(135deg, ${getDifficultyColor(tournament.difficulty || 'medium')}40, hsl(var(--background)) 50%)`
      }}
    >
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tournaments")}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-foreground">{tournament.name}</h1>
            <p className="text-xs text-muted-foreground">{tournament.trophy_name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Tournament Info */}
        <Card className="mb-6 border-2" style={{ borderColor: getDifficultyColor(tournament.difficulty || 'medium') }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={trophyImages[tournament.theme as keyof typeof trophyImages]}
                alt={tournament.trophy_name}
                className="w-16 h-16 rounded-lg shadow-glow"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="text-sm text-foreground">Round</div>
                <div className="text-xl font-bold text-primary">{round}</div>
              </div>
              <div>
                <Users className="h-6 w-6 text-info mx-auto mb-1" />
                <div className="text-sm text-foreground">Restam</div>
                <div className="text-xl font-bold text-info">{remainingOpponents.length}</div>
              </div>
              <div>
                <Star className="h-6 w-6 text-warning mx-auto mb-1" />
                <div className="text-sm text-foreground">Pontos</div>
                <div className="text-xl font-bold text-warning">{score}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Opponents */}
        <Card className="mb-6 bg-muted/30 border border-border">
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <h3 className="text-foreground font-bold">Oponentes Restantes</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {remainingOpponents.map((opponent, index) => (
                <div key={index} className="bg-card rounded-full px-3 py-1 flex items-center gap-1 border border-border">
                  <span>{opponent.avatar}</span>
                  <span className="text-xs text-foreground">{opponent.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar 
            value={currentQuestion + 1} 
            max={questions.length}
            className="mb-2"
          />
          <p className="text-sm text-muted-foreground text-right">
            {String(currentQuestion + 1).padStart(2, '0')} / {questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Pergunta: {String(currentQuestion + 1).padStart(2, '0')}
          </p>
          <h2 className="text-xl font-bold text-foreground leading-relaxed">
            {questions[currentQuestion].question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {questions[currentQuestion].options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect;
            
            let optionClass = "bg-card border-border text-foreground hover:bg-muted";
            
            if (showAnswer) {
              if (isSelected && isCorrect) {
                optionClass = "bg-success border-success text-white animate-pulse";
              } else if (isSelected && !isCorrect) {
                optionClass = "bg-destructive border-destructive text-white animate-pulse";
              } else if (isCorrect) {
                optionClass = "bg-success border-success text-white";
              } else {
                optionClass = "bg-muted border-border text-muted-foreground";
              }
            } else if (isSelected) {
              optionClass = "bg-primary/20 border-primary text-foreground";
            }
            
            return (
              <Button
                key={option.id}
                variant="outline"
                className={`w-full text-left justify-start min-h-[56px] text-wrap whitespace-normal p-4 ${optionClass}`}
                onClick={() => handleOptionSelect(option.id)}
                disabled={showAnswer}
              >
                <span className="font-medium mr-3">{option.id.toUpperCase()}.</span>
                {option.text}
              </Button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer || showAnswer}
            className="w-full bg-gradient-to-r from-primary to-success text-black font-semibold py-4 text-lg"
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
                Abandonar Torneio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Abandonar Torneio?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja sair do torneio? Seu progresso será perdido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate("/tournaments")}>
                  Abandonar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}