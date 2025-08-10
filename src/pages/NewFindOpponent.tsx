import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { 
  ArrowLeft, 
  Zap, 
  Crown, 
  Coins, 
  TrendingUp, 
  Users, 
  Sparkles,
  Target,
  Timer,
  Gamepad2
} from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useCasinoDuels } from "@/hooks/use-casino-duels";
import { toast } from "sonner";

const duelTopics = [
  { 
    id: "financas", 
    name: "Finanças", 
    emoji: "💰", 
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-green-500/10",
    description: "Teste seus conhecimentos em finanças pessoais"
  },
  { 
    id: "cripto", 
    name: "Criptomoedas", 
    emoji: "₿", 
    color: "from-orange-400 to-yellow-600",
    bgColor: "bg-orange-500/10",
    description: "Desafie-se no mundo das criptomoedas"
  },
  { 
    id: "investimentos", 
    name: "Investimentos", 
    emoji: "📈", 
    color: "from-blue-400 to-cyan-600",
    bgColor: "bg-blue-500/10",
    description: "Mostre seu expertise em investimentos"
  },
  { 
    id: "economia", 
    name: "Economia", 
    emoji: "🏦", 
    color: "from-purple-400 to-pink-600",
    bgColor: "bg-purple-500/10",
    description: "Explore conceitos econômicos fundamentais"
  }
];

const betAmounts = [10, 25, 50, 100, 250, 500];

export default function NewFindOpponent() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { isSearching, findOpponent, cancelSearch } = useCasinoDuels();
  
  const [selectedTopic, setSelectedTopic] = useState(duelTopics[0]);
  const [selectedBet, setSelectedBet] = useState(25);
  const [showBettingScreen, setShowBettingScreen] = useState(false);

  const handleStartDuel = () => {
    if (!profile) {
      toast.error("Faça login para jogar");
      return;
    }

    if (profile.points < selectedBet) {
      toast.error("BTZ insuficiente para esta aposta");
      return;
    }

    setShowBettingScreen(true);
  };

  const handleConfirmBet = async () => {
    try {
      await findOpponent(selectedTopic.id, selectedBet);
      setShowBettingScreen(false);
    } catch (error) {
      console.error("Erro ao procurar oponente:", error);
      toast.error("Erro ao iniciar duelo");
    }
  };

  const handleCancelSearch = async () => {
    try {
      await cancelSearch();
      setShowBettingScreen(false);
    } catch (error) {
      console.error("Erro ao cancelar busca:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between p-6 backdrop-blur-sm border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-white/20 bg-black/20 backdrop-blur-sm hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-pink-500 rounded-xl">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Arena de Duelos
              </h1>
              <p className="text-sm text-muted-foreground">Cassino Virtual do Futuro</p>
            </div>
          </div>
        </div>
        
        {/* User BTZ Display */}
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full border border-amber-400/30"
          whileHover={{ scale: 1.05 }}
        >
          <Coins className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-amber-300">{profile?.points || 0}</span>
          <span className="text-amber-400/70 text-sm">BTZ</span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        <AnimatePresence mode="wait">
          {!showBettingScreen ? (
            <motion.div
              key="topic-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Topic Selection */}
              <Card className="border-white/10 bg-black/20 backdrop-blur-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-pink-500/5" />
                <CardContent className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-white">Selecione o Campo de Batalha</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {duelTopics.map((topic) => (
                      <motion.div
                        key={topic.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTopic(topic)}
                        className={`relative p-6 rounded-xl cursor-pointer border-2 transition-all duration-300 ${
                          selectedTopic.id === topic.id
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/25'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${topic.color} text-white`}>
                            {topic.emoji}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{topic.name}</h3>
                            <p className="text-sm text-muted-foreground">{topic.description}</p>
                          </div>
                          {selectedTopic.id === topic.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-2 bg-primary rounded-full"
                            >
                              <Sparkles className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bet Selection */}
              <Card className="border-white/10 bg-black/20 backdrop-blur-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
                <CardContent className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Coins className="h-6 w-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-white">Defina sua Aposta</h2>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                    {betAmounts.map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedBet(amount)}
                        className={`p-4 rounded-xl border-2 font-bold transition-all duration-300 ${
                          selectedBet === amount
                            ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-lg shadow-amber-400/25'
                            : 'border-white/10 bg-white/5 text-white hover:border-amber-400/50 hover:bg-amber-400/5'
                        } ${profile && profile.points < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={profile && profile.points < amount}
                      >
                        {amount} BTZ
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-400/30">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <span className="text-green-300 font-medium">Prêmio Potencial:</span>
                    </div>
                    <span className="text-xl font-bold text-green-300">{selectedBet * 2} BTZ</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <Button
                  onClick={handleStartDuel}
                  disabled={!profile || profile.points < selectedBet}
                  className="w-full max-w-md h-16 text-xl font-bold bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white shadow-lg shadow-primary/25 border-0 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <Zap className="mr-3 h-6 w-6" />
                  Iniciar Duelo
                </Button>
                
                {profile && profile.points < selectedBet && (
                  <p className="text-destructive text-sm mt-2">
                    BTZ insuficiente. Você precisa de {selectedBet - profile.points} BTZ a mais.
                  </p>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="betting-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              {/* Betting Confirmation Screen */}
              <Card className="border-white/10 bg-black/20 backdrop-blur-md overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-pink-500/10" />
                <CardContent className="relative z-10 p-8 text-center space-y-8">
                  <div className="space-y-4">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block p-4 bg-gradient-to-br from-primary to-pink-500 rounded-full"
                    >
                      <Crown className="h-12 w-12 text-white" />
                    </motion.div>
                    
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Preparando Duelo
                    </h2>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-muted-foreground">Tópico:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{selectedTopic.emoji}</span>
                          <span className="font-bold text-white">{selectedTopic.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <span className="text-muted-foreground">Aposta:</span>
                        <div className="flex items-center gap-2">
                          <Coins className="h-5 w-5 text-amber-400" />
                          <span className="font-bold text-amber-300">{selectedBet} BTZ</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-400/30">
                        <span className="text-green-300">Prêmio:</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                          <span className="font-bold text-green-300">{selectedBet * 2} BTZ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isSearching ? (
                    <div className="space-y-4">
                      <Button
                        onClick={handleConfirmBet}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Confirmar Aposta
                      </Button>
                      
                      <Button
                        onClick={() => setShowBettingScreen(false)}
                        variant="outline"
                        className="w-full border-white/20 bg-white/5 hover:bg-white/10"
                      >
                        Voltar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-white">Procurando Oponente</h3>
                        <p className="text-muted-foreground">Aguarde enquanto encontramos um adversário à altura...</p>
                        
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Users className="h-5 w-5" />
                          <Timer className="h-5 w-5" />
                          <Target className="h-5 w-5" />
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleCancelSearch}
                        variant="outline"
                        className="w-full border-red-400/30 bg-red-500/10 hover:bg-red-500/20 text-red-300"
                      >
                        Cancelar Busca
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}