import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { Coins, TrendingUp, Timer } from "lucide-react";

interface BtcBetSelectorProps {
  onBetSelected: (amount: number) => void;
  isLoading?: boolean;
  userPoints: number;
}

const BET_AMOUNTS = [5, 10, 25, 50];

export function BtcBetSelector({ onBetSelected, isLoading = false, userPoints }: BtcBetSelectorProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleBetSelection = (amount: number) => {
    setSelectedAmount(amount);
    onBetSelected(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Duelo Rápido BTC</h2>
        <p className="text-muted-foreground text-sm">
          Aposte se o Bitcoin vai subir ou descer nos próximos 5 minutos
        </p>
      </div>

      {/* Rules card */}
      <Card className="border-orange-500/20 bg-gradient-to-br from-background to-orange-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="h-5 w-5 text-orange-500" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-bold">1.</span>
            <span>Escolha o valor da aposta (5-50 BTZ)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-bold">2.</span>
            <span>Sistema encontra um oponente com a mesma aposta</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-bold">3.</span>
            <span>Ambos escolhem UP ou DOWN em 30 segundos</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-bold">4.</span>
            <span>Aguardem 5 minutos para ver quem acertou</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-bold">5.</span>
            <span>Vencedor leva tudo (menos taxa de 5%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Bet amount selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Escolha sua Aposta
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Seu saldo:</span>
            <div className="flex items-center gap-1 text-success font-medium">
              {userPoints.toLocaleString()}
              <BeetzIcon size="sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {BET_AMOUNTS.map((amount) => {
              const canAfford = userPoints >= amount;
              const isSelected = selectedAmount === amount;
              
              return (
                <Button
                  key={amount}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-16 flex flex-col gap-1 transition-all duration-200 ${
                    !canAfford 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isSelected
                      ? 'bg-gradient-to-br from-primary to-primary/80 border-primary shadow-lg shadow-primary/25'
                      : 'hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => canAfford && handleBetSelection(amount)}
                  disabled={!canAfford || isLoading}
                >
                  <div className="flex items-center gap-1 text-lg font-bold">
                    {amount}
                    <BeetzIcon size="sm" />
                  </div>
                  <div className="text-xs opacity-75">
                    Prize: {Math.floor(amount * 2 * 0.95)}
                  </div>
                </Button>
              );
            })}
          </div>
          
          {selectedAmount && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-center space-y-1">
                <div className="text-sm text-muted-foreground">Prêmio Potencial</div>
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-primary">
                  {Math.floor(selectedAmount * 2 * 0.95)}
                  <BeetzIcon size="sm" />
                </div>
                <div className="text-xs text-muted-foreground">
                  (Total da aposta: {selectedAmount * 2} BTZ - Taxa 5%)
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}