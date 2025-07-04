import { useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import satoshiMascot from "@/assets/satoshi-mascot.png";

const quizTopics = [
  {
    id: "investments",
    title: "Investimentos",
    questions: [
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
        question: "O que é o risco de mercado?",
        options: [
          { id: "a", text: "Risco de perder dinheiro por mudanças no mercado", isCorrect: true },
          { id: "b", text: "Risco de ganhar muito dinheiro", isCorrect: false },
          { id: "c", text: "Risco de não conseguir vender", isCorrect: false },
          { id: "d", text: "Risco de inflação", isCorrect: false }
        ]
      },
      {
        id: "3",
        question: "Qual a principal vantagem dos fundos de investimento?",
        options: [
          { id: "a", text: "Não têm taxas", isCorrect: false },
          { id: "b", text: "Diversificação com pouco dinheiro", isCorrect: true },
          { id: "c", text: "Garantia de lucro", isCorrect: false },
          { id: "d", text: "Liquidez imediata sempre", isCorrect: false }
        ]
      },
      {
        id: "4",
        question: "O que é o Tesouro Direto?",
        options: [
          { id: "a", text: "Investimento em ações", isCorrect: false },
          { id: "b", text: "Títulos públicos do governo", isCorrect: true },
          { id: "c", text: "Conta bancária especial", isCorrect: false },
          { id: "d", text: "Aplicação em imóveis", isCorrect: false }
        ]
      },
      {
        id: "5",
        question: "Qual é a regra dos 72?",
        options: [
          { id: "a", text: "Tempo para aposentar", isCorrect: false },
          { id: "b", text: "Calcular quando o dinheiro dobra", isCorrect: true },
          { id: "c", text: "Porcentagem máxima de renda", isCorrect: false },
          { id: "d", text: "Idade para investir", isCorrect: false }
        ]
      }
    ]
  },
  {
    id: "budget",
    title: "Orçamento Pessoal",
    questions: [
      {
        id: "1",
        question: "Qual é a regra 50-30-20?",
        options: [
          { id: "a", text: "50% necessidades, 30% desejos, 20% poupança", isCorrect: true },
          { id: "b", text: "50% poupança, 30% gastos, 20% investimentos", isCorrect: false },
          { id: "c", text: "50% salário, 30% bônus, 20% extra", isCorrect: false },
          { id: "d", text: "50% casa, 30% comida, 20% transporte", isCorrect: false }
        ]
      },
      {
        id: "2",
        question: "O que é uma reserva de emergência?",
        options: [
          { id: "a", text: "Dinheiro para comprar coisas supérfluas", isCorrect: false },
          { id: "b", text: "Valor guardado para imprevistos", isCorrect: true },
          { id: "c", text: "Dinheiro para investir em ações", isCorrect: false },
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
        question: "Como controlar gastos desnecessários?",
        options: [
          { id: "a", text: "Não anotar os gastos", isCorrect: false },
          { id: "b", text: "Fazer planilha de gastos mensais", isCorrect: true },
          { id: "c", text: "Gastar apenas com cartão", isCorrect: false },
          { id: "d", text: "Evitar usar dinheiro", isCorrect: false }
        ]
      },
      {
        id: "5",
        question: "O que significa 'pagar a si mesmo primeiro'?",
        options: [
          { id: "a", text: "Comprar coisas para si antes dos outros", isCorrect: false },
          { id: "b", text: "Separar dinheiro para poupança antes de outros gastos", isCorrect: true },
          { id: "c", text: "Pagar apenas suas próprias contas", isCorrect: false },
          { id: "d", text: "Priorizar gastos pessoais", isCorrect: false }
        ]
      }
    ]
  },
  {
    id: "debt",
    title: "Gestão de Dívidas",
    questions: [
      {
        id: "1",
        question: "Qual a melhor estratégia para quitar dívidas?",
        options: [
          { id: "a", text: "Pagar apenas o mínimo sempre", isCorrect: false },
          { id: "b", text: "Quitar primeiro as de maior juros", isCorrect: true },
          { id: "c", text: "Ignorar as dívidas", isCorrect: false },
          { id: "d", text: "Fazer mais empréstimos", isCorrect: false }
        ]
      },
      {
        id: "2",
        question: "O que é o método 'bola de neve' para dívidas?",
        options: [
          { id: "a", text: "Pagar as dívidas menores primeiro", isCorrect: true },
          { id: "b", text: "Pagar apenas juros", isCorrect: false },
          { id: "c", text: "Não pagar nenhuma dívida", isCorrect: false },
          { id: "d", text: "Pagar aleatoriamente", isCorrect: false }
        ]
      },
      {
        id: "3",
        question: "Quando é recomendado fazer um empréstimo?",
        options: [
          { id: "a", text: "Para comprar supérfluos", isCorrect: false },
          { id: "b", text: "Para investir em educação ou imóvel", isCorrect: true },
          { id: "c", text: "Para viajar", isCorrect: false },
          { id: "d", text: "Para comprar roupas", isCorrect: false }
        ]
      },
      {
        id: "4",
        question: "O que é o score de crédito?",
        options: [
          { id: "a", text: "Pontuação de quanto você ganha", isCorrect: false },
          { id: "b", text: "Análise do seu histórico de pagamentos", isCorrect: true },
          { id: "c", text: "Valor máximo para empréstimo", isCorrect: false },
          { id: "d", text: "Taxa de juros fixa", isCorrect: false }
        ]
      },
      {
        id: "5",
        question: "Como negociar dívidas em atraso?",
        options: [
          { id: "a", text: "Esperar que cobrem", isCorrect: false },
          { id: "b", text: "Procurar o credor para renegociar", isCorrect: true },
          { id: "c", text: "Mudar de telefone", isCorrect: false },
          { id: "d", text: "Fazer mais dívidas", isCorrect: false }
        ]
      }
    ]
  },
  {
    id: "retirement",
    title: "Aposentadoria",
    questions: [
      {
        id: "1",
        question: "Quando deve começar a planejar a aposentadoria?",
        options: [
          { id: "a", text: "Aos 50 anos", isCorrect: false },
          { id: "b", text: "O mais cedo possível", isCorrect: true },
          { id: "c", text: "Só quando estiver próximo", isCorrect: false },
          { id: "d", text: "Nunca precisa planejar", isCorrect: false }
        ]
      },
      {
        id: "2",
        question: "O que é previdência privada?",
        options: [
          { id: "a", text: "Investimento complementar para aposentadoria", isCorrect: true },
          { id: "b", text: "Substituto do INSS", isCorrect: false },
          { id: "c", text: "Seguro de vida", isCorrect: false },
          { id: "d", text: "Conta corrente especial", isCorrect: false }
        ]
      },
      {
        id: "3",
        question: "Qual a vantagem do PGBL?",
        options: [
          { id: "a", text: "Dedução no imposto de renda", isCorrect: true },
          { id: "b", text: "Isenção total de impostos", isCorrect: false },
          { id: "c", text: "Liquidez imediata", isCorrect: false },
          { id: "d", text: "Garantia de lucro", isCorrect: false }
        ]
      },
      {
        id: "4",
        question: "Como calcular quanto preciso para aposentar?",
        options: [
          { id: "a", text: "10 vezes o salário atual", isCorrect: false },
          { id: "b", text: "25 vezes os gastos anuais", isCorrect: true },
          { id: "c", text: "5 vezes o salário", isCorrect: false },
          { id: "d", text: "Não precisa calcular", isCorrect: false }
        ]
      },
      {
        id: "5",
        question: "O que são juros compostos?",
        options: [
          { id: "a", text: "Juros sobre juros", isCorrect: true },
          { id: "b", text: "Juros simples", isCorrect: false },
          { id: "c", text: "Taxa bancária", isCorrect: false },
          { id: "d", text: "Desconto em compras", isCorrect: false }
        ]
      }
    ]
  }
];

// Função para obter um quiz aleatório
const getRandomQuiz = () => {
  const randomTopic = quizTopics[Math.floor(Math.random() * quizTopics.length)];
  return {
    title: randomTopic.title,
    questions: randomTopic.questions
  };
};

export default function Quiz() {
  const [currentQuiz] = useState(() => getRandomQuiz());  
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
    }

    setTimeout(() => {
      if (currentQuestion < currentQuiz.questions.length - 1) {
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
    const percentage = (score / currentQuiz.questions.length) * 100;
    if (percentage >= 80) return "Excelente! Você domina os conceitos! 🎉";
    if (percentage >= 60) return "Muito bom! Continue estudando! 👏";
    if (percentage >= 40) return "Você está no caminho certo! 💪";
    return "Continue praticando, você vai conseguir! 📚";
  };

  const getScoreEmoji = () => {
    const percentage = (score / currentQuiz.questions.length) * 100;
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
              {score}/{currentQuiz.questions.length}
            </div>
            <p className="text-muted-foreground mb-4">
              {getScoreMessage()}
            </p>
            
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Seu desempenho:</p>
              <ProgressBar 
                value={score} 
                max={currentQuiz.questions.length} 
                className="mb-2"
              />
              <p className="text-sm font-semibold">
                {Math.round((score / currentQuiz.questions.length) * 100)}% de acerto
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
            {currentQuiz.title}
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
                optionClass = "bg-green-600 border-green-500 text-white";
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