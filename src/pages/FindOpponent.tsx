import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useEnhancedDuelMatchmaking } from "@/hooks/use-enhanced-duel-matchmaking";
import { MatchmakingWheel } from "@/components/duels/matchmaking-wheel";

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
  const { isSearching, matchResult, startMatchmaking, cancelMatchmaking, createDuel, setIsSearching } = useEnhancedDuelMatchmaking();
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    if (showWheel && !isSearching) {
      setShowWheel(false);
    }
  }, [isSearching, showWheel]);

  const handleMatchFound = async (opponent: any) => {
    try {
      setShowWheel(false);
      setIsSearching(false);
      
      const duel = await createDuel(opponent.id, selectedTopic);
      
      toast({
        title: "🎉 Duelo criado!",
        description: `Iniciando duelo contra ${opponent.nickname}...`,
      });
      
      setTimeout(() => {
        navigate('/duels');
      }, 1000);
    } catch (error) {
      console.error('Error handling match:', error);
      toast({
        title: "❌ Erro ao criar duelo",
        description: "Tente novamente",
        variant: "destructive"
      });
      setShowWheel(false);
      setIsSearching(false);
    }
  };

  const handleStartSearch = async () => {
    try {
      setShowWheel(true);
      await startMatchmaking(selectedTopic);
    } catch (error) {
      console.error('Error starting search:', error);
      toast({
        title: "❌ Erro ao iniciar busca",
        description: "Tente novamente",
        variant: "destructive"
      });
      setShowWheel(false);
    }
  };

  const handleCancelSearch = async () => {
    await cancelMatchmaking();
    setShowWheel(false);
    toast({
      title: "🚫 Busca cancelada",
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
                    ? 'border-primary bg-primary/10 text-primary shadow-lg'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {topic.name}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {topic.description}
                    </div>
                  </div>
                  {selectedTopic === topic.id && (
                    <div className="text-primary">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Start Match Button */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-primary animate-pulse" />
                <h2 className="text-2xl font-bold text-primary">
                  Arena de Duelos
                </h2>
                <Zap className="h-8 w-8 text-primary animate-pulse" />
              </div>
              
              <p className="text-muted-foreground">
                10 perguntas • 30 segundos cada • Duelo simultâneo
              </p>
              
              <Button
                onClick={handleStartSearch}
                disabled={isSearching || showWheel}
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-6 text-lg shadow-lg transform transition-transform hover:scale-105"
              >
                <Users className="mr-2 h-5 w-5" />
                🎯 Encontrar Oponente
              </Button>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  Buscando
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matchmaking Wheel */}
        <MatchmakingWheel
          isSearching={showWheel}
          onMatchFound={handleMatchFound}
          onCancel={handleCancelSearch}
          topic={selectedTopic}
        />

        {/* How it Works */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="w-5 h-5 rounded-full p-0 flex items-center justify-center">1</Badge>
              <div>Escolha um tópico e clique em "Encontrar Oponente"</div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="w-5 h-5 rounded-full p-0 flex items-center justify-center">2</Badge>
              <div>Sistema busca oponentes em tempo real</div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="w-5 h-5 rounded-full p-0 flex items-center justify-center">3</Badge>
              <div>Duelo inicia automaticamente quando match é encontrado</div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="w-5 h-5 rounded-full p-0 flex items-center justify-center">4</Badge>
              <div>10 perguntas • 30s cada • Melhor pontuação vence!</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FloatingNavbar />
    </div>
  );
}