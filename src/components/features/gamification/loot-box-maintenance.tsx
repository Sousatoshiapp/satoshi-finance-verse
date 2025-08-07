import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Wrench, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LootBoxMaintenance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
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
            <h1 className="text-2xl font-bold">Loot Boxes</h1>
            <p className="text-muted-foreground">Sistema temporariamente em manutenção</p>
          </div>
        </div>

        {/* Maintenance Notice */}
        <Card className="border-orange-500/30 bg-gradient-to-br from-background to-orange-500/5">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Wrench className="h-16 w-16 text-orange-500" />
                <Clock className="h-6 w-6 text-orange-400 absolute -bottom-1 -right-1 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl">Sistema em Manutenção</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground text-lg">
                O sistema de Loot Boxes está temporariamente desabilitado para melhorias e ajustes.
              </p>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-orange-500">O que está acontecendo?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Revisão das mecânicas de recompensas</li>
                  <li>• Balanceamento das raridades</li>
                  <li>• Otimização da experiência do usuário</li>
                </ul>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-blue-500">Durante a manutenção:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Suas loot boxes existentes estão seguras</li>
                  <li>• Novos recursos serão adicionados em breve</li>
                  <li>• Outras funcionalidades permanecem ativas</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Voltar ao Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/missions')}
                className="flex-1"
              >
                Ver Missões
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}