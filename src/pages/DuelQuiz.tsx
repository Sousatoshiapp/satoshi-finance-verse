import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Settings, Zap, Clock, Crown, Star, Trophy, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import confetti from "canvas-confetti";
import satoshiMascot from "@/assets/satoshi-mascot.png";
import { supabase } from "@/integrations/supabase/client";
import { AvatarDisplay } from "@/components/avatar-display";

const duelQuestions = [
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
    question: "O que é reserva de emergência?",
    options: [
      { id: "a", text: "Dinheiro para compras supérfluas", isCorrect: false },
      { id: "b", text: "Investimento de alto risco", isCorrect: false },
      { id: "c", text: "Recurso para situações inesperadas", isCorrect: true },
      { id: "d", text: "Dinheiro para férias", isCorrect: false }
    ]
  },
  {
    id: "3",
    question: "Qual a principal vantagem dos juros compostos?",
    options: [
      { id: "a", text: "Rendimento sobre rendimento", isCorrect: true },
      { id: "b", text: "Garantia de lucro", isCorrect: false },
      { id: "c", text: "Isento de riscos", isCorrect: false },
      { id: "d", text: "Liquidez imediata", isCorrect: false }
    ]
  },
  {
    id: "4",
    question: "O que significa 'Bull Market'?",
    options: [
      { id: "a", text: "Mercado em alta", isCorrect: true },
      { id: "b", text: "Mercado em baixa", isCorrect: false },
      { id: "c", text: "Mercado lateral", isCorrect: false },
      { id: "d", text: "Mercado fechado", isCorrect: false }
    ]
  },
  {
    id: "5",
    question: "O que é 'DCA' (Dollar Cost Averaging)?",
    options: [
      { id: "a", text: "Estratégia de investimento regular", isCorrect: true },
      { id: "b", text: "Tipo de criptomoeda", isCorrect: false },
      { id: "c", text: "Taxa da corretora", isCorrect: false },
      { id: "d", text: "Método de análise gráfica", isCorrect: false }
    ]
  }
];

// Mock user data - in real app this would come from auth
const mockUser = {
  nickname: localStorage.getItem('satoshi_user') ? JSON.parse(localStorage.getItem('satoshi_user')!).nickname : "Estudante",
  level: 4,
  avatar: "/lovable-uploads/874326e7-1122-419a-8916-5df0c112245d.png"
};

const mockOpponent = {
  nickname: "John Doe",
  level: 4,
  avatar: "/lovable-uploads/f344f3a7-aa34-4a5f-a2e0-8ac072c6aac5.png"
};

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  
  // Estados para controlar o fluxo
  const [currentStep, setCurrentStep] = useState<'config' | 'opponent' | 'prepare' | 'quiz' | 'result'>('config');
  const [duelConfig, setDuelConfig] = useState({
    opponentType: 'random' as 'random' | 'friend',
    category: 'mercado-tradicional' as 'cripto' | 'mercado-tradicional' | 'ambos',
    questionsCount: 5,
    difficulty: 'facil' as 'facil' | 'medio' | 'dificil'
  });
  
  // Estados do quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            *,
            avatars (*)
          `)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, []);

  // Timer effect para o quiz
  useEffect(() => {
    if (currentStep === 'quiz' && timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showAnswer && currentStep === 'quiz') {
      handleSubmit();
    }
  }, [timeLeft, showAnswer, currentStep]);

  // Simular oponente ficando pronto
  useEffect(() => {
    if (currentStep === 'prepare' && !opponentReady) {
      const timer = setTimeout(() => {
        setOpponentReady(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, opponentReady]);

  const handleConfigSubmit = () => {
    setCurrentStep('opponent');
  };

  const handleOpponentAccept = () => {
    setCurrentStep('prepare');
  };

  const handleStartQuiz = () => {
    if (isReady && opponentReady) {
      setCurrentStep('quiz');
      setTimeLeft(15);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (selectedAnswer || showAnswer) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    setShowAnswer(true);
    const selectedOption = duelQuestions[currentQuestion].options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.isCorrect || false;
    
    if (isCorrect) {
      setPlayerScore(playerScore + 1);
      fireVictoryConfetti();
    }

    // Simular resposta do oponente
    const opponentCorrect = Math.random() > 0.3;
    if (opponentCorrect) {
      setOpponentScore(opponentScore + 1);
    }

    setTimeout(() => {
      if (currentQuestion < duelQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setTimeLeft(15);
      } else {
        setCurrentStep('result');
      }
    }, 2000);
  };

  // Tela de Configuração do Duelo
  if (currentStep === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-[#1a2e05]">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/game-mode')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-white">Modo Duelo</h1>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center mb-8">
            <p className="text-white mb-4">Desafie um amigo ou um jogador aleatório em uma batalha de quiz 1vs1</p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Tipo de oponente */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Tipo de oponente</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setDuelConfig({...duelConfig, opponentType: 'random'})}
                      className={`p-4 h-auto ${
                        duelConfig.opponentType === 'random' 
                          ? 'bg-[#adff2f] border-[#adff2f] text-black' 
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                      }`}
                    >
                      Oponente aleatório
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/find-opponent')}
                      className={`p-4 h-auto ${
                        duelConfig.opponentType === 'friend' 
                          ? 'bg-[#adff2f] border-[#adff2f] text-black' 
                          : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                      }`}
                    >
                      Desafie amigos
                    </Button>
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Selecione a categoria</h3>
                  <RadioGroup 
                    value={duelConfig.category} 
                    onValueChange={(value) => setDuelConfig({...duelConfig, category: value as any})}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cripto" id="cripto" className="border-white" />
                      <Label htmlFor="cripto" className="text-white">Cripto</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-[#adff2f] p-3 rounded">
                      <RadioGroupItem value="mercado-tradicional" id="tradicional" className="border-black" />
                      <Label htmlFor="tradicional" className="text-black font-semibold">Mercado financeiro tradicional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ambos" id="ambos" className="border-white" />
                      <Label htmlFor="ambos" className="text-white">Ambos</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Quantidade de perguntas */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Qtd de perguntas</h3>
                  <Select value={duelConfig.questionsCount.toString()} onValueChange={(value) => setDuelConfig({...duelConfig, questionsCount: parseInt(value)})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dificuldade */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Níveis de dificuldade</h3>
                  <Select value={duelConfig.difficulty} onValueChange={(value) => setDuelConfig({...duelConfig, difficulty: value as any})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facil">Fácil</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="dificil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleConfigSubmit}
            className="w-full bg-[#adff2f] hover:bg-[#adff2f]/80 text-black font-bold py-4 text-lg rounded-full"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Tela de Oponente Encontrado
  if (currentStep === 'opponent') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-[#1a2e05]">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep('config')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-white">Oponente encontrado</h1>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center mb-8">
            {/* Oponente */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 border-4 border-blue-500 rounded-full p-1">
                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src={mockOpponent.avatar} 
                    alt={mockOpponent.nickname}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <h2 className="text-white text-xl font-bold">{mockOpponent.nickname}</h2>
              <p className="text-slate-400">Nível: {mockOpponent.level}</p>
            </div>

            {/* VS */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-[#adff2f] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-2xl">VS</span>
              </div>
            </div>

            {/* Usuário */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-4 border-4 border-[#adff2f] rounded-full p-1">
                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile?.avatars ? (
                    <AvatarDisplay 
                      avatar={userProfile.avatars} 
                      size="lg" 
                      showBadge={false}
                    />
                  ) : userProfile?.profile_image_url ? (
                    <img 
                      src={userProfile.profile_image_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <img src={satoshiMascot} alt="Default" className="w-12 h-12" />
                  )}
                </div>
              </div>
              <h2 className="text-white text-xl font-bold">
                {userProfile?.nickname || mockUser.nickname}
              </h2>
              <p className="text-slate-400">Nível: {userProfile?.level || mockUser.level}</p>
            </div>
          </div>

          {/* Recompensas */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold text-center mb-4">Recompensas</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-yellow-400 text-2xl mb-1">💰</div>
                  <div className="text-white font-bold">Ganhe</div>
                  <div className="text-white text-xl font-bold">40 XP</div>
                </div>
                <div>
                  <div className="text-blue-400 text-2xl mb-1">⭐</div>
                  <div className="text-white font-bold">Pontos</div>
                  <div className="text-white text-xl font-bold">80</div>
                </div>
                <div>
                  <div className="text-orange-400 text-2xl mb-1">🏆</div>
                  <div className="text-white font-bold">Troféu</div>
                  <div className="text-orange-400">🥇</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleOpponentAccept}
            className="w-full bg-[#adff2f] hover:bg-[#adff2f]/80 text-black font-bold py-4 text-lg rounded-full"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Tela de Preparação
  if (currentStep === 'prepare') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div 
            className={`w-80 h-80 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
              isReady && opponentReady 
                ? 'border-[#adff2f] bg-[#adff2f]/20 cursor-pointer hover:bg-[#adff2f]/30' 
                : 'border-[#adff2f]/50 bg-[#adff2f]/10'
            }`}
            onClick={handleStartQuiz}
          >
            <span className="text-[#adff2f] font-bold text-3xl">
              {isReady && opponentReady ? 'INICIAR' : 'PREPARAR'}
            </span>
          </div>
          
          {!isReady && (
            <Button 
              onClick={() => setIsReady(true)}
              className="mt-8 bg-[#adff2f] hover:bg-[#adff2f]/80 text-black font-bold px-8 py-3"
            >
              Estou Pronto!
            </Button>
          )}
          
          {isReady && !opponentReady && (
            <p className="text-white mt-4">Aguardando oponente...</p>
          )}
        </div>
      </div>
    );
  }

  // Tela do Quiz Ativo
  if (currentStep === 'quiz') {
    const currentQ = duelQuestions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-[#1a2e05]">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Header com perfis */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={mockUser.avatar} alt={mockUser.nickname} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-white font-semibold">{mockUser.nickname}</p>
                  <p className="text-slate-400 text-sm">Pontos: {playerScore}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#adff2f] rounded-full flex items-center justify-center mb-2">
                  <span className="text-[#adff2f] font-bold text-lg">{timeLeft}</span>
                </div>
                <p className="text-xs text-slate-400">Seg</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white font-semibold">{mockOpponent.nickname}</p>
                  <p className="text-slate-400 text-sm">Pontos: {opponentScore}</p>
                </div>
                <img src={mockOpponent.avatar} alt={mockOpponent.nickname} className="w-12 h-12 rounded-full" />
              </div>
            </div>
          </div>

          {/* Progresso */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 bg-slate-700 h-2 rounded-full mr-4">
              <div 
                className="bg-[#adff2f] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / duelQuestions.length) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">
              {String(currentQuestion + 1).padStart(2, '0')} / {String(duelQuestions.length).padStart(2, '0')}
            </span>
          </div>

          {/* Pergunta */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-2">Pergunta: {String(currentQuestion + 1).padStart(2, '0')}</p>
            <h2 className="text-white text-xl font-bold leading-relaxed">{currentQ.question}</h2>
          </div>

          {/* Opções */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = option.isCorrect;
              
              let optionClass = "bg-slate-700 border-slate-600 text-white hover:bg-slate-600";
              
              if (showAnswer) {
                if (isSelected && isCorrect) {
                  optionClass = "bg-[#adff2f] border-[#adff2f] text-black";
                } else if (isSelected && !isCorrect) {
                  optionClass = "bg-red-600 border-red-500 text-white";
                } else if (isCorrect) {
                  optionClass = "bg-[#adff2f] border-[#adff2f] text-black";
                }
              } else if (isSelected) {
                optionClass = "bg-slate-600 border-slate-500 text-white";
              }
              
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={`w-full text-left justify-start min-h-[56px] p-4 ${optionClass}`}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={showAnswer}
                >
                  <span className="font-bold mr-3">{option.id.toUpperCase()}.</span>
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
              className="w-full bg-[#adff2f] hover:bg-[#adff2f]/80 text-black font-bold py-4 text-lg rounded-full"
            >
              Enviar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full py-4 text-lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Encerrar Duelo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar Duelo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja sair do duelo? Seu oponente será declarado vencedor.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => navigate("/duels")}>
                    Encerrar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Resultado
  if (currentStep === 'result') {
    const playerWon = playerScore > opponentScore;
    const isDraw = playerScore === opponentScore;
    
    if (playerWon) {
      fireVictoryConfetti();
    }
    
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
        {/* Confetti background para vitória */}
        {playerWon && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 text-yellow-400 text-4xl animate-bounce">🎉</div>
            <div className="absolute top-20 right-10 text-yellow-400 text-3xl animate-pulse">⭐</div>
            <div className="absolute bottom-20 left-20 text-yellow-400 text-3xl animate-bounce">✨</div>
            <div className="absolute bottom-10 right-20 text-yellow-400 text-4xl animate-pulse">🏆</div>
          </div>
        )}
        
        <Card className="max-w-md w-full bg-gradient-to-b from-[#adff2f] to-[#8cc020] border-none text-center">
          <CardContent className="p-8">
            {/* Avatar com coroa se ganhou */}
            <div className="relative mb-6">
              <img 
                src={mockUser.avatar} 
                alt={mockUser.nickname}
                className="w-24 h-24 rounded-full mx-auto border-4 border-white"
              />
              {playerWon && (
                <Crown className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 text-yellow-400" />
              )}
            </div>

            <div className="mb-6">
              <h1 className="text-black text-4xl font-bold mb-2">
                {isDraw ? "Empate!" : playerWon ? "Parabéns!" : "Que pena!"}
              </h1>
              <p className="text-black text-xl">
                {isDraw ? "Foi por pouco!" : playerWon ? "Você venceu!" : "Você perdeu!"}
              </p>
            </div>

            {/* Recompensas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#8cc020] rounded-xl p-4">
                <div className="text-yellow-400 text-2xl mb-1">💰</div>
                <div className="text-black font-bold">XP</div>
                <div className="text-black text-xl font-bold">40</div>
              </div>
              <div className="bg-[#8cc020] rounded-xl p-4">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-black font-bold">Pontos</div>
                <div className="text-black text-xl font-bold">80</div>
              </div>
              <div className="bg-[#8cc020] rounded-xl p-4">
                <Trophy className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                <div className="text-black font-bold">Troféu</div>
                <div className="text-orange-400">🏆</div>
              </div>
            </div>

            {/* Placar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <img src={mockUser.avatar} alt={mockUser.nickname} className="w-12 h-12 rounded-full mx-auto mb-2" />
                <p className="text-black font-semibold">{mockUser.nickname}</p>
                <p className="text-black text-sm">Você</p>
              </div>
              
              <div className="bg-[#8cc020] rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-black font-bold text-xl">{playerScore}</span>
              </div>
              
              <div className="text-black font-bold text-2xl">-</div>
              
              <div className="bg-slate-600 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{opponentScore}</span>
              </div>
              
              <div className="text-center">
                <img src={mockOpponent.avatar} alt={mockOpponent.nickname} className="w-12 h-12 rounded-full mx-auto mb-2" />
                <p className="text-black font-semibold">{mockOpponent.nickname}</p>
                <p className="text-black text-sm">Oponente</p>
              </div>
            </div>

            {/* Progresso de nível */}
            <div className="mb-6">
              <div className="flex justify-between text-black text-sm mb-2">
                <span>Nível {mockUser.level}</span>
                <span>Próximo Nível: Raposa Astuta</span>
              </div>
              <div className="w-full bg-slate-600 h-2 rounded-full">
                <div className="bg-[#8cc020] h-2 rounded-full w-3/4"></div>
              </div>
            </div>

            {/* Botões */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate('/game-mode')}
                className="bg-[#8cc020] hover:bg-[#8cc020]/80 text-black font-bold py-3 rounded-full"
              >
                Próximo Nível ▶
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-full"
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}