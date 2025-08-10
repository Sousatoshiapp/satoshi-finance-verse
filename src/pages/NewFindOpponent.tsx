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
  Gamepad2,
  DollarSign,
  Building2
} from "lucide-react";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useCasinoDuels } from "@/hooks/use-casino-duels";
import { InsufficientBTZModal } from "@/components/shared/InsufficientBTZModal";
import { toast } from "sonner";
import casinoFuturisticBg from "@/assets/casino-futuristic-bg.jpg";

const duelTopics = [
  { 
    id: "financas", 
    name: "Finanças", 
    icon: DollarSign, 
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-green-500/10"
  },
  { 
    id: "cripto", 
    name: "Criptomoedas", 
    icon: Coins, 
    color: "from-orange-400 to-yellow-600",
    bgColor: "bg-orange-500/10"
  },
  { 
    id: "investimentos", 
    name: "Investimentos", 
    icon: TrendingUp, 
    color: "from-blue-400 to-cyan-600",
    bgColor: "bg-blue-500/10"
  },
  { 
    id: "economia", 
    name: "Economia", 
    icon: Building2, 
    color: "from-purple-400 to-pink-600",
    bgColor: "bg-purple-500/10"
  }
];

const betAmounts = [10, 25, 50, 100, 250, 500];

export default function NewFindOpponent() {
  const navigate = useNavigate();
  const { points, isLoading } = useRealtimePoints();
  const { } = useCasinoDuels();
  
  const [selectedTopic, setSelectedTopic] = useState(duelTopics[0]);
  const [selectedBet, setSelectedBet] = useState(10); // Reduzido para 10 BTZ como padrão
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  const handleStartDuel = () => {
    if (isLoading) {
      toast.error("Carregando saldo...");
      return;
    }

    if (points < selectedBet) {
      setShowInsufficientModal(true);
      return;
    }

    navigate('/select-opponent', { 
      state: { 
        topic: selectedTopic.id,
        betAmount: selectedBet 
      }
    });
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
          <span className="font-bold text-amber-200 text-lg">{isLoading ? "..." : points.toFixed(2)}</span>
          <span className="text-amber-300/80 text-sm font-medium">BTZ</span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 py-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {duelTopics.map((topic) => {
                      const IconComponent = topic.icon;
                      return (
                        <motion.div
                          key={topic.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedTopic(topic)}
                          className={`relative p-2 rounded-xl cursor-pointer border-2 transition-all duration-300 casino-topic-card ${
                            selectedTopic.id === topic.id
                              ? 'border-primary bg-primary/20 shadow-lg shadow-primary/40 casino-selected'
                              : 'border-white/20 bg-white/10 hover:border-primary/50 hover:bg-primary/10 casino-hover'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded-lg bg-gradient-to-br ${topic.color} text-white`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-white">{topic.name}</h3>
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
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Bet Selection with casino styling - Reduced height */}
              <Card className="border-white/20 bg-black/30 backdrop-blur-md overflow-hidden relative casino-card max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
                <div className="absolute inset-0 casino-card-glow" />
                <CardContent className="relative z-10 p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4 text-amber-400" />
                    <h2 className="text-base font-bold text-white">Defina sua Aposta</h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {betAmounts.map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedBet(amount)}
                        className={`p-1 rounded-lg border-2 font-bold text-xs transition-all duration-300 casino-bet-button ${
                          selectedBet === amount
                            ? 'border-amber-300 bg-amber-400/20 text-amber-200 shadow-lg shadow-amber-400/40 casino-bet-selected'
                            : 'border-white/20 bg-white/10 text-white hover:border-amber-300/60 hover:bg-amber-400/15 casino-bet-hover'
                        } ${points < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={points < amount}
                      >
                        {amount}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-400/30">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <span className="text-green-300 font-medium text-xs">Prêmio:</span>
                    </div>
                    <span className="text-sm font-bold text-green-300">{selectedBet * 2} BTZ</span>
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
                  disabled={isLoading || points < selectedBet}
                  className="w-full max-w-md h-8 text-lg font-bold bg-[#adff2f] hover:bg-[#9de82a] text-black shadow-lg shadow-[#adff2f]/50 border-0 relative overflow-hidden group casino-start-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <Zap className="mr-2 h-4 w-4" />
                  {isLoading ? "Carregando..." : "Buscar Oponente"}
                </Button>
                
                {points < selectedBet && !isLoading && (
                  <div className="mt-2 text-center">
                    <p className="text-destructive text-sm">
                      Saldo: <span className="font-semibold">{points.toFixed(2)} BTZ</span> | 
                      Necessário: <span className="font-semibold">{selectedBet} BTZ</span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Faltam {(selectedBet - points).toFixed(2)} BTZ
                    </p>
                  </div>
                )}
              </motion.div>
        </motion.div>
      </div>

      {/* Modal de BTZ Insuficiente */}
      <InsufficientBTZModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentBTZ={points}
        requiredBTZ={selectedBet}
      />
    </div>
  );
}