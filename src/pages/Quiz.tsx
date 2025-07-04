import { useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import satoshiMascot from "@/assets/satoshi-mascot.png";

const quizQuestions = [
  {
    id: "1",
    question: "Qual é a melhor estratégia para investir a longo prazo?",
    options: [
      { id: "a", text: "Ativos diversificados", isCorrect: true },
      { id: "b", text: "Day Trading", isCorrect: false },
      { id: "c", text: "Colocar tudo em criptomoedas", isCorrect: false },
      { id: "d", text: "Deixar todo dinheiro no colchão", isCorrect: false }
    ]
  },
  {
    id: "2", 
    question: "O que é uma reserva de emergência?",
    options: [
      { id: "a", text: "Dinheiro para comprar coisas supérfluas", isCorrect: false },
      { id: "b", text: "Valor guardado para imprevistos e emergências", isCorrect: true },
      { id: "c", text: "Dinheiro para investir em ações arriscadas", isCorrect: false },
      { id: "d", text: "Valor para pagar dívidas", isCorrect: false }
    ]
  },
  {
    id: "3",
    question: "Qual o valor ideal para uma reserva de emergência?",
    options: [
      { id: "a", text: "1 mês de gastos", isCorrect: false },
      { id: "b", text: "3 a 6 meses de gastos", isCorrect: true },
      { id: "c", text: "1 ano de gastos", isCorrect: false },
      { id: "d", text: "Não é necessário ter reserva", isCorrect: false }
    ]
  },
  {
    id: "4",
    question: "Quando você deve começar a investir?",
    options: [
      { id: "a", text: "Apenas quando tiver muito dinheiro", isCorrect: false },
      { id: "b", text: "Depois de quitar todas as dívidas e ter uma reserva", isCorrect: true },
      { id: "c", text: "Nunca, é muito arriscado", isCorrect: false },
      { id: "d", text: "Imediatamente, mesmo com dívidas", isCorrect: false }
    ]
  },
  {
    id: "5",
    question: "O que significa 'pagar a si mesmo primeiro'?",
    options: [
      { id: "a", text: "Comprar coisas para si antes dos outros", isCorrect: false },
      { id: "b", text: "Separar dinheiro para poupança antes de outros gastos", isCorrect: true },
      { id: "c", text: "Pagar apenas suas próprias contas", isCorrect: false },
      { id: "d", text: "Priorizar gastos pessoais sobre familiares", isCorrect: false }
    ]
  }
];

export default function Quiz() {
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
    const selectedOption = quizQuestions[currentQuestion].options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
      } else {
        setShowResults(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 80) return "Excelente! Você domina os conceitos! 🎉";
    if (percentage >= 60) return "Muito bom! Continue estudando! 👏";
    if (percentage >= 40) return "Você está no caminho certo! 💪";
    return "Continue praticando, você vai conseguir! 📚";
  };

  const getScoreEmoji = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 80) return "🏆";
    if (percentage >= 60) return "🥉";
    if (percentage >= 40) return "💪";
    return "📚";
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-card rounded-xl p-8 shadow-card text-center">
          <div className="mb-6">
            <img src={satoshiMascot} alt="Satoshi" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Finalizado!</h1>
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {score}/{quizQuestions.length}
            </div>
            <p className="text-muted-foreground mb-4">
              {getScoreMessage()}
            </p>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Seu desempenho:</p>
              <ProgressBar 
                value={score} 
                max={quizQuestions.length} 
                className="mb-2"
              />
              <p className="text-sm font-semibold">
                {Math.round((score / quizQuestions.length) * 100)}% de acerto
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={resetQuiz} className="w-full">
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-green-900">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
            Tartaruga Estrategista
          </h1>
          <p className="text-slate-300 text-sm mb-6">
            Responda & Ganhe XP, Pontos & Troféus!
          </p>

          {/* Rewards Card */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Ganhe</div>
                  <div className="text-lg font-bold text-white">50 XP</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Pontos</div>
                  <div className="text-lg font-bold text-white">100</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Troféu</div>
                  <div className="text-2xl">🏆</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar 
            value={currentQuestion + 1} 
            max={quizQuestions.length}
            className="mb-2 bg-slate-700"
          />
          <p className="text-sm text-slate-400 text-right">
            {String(currentQuestion + 1).padStart(2, '0')} / {quizQuestions.length}
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-2">
            Pergunta: {String(currentQuestion + 1).padStart(2, '0')}
          </p>
          <h2 className="text-xl font-bold text-white leading-relaxed">
            {quizQuestions[currentQuestion].question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {quizQuestions[currentQuestion].options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const isCorrect = option.isCorrect;
            
            let optionClass = "bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700";
            
            if (showAnswer) {
              if (isSelected && isCorrect) {
                optionClass = "bg-green-600 border-green-500 text-white";
              } else if (isSelected && !isCorrect) {
                optionClass = "bg-red-600 border-red-500 text-white";
              } else if (isCorrect) {
                optionClass = "bg-green-600 border-green-500 text-white";
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

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || showAnswer}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 text-lg"
        >
          {showAnswer ? "Próxima Pergunta..." : "Enviar"}
        </Button>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}