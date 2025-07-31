import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Badge } from "@/components/shared/ui/badge";
import { AlertTriangle, Zap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CrisisEvent } from "@/hooks/use-crisis-data";
import { useQueryClient } from "@tanstack/react-query";

interface CrisisContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  crisis: CrisisEvent;
  onContributed?: () => void;
}

export const CrisisContributionModal = ({ isOpen, onClose, crisis, onContributed }: CrisisContributionModalProps) => {
  const [btzAmount, setBtzAmount] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const queryClient = useQueryClient();

  const handleContribution = async () => {
    try {
      setIsContributing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para contribuir.",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast({
          title: "Erro",
          description: "Perfil não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const btz = parseInt(btzAmount) || 0;
      const xp = parseInt(xpAmount) || 0;

      if (btz <= 0 && xp <= 0) {
        toast({
          title: "Erro",
          description: "Você deve contribuir com pelo menos BTZ ou XP.",
          variant: "destructive",
        });
        return;
      }

      // Insert or update contribution
      const { error } = await supabase
        .from("crisis_contributions")
        .upsert({
          crisis_id: crisis.id,
          user_id: profile.id,
          btz_contributed: btz,
          xp_contributed: xp,
          heroic_action: `Contribuiu ${btz > 0 ? `${btz} BTZ` : ''}${btz > 0 && xp > 0 ? ' e ' : ''}${xp > 0 ? `${xp} XP` : ''} para salvar Satoshi City!`
        }, {
          onConflict: "crisis_id,user_id"
        });

      if (error) throw error;

      toast({
        title: "🦸 Contribuição Heroica!",
        description: `Você contribuiu ${btz > 0 ? `${btz} BTZ` : ''}${btz > 0 && xp > 0 ? ' e ' : ''}${xp > 0 ? `${xp} XP` : ''} para salvar Satoshi City!`,
      });

      // Refresh crisis data
      queryClient.invalidateQueries({ queryKey: ["active-crisis"] });
      queryClient.invalidateQueries({ queryKey: ["user-crisis-contribution"] });
      queryClient.invalidateQueries({ queryKey: ["crisis-district-goal"] });

      setBtzAmount("");
      setXpAmount("");
      onContributed?.();
      onClose();
    } catch (error) {
      console.error("Error contributing to crisis:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar contribuição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Salvar Satoshi City
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
            <h3 className="font-semibold text-sm mb-2">{crisis.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{crisis.description}</p>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Cyber Attack
              </Badge>
              <Badge variant="destructive" className="text-xs">
                Urgente
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="btz-amount" className="text-sm font-medium">
                Contribuir BTZ
              </Label>
              <Input
                id="btz-amount"
                type="number"
                placeholder="Quantidade de BTZ"
                value={btzAmount}
                onChange={(e) => setBtzAmount(e.target.value)}
                className="mt-1"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="xp-amount" className="text-sm font-medium">
                Contribuir XP
              </Label>
              <Input
                id="xp-amount"
                type="number"
                placeholder="Quantidade de XP"
                value={xpAmount}
                onChange={(e) => setXpAmount(e.target.value)}
                className="mt-1"
                min="0"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span>Recompensas por Salvar a Cidade:</span>
            </div>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Badge Especial "Herói de Satoshi City"</li>
              <li>• Multiplicador de XP 1.5x por 7 dias</li>
              <li>• Reconhecimento no Hall da Fama</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleContribution}
              disabled={isContributing}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              {isContributing ? "Contribuindo..." : "🦸 Ser Herói"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
