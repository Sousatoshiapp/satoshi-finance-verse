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
import casinoFuturisticBg from "@/assets/casino-futuristic-bg.jpg";

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
    <div className="min-h-screen relative overflow-hidden casino-futuristic">
      {/* Futuristic Casino Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${casinoFuturisticBg})` }}
      />
      
      {/* Overlay with cyberpunk effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
      
      {/* Holographic Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-particle particle-1" />
        <div className="floating-particle particle-2" />
        <div className="floating-particle particle-3" />
        <div className="floating-particle particle-4" />
        <div className="floating-particle particle-5" />
        
        {/* Neon Glow Effects */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl neon-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl neon-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl neon-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-green-500/20 rounded-full blur-2xl neon-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header - Minimalist without title */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between p-6 backdrop-blur-sm border-b border-white/10"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="border-white/20 bg-black/30 backdrop-blur-sm hover:bg-white/10 casino-button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        {/* User BTZ Display with casino styling */}
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-full border border-amber-400/50 casino-btz-display backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
        >
          <Coins className="h-5 w-5 text-amber-300 casino-coin-glow" />
          <span className="font-bold text-amber-200 text-lg">{profile?.points || 0}</span>
          <span className="text-amber-300/80 text-sm font-medium">BTZ</span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 py-4 space-y-4">
        <AnimatePresence mode="wait">
          {!showBettingScreen ? (
            <motion.div
              key="topic-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Topic Selection with casino styling - Reduced height */}
              <Card className="border-white/20 bg-black/30 backdrop-blur-md overflow-hidden relative casino-card">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-pink-500/10" />
                <div className="absolute inset-0 casino-card-glow" />
                <CardContent className="relative z-10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-white">Selecione o Campo de Batalha</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {duelTopics.map((topic) => (
                      <motion.div
                        key={topic.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTopic(topic)}
                        className={`relative p-3 rounded-xl cursor-pointer border-2 transition-all duration-300 casino-topic-card ${
                          selectedTopic.id === topic.id
                            ? 'border-primary bg-primary/20 shadow-lg shadow-primary/40 casino-selected'
                            : 'border-white/20 bg-white/10 hover:border-primary/50 hover:bg-primary/10 casino-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl p-2 rounded-lg bg-gradient-to-br ${topic.color} text-white`}>
                            {topic.emoji}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">{topic.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>
                          </div>
                          {selectedTopic.id === topic.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="p-1 bg-primary rounded-full"
                            >
                              <Sparkles className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bet Selection with casino styling - Reduced to 1/3 size */}
              <Card className="border-white/20 bg-black/30 backdrop-blur-md overflow-hidden relative casino-card max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
                <div className="absolute inset-0 casino-card-glow" />
                <CardContent className="relative z-10 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Coins className="h-5 w-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white">Defina sua Aposta</h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {betAmounts.map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedBet(amount)}
                        className={`p-2 rounded-lg border-2 font-bold text-sm transition-all duration-300 casino-bet-button ${
                          selectedBet === amount
                            ? 'border-amber-300 bg-amber-400/20 text-amber-200 shadow-lg shadow-amber-400/40 casino-bet-selected'
                            : 'border-white/20 bg-white/10 text-white hover:border-amber-300/60 hover:bg-amber-400/15 casino-bet-hover'
                        } ${profile && profile.points < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={profile && profile.points < amount}
                      >
                        {amount}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-400/30">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-300 font-medium text-sm">Prêmio:</span>
                    </div>
                    <span className="text-lg font-bold text-green-300">{selectedBet * 2} BTZ</span>
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
                  className="w-full max-w-md h-16 text-xl font-bold bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white shadow-lg shadow-primary/40 border-0 relative overflow-hidden group casino-start-button"
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
              {/* Betting Confirmation Screen with casino styling */}
              <Card className="border-white/20 bg-black/30 backdrop-blur-md overflow-hidden relative casino-card">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-pink-500/15" />
                <div className="absolute inset-0 casino-card-glow" />
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