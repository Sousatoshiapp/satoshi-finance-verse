import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Zap, Target, Clock, Loader2, User } from "lucide-react";
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
    <div className="min-h-screen bg-background pb-20">
      {/* Grid pattern background like dashboard */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary-rgb), 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="max-w-md mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/duels')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            Encontrar Oponente
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Topic Selection */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center gap-2">
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
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="font-medium">{topic.name}</div>
                <div className="text-xs opacity-70">{topic.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Matchmaking Section */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sistema de Duelos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSearching ? (
              <Button 
                onClick={handleStartSearch}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold py-4"
              >
                <Zap className="mr-2 h-5 w-5" />
                Procurar Oponente
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-lg font-medium text-foreground">
                    {matchResult?.opponentType === 'waiting' ? 'Procurando oponente...' : 'Conectando...'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Tempo de busca: {Math.floor(searchTime / 60)}:{(searchTime % 60).toString().padStart(2, '0')}
                </div>
                {matchResult?.opponentType === 'waiting' && (
                  <p className="text-xs text-muted-foreground">
                    Você está na fila. Um oponente será encontrado automaticamente.
                  </p>
                )}
                <Button 
                  onClick={handleCancelSearch}
                  variant="outline"
                  className="w-full"
                >
                  Cancelar Busca
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Status */}
        {matchResult && (
          <Card className="mb-6 bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-3">
                {matchResult.opponentType === 'bot' ? (
                  <User className="h-6 w-6 text-primary" />
                ) : matchResult.opponentType === 'human' ? (
                  <User className="h-6 w-6 text-primary" />
                ) : (
                  <Clock className="h-6 w-6 text-secondary" />
                )}
                <span className="text-foreground font-medium">
                  {matchResult.opponentType === 'bot' && 'Oponente encontrado!'}
                  {matchResult.opponentType === 'human' && 'Oponente encontrado!'}
                  {matchResult.opponentType === 'waiting' && 'Na fila de espera...'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it Works */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold mt-0.5">1</div>
              <div>Escolha um tópico e clique em "Procurar Oponente"</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold mt-0.5">2</div>
              <div>Sistema busca por oponentes disponíveis</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold mt-0.5">3</div>
              <div>Um oponente compatível será encontrado rapidamente</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold mt-0.5">4</div>
              <div>Duelo inicia automaticamente quando o match é encontrado</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FloatingNavbar />
    </div>
  );
}