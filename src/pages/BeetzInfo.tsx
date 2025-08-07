import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { ArrowLeft, Coins, Gift, ShoppingCart, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BeetzInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BeetzIcon size="lg" />
                Beetz - Moeda do Satoshi Finance Game
              </h1>
              <p className="text-muted-foreground">Sua moeda virtual para evoluir no jogo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Main Info Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
              <BeetzIcon size="2xl" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">O que são Beetz?</h2>
            <p className="text-muted-foreground">
              Beetz são a moeda virtual do Satoshi Finance Game. Use para comprar avatares, 
              power-ups, participar de torneios especiais e muito mais!
            </p>
          </div>
        </Card>

        {/* How to earn */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Como Ganhar Beetz
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold mb-1">Completar Quizzes</h4>
              <p className="text-sm text-muted-foreground">Ganhe Beetz respondendo perguntas corretamente</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">🔥</div>
              <h4 className="font-semibold mb-1">Manter Sequência</h4>
              <p className="text-sm text-muted-foreground">Bônus diários por manter sua sequência ativa</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-semibold mb-1">Vencer Duelos</h4>
              <p className="text-sm text-muted-foreground">Ganha Beetz vencendo outros jogadores</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="font-semibold mb-1">Missões Diárias</h4>
              <p className="text-sm text-muted-foreground">Complete missões para ganhar Beetz extras</p>
            </div>
          </div>
        </Card>

        {/* How to use */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            Como Usar Beetz
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl mb-2">🤖</div>
              <h4 className="font-semibold mb-1">Avatares</h4>
              <p className="text-sm text-muted-foreground">Compre novos avatares únicos</p>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-1">Power-ups</h4>
              <p className="text-sm text-muted-foreground">Turbine seu progresso no jogo</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="font-semibold mb-1">Loot Boxes</h4>
              <p className="text-sm text-muted-foreground">Abra caixas com itens especiais</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button 
            className="bg-gradient-to-r from-primary to-success text-black font-semibold py-6"
            onClick={() => navigate('/store')}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Ir para a Loja
          </Button>
          <Button 
            variant="outline"
            className="py-6"
            onClick={() => navigate('/missions')}
          >
            <Gift className="h-5 w-5 mr-2" />
            Ver Missões Diárias
          </Button>
        </div>

        {/* Tips */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            Dicas para Maximizar seus Beetz
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Faça login todos os dias para manter sua sequência e ganhar bônus</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Complete todas as missões diárias para maximizar seus ganhos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Participe de duelos - mesmo perdendo você ainda ganha alguns Beetz</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Assinantes Pro e Elite ganham Beetz mensais automáticos</span>
            </li>
          </ul>
        </Card>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
