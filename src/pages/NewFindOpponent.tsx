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
  const [selectedBet, setSelectedBet] = useState(10);
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
    <div className="min-h-screen casino-futuristic cyber-grid">
      {/* Floating particles for casino effect */}
      <div className="floating-particle particle-1"></div>
      <div className="floating-particle particle-2"></div>
      <div className="floating-particle particle-3"></div>
      <div className="floating-particle particle-4"></div>
      <div className="floating-particle particle-5"></div>

      {/* Main content with proper spacing to avoid navbar overlap */}
      <div className="relative z-10 p-6 pb-32">
        {/* Header with casino styling */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="casino-button border-purple-500/40 text-white bg-black/20 backdrop-blur-sm hover:bg-purple-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="casino-btz-display flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-amber-400/40">
            <Coins className="h-5 w-5 text-amber-400 casino-coin-glow" />
            <span className="font-bold text-white">{isLoading ? "..." : points.toFixed(2)}</span>
            <span className="text-sm text-amber-400">BTZ</span>
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-8">
          {/* Topic Selection with casino styling */}
          <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6 text-white text-center">Selecione o Tópico</h2>
              <div className="grid grid-cols-2 gap-4">
                {duelTopics.map((topic) => {
                  const IconComponent = topic.icon;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 casino-topic-card ${
                        selectedTopic.id === topic.id
                          ? 'casino-selected border-purple-500 bg-purple-500/20 text-white'
                          : 'border-purple-500/30 bg-black/20 text-gray-300 casino-hover hover:border-purple-500/60 hover:bg-purple-500/10'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mb-2 mx-auto" />
                      <div className="text-sm font-medium">{topic.name}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bet Selection with casino styling */}
          <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6 text-white text-center">Escolha a Aposta</h2>
              <div className="grid grid-cols-3 gap-3">
                {betAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedBet(amount)}
                    className={`p-3 rounded-lg border-2 font-bold transition-all duration-300 casino-bet-button ${
                      selectedBet === amount
                        ? 'casino-bet-selected border-amber-400 bg-amber-400/20 text-white'
                        : 'border-amber-400/30 bg-black/20 text-gray-300 casino-bet-hover hover:border-amber-400/60'
                    } ${points < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={points < amount}
                  >
                    {amount} BTZ
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main action button with proper spacing from navbar */}
          <div className="text-center space-y-4">
            <button
              onClick={handleStartDuel}
              disabled={isLoading || points < selectedBet}
              className="casino-start-button w-full py-2 px-6 font-bold text-lg rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#adff2f',
                color: 'black',
                border: '2px solid #adff2f',
                boxShadow: '0 0 20px rgba(173, 255, 47, 0.4)',
                zIndex: 20 
              }}
            >
              {isLoading ? "Carregando..." : "BUSCAR OPONENTE"}
            </button>

            {points < selectedBet && !isLoading && (
              <p className="text-red-400 text-sm bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-red-400/30">
                Saldo insuficiente. Você tem {points.toFixed(2)} BTZ mas precisa de {selectedBet} BTZ
              </p>
            )}
          </div>
        </div>
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