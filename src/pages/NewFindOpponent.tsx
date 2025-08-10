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
    <div className="min-h-screen bg-background p-6">
      {/* Header super simples */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border">
          <Coins className="h-5 w-5 text-amber-400" />
          <span className="font-bold">{isLoading ? "..." : points.toFixed(2)}</span>
          <span className="text-sm">BTZ</span>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Topic Selection - SIMPLES */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-4">Selecione o Tópico</h2>
            <div className="grid grid-cols-2 gap-2">
              {duelTopics.map((topic) => {
                const IconComponent = topic.icon;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedTopic.id === topic.id
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mb-1" />
                    <div className="text-sm font-medium">{topic.name}</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bet Selection - SIMPLES */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold mb-4">Escolha a Aposta</h2>
            <div className="grid grid-cols-3 gap-2">
              {betAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedBet(amount)}
                  className={`p-2 rounded border-2 font-bold transition-colors ${
                    selectedBet === amount
                      ? 'border-amber-400 bg-amber-400/20'
                      : 'border-border hover:border-amber-400/50'
                  } ${points < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={points < amount}
                >
                  {amount} BTZ
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* BOTÃO ULTRA SIMPLES */}
        <div className="text-center space-y-4">
          <button
            onClick={() => {
              console.log('🚀 ULTRA SIMPLES CLICADO!');
              handleStartDuel();
            }}
            disabled={isLoading || points < selectedBet}
            className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-colors"
            style={{ zIndex: 9999, position: 'relative' }}
          >
            {isLoading ? "Carregando..." : "BUSCAR OPONENTE"}
          </button>

          {points < selectedBet && !isLoading && (
            <p className="text-destructive text-sm">
              Saldo insuficiente. Você tem {points.toFixed(2)} BTZ mas precisa de {selectedBet} BTZ
            </p>
          )}
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