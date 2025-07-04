import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Settings, Trophy, Users, Crown, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import confetti from "canvas-confetti";
import satoshiMascot from "@/assets/satoshi-mascot.png";

const tournamentQuestions = [
  {
    id: "1",
    question: "Qual foi o primeiro país a adotar Bitcoin como moeda legal?",
    options: [
      { id: "a", text: "Estados Unidos", isCorrect: false },
      { id: "b", text: "El Salvador", isCorrect: true },
      { id: "c", text: "Japão", isCorrect: false },
      { id: "d", text: "Suíça", isCorrect: false }
    ]
  },
  {
    id: "2",
    question: "O que é 'Staking' em criptomoedas?",
    options: [
      { id: "a", text: "Comprar e vender rapidamente", isCorrect: false },
      { id: "b", text: "Bloquear moedas para validar transações", isCorrect: true },
      { id: "c", text: "Minerar novas moedas", isCorrect: false },
      { id: "d", text: "Trocar uma crypto por outra", isCorrect: false }
    ]
  },
  {
    id: "3",
    question: "O que significa 'DeFi'?",
    options: [
      { id: "a", text: "Decentralized Finance", isCorrect: true },
      { id: "b", text: "Digital Finance", isCorrect: false },
      { id: "c", text: "Distributed Finance", isCorrect: false },
      { id: "d", text: "Defined Finance", isCorrect: false }
    ]
  },
  {
    id: "4",
    question: "O que é um 'Smart Contract'?",
    options: [
      { id: "a", text: "Um contrato físico digitalizado", isCorrect: false },
      { id: "b", text: "Um programa que executa automaticamente", isCorrect: true },
      { id: "c", text: "Um tipo de criptomoeda", isCorrect: false },
      { id: "d", text: "Uma carteira digital", isCorrect: false }
    ]
  },
  {
    id: "5",
    question: "Qual blockchain é conhecida por NFTs?",
    options: [
      { id: "a", text: "Bitcoin", isCorrect: false },
      { id: "b", text: "Ethereum", isCorrect: true },
      { id: "c", text: "Litecoin", isCorrect: false },
      { id: "d", text: "Dogecoin", isCorrect: false }
    ]
  },
  {
    id: "6",
    question: "O que é 'Gas Fee'?",
    options: [
      { id: "a", text: "Taxa para processar transações", isCorrect: true },
      { id: "b", text: "Tipo de combustível crypto", isCorrect: false },
      { id: "c", text: "Taxa de câmbio", isCorrect: false },
      { id: "d", text: "Imposto governamental", isCorrect: false }
    ]
  },
  {
    id: "7",
    question: "O que significa 'HODL'?",
    options: [
      { id: "a", text: "Hold On for Dear Life", isCorrect: true },
      { id: "b", text: "High Order Digital Ledger", isCorrect: false },
      { id: "c", text: "Hash Original Data List", isCorrect: false },
      { id: "d", text: "Hold Original Digital License", isCorrect: false }
    ]
  },
  {
    id: "8",
    question: "Qual é o símbolo do Ethereum?",
    options: [
      { id: "a", text: "BTC", isCorrect: false },
      { id: "b", text: "ETH", isCorrect: true },
      { id: "c", text: "LTC", isCorrect: false },
      { id: "d", text: "XRP", isCorrect: false }
    ]
  },
  {
    id: "9",
    question: "O que é 'Mining'?",
    options: [
      { id: "a", text: "Processo de validar transações", isCorrect: true },
      { id: "b", text: "Comprar criptomoedas", isCorrect: false },
      { id: "c", text: "Vender criptomoedas", isCorrect: false },
      { id: "d", text: "Armazenar criptomoedas", isCorrect: false }
    ]
  },
  {
    id: "10",
    question: "O que é uma 'Wallet'?",
    options: [
      { id: "a", text: "Uma exchange de criptomoedas", isCorrect: false },
      { id: "b", text: "Um software para armazenar chaves", isCorrect: true },
      { id: "c", text: "Um tipo de blockchain", isCorrect: false },
      { id: "d", text: "Uma criptomoeda", isCorrect: false }
    ]
  }
];

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

export default function TournamentQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [round, setRound] = useState(1);
  const [remainingOpponents, setRemainingOpponents] = useState(opponents);
  const [isChampion, setIsChampion] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = (optionId: string) => {
    if (selectedAnswer || showAnswer) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setShowAnswer(true);
    const selectedOption = tournamentQuestions[currentQuestion].options.find(opt => opt.id === selectedAnswer);
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
      if (currentQuestion < tournamentQuestions.length - 1) {
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

  if (showResults) {
    const percentage = (score / tournamentQuestions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl p-8 shadow-card text-center">
          <div className="mb-6">
            <img src={satoshiMascot} alt="Satoshi" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isChampion ? "🏆 CAMPEÃO!" : "Torneio Finalizado!"}
            </h1>
            <div className="text-6xl mb-4">
              {isChampion ? "👑" : percentage >= 70 ? "🥇" : percentage >= 50 ? "🥈" : "🥉"}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{tournamentQuestions.length}
            </div>
            <p className="text-muted-foreground mb-4">
              {isChampion ? "Parabéns! Você dominou o torneio! 🎉" :
               percentage >= 70 ? "Excelente desempenho! 🏅" :
               percentage >= 50 ? "Bom resultado! Continue praticando! 💪" :
               "Não desista! Pratique mais e volte! 📚"}
            </p>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Sua colocação:</p>
              <ProgressBar 
                value={score} 
                max={tournamentQuestions.length} 
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
                      <div className="text-sm opacity-90">Pontos</div>
                      <div className="text-xl font-bold">500</div>
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
              Novo Torneio
            </Button>
            <Button variant="outline" onClick={() => navigate("/leaderboard")} className="w-full">
              Ver Ranking
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-orange-800 to-red-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/leaderboard")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">Torneio</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Tournament Info */}
        <Card className="mb-6 bg-yellow-500/20 border-yellow-500">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-sm text-white">Round</div>
                <div className="text-xl font-bold text-white">{round}</div>
              </div>
              <div>
                <Users className="h-6 w-6 text-orange-400 mx-auto mb-1" />
                <div className="text-sm text-white">Restam</div>
                <div className="text-xl font-bold text-white">{remainingOpponents.length}</div>
              </div>
              <div>
                <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-sm text-white">Pontos</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remaining Opponents */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <h3 className="text-white font-bold">Oponentes Restantes</h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {remainingOpponents.map((opponent, index) => (
                <div key={index} className="bg-slate-700 rounded-full px-3 py-1 flex items-center gap-1">
                  <span>{opponent.avatar}</span>
                  <span className="text-xs text-white">{opponent.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar 
            value={currentQuestion + 1} 
            max={tournamentQuestions.length}
            className="mb-2 bg-slate-700"
          />
          <p className="text-sm text-slate-400 text-right">
            {String(currentQuestion + 1).padStart(2, '0')} / {tournamentQuestions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-2">
            Pergunta: {String(currentQuestion + 1).padStart(2, '0')}
          </p>
          <h2 className="text-xl font-bold text-white leading-relaxed">
            {tournamentQuestions[currentQuestion].question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {tournamentQuestions[currentQuestion].options.map((option) => {
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
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-4 text-lg"
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
                Encerrar Torneio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar Torneio?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja sair do torneio? Seu progresso será perdido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => navigate("/leaderboard")}>
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