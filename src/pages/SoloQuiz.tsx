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

const soloQuizTopics = [
  {
    id: "crypto-basics",
    title: "Criptomoedas Básicas",
    questions: [
      {
        id: "1",
        question: "Quem criou o Bitcoin?",
        options: [
          { id: "a", text: "Vitalik Buterin", isCorrect: false },
          { id: "b", text: "Satoshi Nakamoto", isCorrect: true },
          { id: "c", text: "Charlie Lee", isCorrect: false },
          { id: "d", text: "Roger Ver", isCorrect: false }
        ]
      },
      {
        id: "2", 
        question: "O que significa HODL?",
        options: [
          { id: "a", text: "Hold On for Dear Life", isCorrect: true },
          { id: "b", text: "High Order Digital Ledger", isCorrect: false },
          { id: "c", text: "Hash Original Data List", isCorrect: false },
          { id: "d", text: "Hold Original Digital License", isCorrect: false }
        ]
      },
      {
        id: "3",
        question: "Qual é o máximo de Bitcoins que podem existir?",
        options: [
          { id: "a", text: "18 milhões", isCorrect: false },
          { id: "b", text: "21 milhões", isCorrect: true },
          { id: "c", text: "25 milhões", isCorrect: false },
          { id: "d", text: "Ilimitado", isCorrect: false }
        ]
      }
    ]
  }
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
  const [currentQuiz] = useState(() => soloQuizTopics[0]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = (optionId: string) => {
    if (selectedAnswer || showAnswer) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setShowAnswer(true);
    const selectedOption = currentQuiz.questions[currentQuestion].options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;
    
    if (isCorrect) {
      setScore(score + 1);
      // Dispara confetti quando acerta
      setTimeout(() => fireConfetti(), 500);
    }

    setTimeout(() => {
      if (currentQuestion < currentQuiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
      } else {
        setShowResults(true);
      }
    }, 3000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  if (showResults) {
    const percentage = (score / currentQuiz.questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl p-8 shadow-card text-center">
          <div className="mb-6">
            <img src={satoshiMascot} alt="Satoshi" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Solo Finalizado!</h1>
            <div className="text-6xl mb-4">
              {percentage >= 80 ? "🏆" : percentage >= 60 ? "🥉" : "📚"}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{currentQuiz.questions.length}
            </div>
            <p className="text-muted-foreground mb-4">
              {percentage >= 80 ? "Excelente! Você domina crypto! 🎉" : 
               percentage >= 60 ? "Muito bom! Continue estudando! 👏" : 
               "Continue praticando! 💪"}
            </p>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Seu desempenho:</p>
              <ProgressBar 
                value={score} 
                max={currentQuiz.questions.length} 
                className="mb-2"
              />
              <p className="text-sm font-semibold">
                {Math.round(percentage)}% de acerto
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={resetQuiz} className="w-full">
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => navigate("/game-mode")} className="w-full">
              Voltar aos Modos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-green-900 pb-20">
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

        {/* Avatar and Title */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-b from-green-400 to-green-600 rounded-full p-1">
              <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                <img src={satoshiMascot} alt="Satoshi" className="w-16 h-16" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {currentQuiz.title}
          </h1>
          <p className="text-slate-300 text-sm mb-6">
            Modo Solo - Teste seus conhecimentos!
          </p>

          {/* Rewards Card */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Ganhe</div>
                  <div className="text-lg font-bold text-white">30 XP</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Pontos</div>
                  <div className="text-lg font-bold text-white">60</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Streak</div>
                  <div className="text-2xl">🔥</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar 
            value={currentQuestion + 1} 
            max={currentQuiz.questions.length}
            className="mb-2 bg-slate-700"
          />
          <p className="text-sm text-slate-400 text-right">
            {String(currentQuestion + 1).padStart(2, '0')} / {currentQuiz.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-2">
            Pergunta: {String(currentQuestion + 1).padStart(2, '0')}
          </p>
          <h2 className="text-xl font-bold text-white leading-relaxed">
            {currentQuiz.questions[currentQuestion].question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuiz.questions[currentQuestion].options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect;
            
            let optionClass = "bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700";
            
            if (showAnswer) {
              if (isSelected && isCorrect) {
                optionClass = "bg-green-600 border-green-500 text-white animate-pulse";
              } else if (isSelected && !isCorrect) {
                optionClass = "bg-red-600 border-red-500 text-white animate-pulse";
              } else if (isCorrect) {
                optionClass = "bg-green-600 border-green-500 text-white";
              } else {
                optionClass = "bg-slate-800/50 border-slate-600 text-slate-400";
              }
            } else if (isSelected) {
              optionClass = "bg-slate-600 border-slate-500 text-white";
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
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 text-lg"
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
    </div>
  );
}