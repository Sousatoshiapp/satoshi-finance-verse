import { useState } from "react";
import { QuizCard } from "@/components/quiz-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import satoshiMascot from "@/assets/satoshi-mascot.png";

const quizQuestions = [
  {
    id: "1",
    question: "Qual é a regra básica para criar um orçamento pessoal eficiente?",
    options: [
      { id: "a", text: "Gastar tudo que ganha no mês", isCorrect: false },
      { id: "b", text: "Separar 50% para gastos essenciais, 30% para desejos e 20% para poupança", isCorrect: true },
      { id: "c", text: "Não se preocupar com planejamento", isCorrect: false },
      { id: "d", text: "Guardar apenas sobras do mês", isCorrect: false }
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
  const navigate = useNavigate();

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    }, 500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                ← Voltar
              </Button>
              <img src={satoshiMascot} alt="Satoshi" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-foreground">Quiz de Finanças</h1>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {quizQuestions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <ProgressBar 
          value={currentQuestion + 1} 
          max={quizQuestions.length}
          className="mb-2"
        />
        <p className="text-sm text-muted-foreground text-center">
          Pergunta {currentQuestion + 1} de {quizQuestions.length}
        </p>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <QuizCard
          question={quizQuestions[currentQuestion].question}
          options={quizQuestions[currentQuestion].options}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}