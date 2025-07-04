import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Settings, Zap, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import satoshiMascot from "@/assets/satoshi-mascot.png";

const duelQuizTopics = [
  {
    id: "trading-duel",
    title: "Duelo de Trading",
    questions: [
      {
        id: "1",
        question: "O que significa 'Bull Market'?",
        options: [
          { id: "a", text: "Mercado em alta", isCorrect: true },
          { id: "b", text: "Mercado em baixa", isCorrect: false },
          { id: "c", text: "Mercado lateral", isCorrect: false },
          { id: "d", text: "Mercado fechado", isCorrect: false }
        ]
      },
      {
        id: "2",
        question: "O que é uma 'Stop Loss'?",
        options: [
          { id: "a", text: "Ordem para maximizar lucros", isCorrect: false },
          { id: "b", text: "Ordem para limitar perdas", isCorrect: true },
          { id: "c", text: "Tipo de criptomoeda", isCorrect: false },
          { id: "d", text: "Taxa da exchange", isCorrect: false }
        ]
      },
      {
        id: "3",
        question: "O que significa 'FOMO'?",
        options: [
          { id: "a", text: "Fear of Missing Out", isCorrect: true },
          { id: "b", text: "First Order Market Option", isCorrect: false },
          { id: "c", text: "Financial Option Money Order", isCorrect: false },
          { id: "d", text: "Future Order Management Optimization", isCorrect: false }
        ]
      },
      {
        id: "4",
        question: "O que é 'DCA'?",
        options: [
          { id: "a", text: "Digital Currency Analysis", isCorrect: false },
          { id: "b", text: "Dollar Cost Averaging", isCorrect: true },
          { id: "c", text: "Decentralized Coin Access", isCorrect: false },
          { id: "d", text: "Dynamic Chart Algorithm", isCorrect: false }
        ]
      },
      {
        id: "5",
        question: "O que significa 'Pump and Dump'?",
        options: [
          { id: "a", text: "Estratégia de trading legítima", isCorrect: false },
          { id: "b", text: "Manipulação artificial de preços", isCorrect: true },
          { id: "c", text: "Tipo de carteira digital", isCorrect: false },
          { id: "d", text: "Método de mineração", isCorrect: false }
        ]
      }
    ]
  }
];

const fireVictoryConfetti = () => {
  const end = Date.now() + (3 * 1000); // 3 seconds
  const colors = ['#adff2f', '#ffd700', '#ff6347', '#32cd32', '#ff69b4'];

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export default function DuelQuiz() {
  const [currentQuiz] = useState(() => duelQuizTopics[0]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showAnswer && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer) {
      handleSubmit();
    }
  }, [timeLeft, showAnswer, showResults]);

  const handleOptionSelect = (optionId: string) => {
    if (selectedAnswer || showAnswer) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    setShowAnswer(true);
    const selectedOption = currentQuiz.questions[currentQuestion].options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;
    
    if (isPlayerTurn) {
      if (isCorrect) {
        setPlayerScore(playerScore + 1);
        fireVictoryConfetti();
      }
    }

    // Simulate opponent answer
    const opponentCorrect = Math.random() > 0.4; // 60% chance opponent gets it right
    if (!isPlayerTurn && opponentCorrect) {
      setOpponentScore(opponentScore + 1);
    }

    setTimeout(() => {
      if (currentQuestion < currentQuiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setTimeLeft(15);
        setIsPlayerTurn(!isPlayerTurn);
      } else {
        setShowResults(true);
      }
    }, 3000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setPlayerScore(0);
    setOpponentScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setTimeLeft(15);
    setIsPlayerTurn(true);
  };

  if (showResults) {
    const playerWon = playerScore > opponentScore;
    const isDraw = playerScore === opponentScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl p-8 shadow-card text-center">
          <div className="mb-6">
            <img src={satoshiMascot} alt="Satoshi" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isDraw ? "Empate!" : playerWon ? "Vitória!" : "Derrota!"}
            </h1>
            <div className="text-6xl mb-4">
              {isDraw ? "🤝" : playerWon ? "🏆" : "😔"}
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Você</p>
                <p className="text-2xl font-bold text-primary">{playerScore}</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Oponente</p>
                <p className="text-2xl font-bold text-secondary">{opponentScore}</p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">
              {isDraw ? "Foi por pouco! Tente novamente!" :
               playerWon ? "Parabéns! Você dominou este duelo! 🎉" : 
               "Não desista! Pratique mais e volte! 💪"}
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={resetQuiz} className="w-full">
              Novo Duelo
            </Button>
            <Button variant="outline" onClick={() => navigate("/duels")} className="w-full">
              Voltar aos Duelos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-pink-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/duels")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">Duelo Quiz</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Players Score */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className={`${isPlayerTurn ? 'bg-green-500/20 border-green-500' : 'bg-slate-800/50 border-slate-700'}`}>
            <CardContent className="p-4 text-center">
              <div className="text-white font-bold">Você</div>
              <div className="text-2xl font-bold text-white">{playerScore}</div>
              {isPlayerTurn && <Zap className="h-4 w-4 text-green-400 mx-auto" />}
            </CardContent>
          </Card>
          <Card className={`${!isPlayerTurn ? 'bg-red-500/20 border-red-500' : 'bg-slate-800/50 border-slate-700'}`}>
            <CardContent className="p-4 text-center">
              <div className="text-white font-bold">Oponente</div>
              <div className="text-2xl font-bold text-white">{opponentScore}</div>
              {!isPlayerTurn && <Zap className="h-4 w-4 text-red-400 mx-auto" />}
            </CardContent>
          </Card>
        </div>

        {/* Timer */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <div className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </div>
            </div>
            <p className="text-sm text-slate-400">
              {isPlayerTurn ? "Sua vez!" : "Vez do oponente..."}
            </p>
          </CardContent>
        </Card>

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
                disabled={showAnswer || !isPlayerTurn}
              >
                <span className="font-medium mr-3">{option.id.toUpperCase()}.</span>
                {option.text}
              </Button>
            );
          })}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || showAnswer || !isPlayerTurn}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 text-lg"
        >
          {showAnswer ? "Próxima Pergunta..." : 
           !isPlayerTurn ? "Aguarde sua vez..." : "Enviar"}
        </Button>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}