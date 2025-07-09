import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Zap, Target, Clock, Loader2, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useDuelMatchmaking } from "@/hooks/use-duel-matchmaking";

const topics = [
  { id: "financas", name: "Finanças Gerais", description: "Conceitos básicos de educação financeira" },
  { id: "investimentos", name: "Investimentos", description: "Ações, fundos, renda fixa" },
  { id: "criptomoedas", name: "Criptomoedas", description: "Bitcoin, Ethereum e blockchain" },
  { id: "economia", name: "Economia", description: "Macroeconomia e mercados" },
];

export default function FindOpponent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState("financas");
  const { isSearching, matchResult, startMatchmaking, cancelMatchmaking, createDuel } = useDuelMatchmaking();
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  // Handle match results
  useEffect(() => {
    if (matchResult?.matchFound && matchResult.opponentId) {
      handleMatchFound();
    }
  }, [matchResult]);

  const handleMatchFound = async () => {
    try {
      if (!matchResult?.opponentId) return;
      
      const duel = await createDuel(matchResult.opponentId, selectedTopic);
      
      toast({
        title: "Duelo criado!",
        description: "Redirecionando para o duelo...",
      });
      
      // Navigate to duels page to see active duel
      navigate('/duels');
    } catch (error) {
      console.error('Error handling match:', error);
      toast({
        title: "Erro ao criar duelo",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleStartSearch = async () => {
    try {
      await startMatchmaking(selectedTopic);
    } catch (error) {
      console.error('Error starting search:', error);
      toast({
        title: "Erro ao iniciar busca",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleCancelSearch = async () => {
    await cancelMatchmaking();
    setSearchTime(0);
    toast({
      title: "Busca cancelada",
      description: "Você pode tentar novamente quando quiser",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 pb-20">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(173, 255, 47, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(173, 255, 47, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
      </div>

      <div className="max-w-md mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/duels')}
            className="text-[#adff2f] hover:bg-[#adff2f]/10 hover:text-[#adff2f] border border-[#adff2f]/30 hover:border-[#adff2f]/60 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#adff2f] via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ENCONTRAR OPONENTE
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Topic Selection */}
        <Card className="relative border-none shadow-none mb-6" style={{
          background: 'linear-gradient(135deg, rgba(173, 255, 47, 0.1), rgba(255, 0, 255, 0.1), rgba(255, 255, 0, 0.05))',
          boxShadow: '0 8px 32px rgba(173, 255, 47, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(173, 255, 47, 0.2)'
        }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#adff2f] flex items-center gap-2">
              <Target className="h-5 w-5" />
              Escolha o Tópico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedTopic === topic.id
                    ? 'border-[#adff2f] bg-[#adff2f]/10 text-[#adff2f]'
                    : 'border-white/20 hover:border-[#adff2f]/50 text-white/80 hover:text-white'
                }`}
              >
                <div className="font-medium">{topic.name}</div>
                <div className="text-xs opacity-70">{topic.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Matchmaking Section */}
        <Card className="relative border-none shadow-none mb-6" style={{
          background: 'linear-gradient(135deg, rgba(173, 255, 47, 0.1), rgba(255, 0, 255, 0.1), rgba(255, 255, 0, 0.05))',
          boxShadow: '0 8px 32px rgba(173, 255, 47, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(173, 255, 47, 0.2)'
        }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#adff2f] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sistema de Duelos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSearching ? (
              <Button 
                onClick={handleStartSearch}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4"
              >
                <Zap className="mr-2 h-5 w-5" />
                Procurar Oponente
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#adff2f]" />
                  <span className="text-lg font-medium text-white">
                    {matchResult?.opponentType === 'waiting' ? 'Procurando oponente...' : 'Conectando...'}
                  </span>
                </div>
                <div className="text-sm text-white/60">
                  Tempo de busca: {Math.floor(searchTime / 60)}:{(searchTime % 60).toString().padStart(2, '0')}
                </div>
                {matchResult?.opponentType === 'waiting' && (
                  <p className="text-xs text-white/50">
                    Você está na fila. Um bot será designado automaticamente se nenhum jogador for encontrado.
                  </p>
                )}
                <Button 
                  onClick={handleCancelSearch}
                  variant="outline"
                  className="w-full border-[#adff2f]/30 text-[#adff2f] hover:bg-[#adff2f]/10"
                >
                  Cancelar Busca
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Status */}
        {matchResult && (
          <Card className="relative border-none shadow-none mb-6" style={{
            background: 'linear-gradient(135deg, rgba(173, 255, 47, 0.1), rgba(255, 0, 255, 0.1), rgba(255, 255, 0, 0.05))',
            boxShadow: '0 8px 32px rgba(173, 255, 47, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(173, 255, 47, 0.2)'
          }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-3">
                {matchResult.opponentType === 'bot' ? (
                  <Bot className="h-6 w-6 text-purple-400" />
                ) : matchResult.opponentType === 'human' ? (
                  <User className="h-6 w-6 text-blue-400" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-400" />
                )}
                <span className="text-white font-medium">
                  {matchResult.opponentType === 'bot' && 'Bot encontrado!'}
                  {matchResult.opponentType === 'human' && 'Jogador encontrado!'}
                  {matchResult.opponentType === 'waiting' && 'Na fila de espera...'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card className="relative border-none shadow-none" style={{
          background: 'linear-gradient(135deg, rgba(173, 255, 47, 0.05), rgba(255, 0, 255, 0.05), rgba(255, 255, 0, 0.02))',
          border: '1px solid rgba(173, 255, 47, 0.1)'
        }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-[#adff2f] text-sm">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-white/60 space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-[#adff2f] flex items-center justify-center text-black text-xs font-bold mt-0.5">1</div>
              <div>Escolha um tópico e clique em "Procurar Oponente"</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-black text-xs font-bold mt-0.5">2</div>
              <div>Sistema busca por jogadores reais primeiro</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center text-black text-xs font-bold mt-0.5">3</div>
              <div>Se não encontrar, um bot inteligente será seu oponente</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold mt-0.5">4</div>
              <div>Duelo inicia automaticamente quando o match é encontrado</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FloatingNavbar />
    </div>
  );
}