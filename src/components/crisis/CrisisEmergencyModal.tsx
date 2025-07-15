import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Zap, Coins, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CrisisEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  crisis: {
    id: string;
    title: string;
    description: string;
    end_time: string;
    total_btz_goal: number;
    total_xp_goal: number;
    current_btz_contributions: number;
    current_xp_contributions: number;
  };
  userBtz: number;
  userXp: number;
  onContributionSuccess: () => void;
}

export const CrisisEmergencyModal = ({
  isOpen,
  onClose,
  crisis,
  userBtz,
  userXp,
  onContributionSuccess
}: CrisisEmergencyModalProps) => {
  const [btzAmount, setBtzAmount] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isContributing, setIsContributing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(crisis.end_time);
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [crisis.end_time]);

  const handleContribute = async () => {
    const btzValue = parseInt(btzAmount) || 0;
    const xpValue = parseInt(xpAmount) || 0;

    if (btzValue <= 0 && xpValue <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido para BTZ ou XP",
        variant: "destructive"
      });
      return;
    }

    if (btzValue > userBtz) {
      toast({
        title: "Erro",
        description: "Você não tem BTZ suficiente",
        variant: "destructive"
      });
      return;
    }

    if (xpValue > userXp) {
      toast({
        title: "Erro",
        description: "Você não tem XP suficiente",
        variant: "destructive"
      });
      return;
    }

    setIsContributing(true);
    try {
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");

      // Start transaction: subtract from user and record contribution
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          points: userBtz - btzValue,
          xp: userXp - xpValue
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Record the contribution
      const { error: contributionError } = await supabase
        .from('crisis_contributions')
        .insert({
          crisis_id: crisis.id,
          user_id: profile.id,
          btz_contributed: btzValue,
          xp_contributed: xpValue,
          contribution_type: 'emergency_donation'
        });

      if (contributionError) throw contributionError;

      toast({
        title: "Contribuição Realizada!",
        description: `Você doou ${btzValue} BTZ e ${xpValue} XP para ajudar na crise`,
      });

      setBtzAmount("");
      setXpAmount("");
      onContributionSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao contribuir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a contribuição",
        variant: "destructive"
      });
    } finally {
      setIsContributing(false);
    }
  };

  const btzProgress = Math.min((crisis.current_btz_contributions / crisis.total_btz_goal) * 100, 100);
  const xpProgress = Math.min((crisis.current_xp_contributions / crisis.total_xp_goal) * 100, 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-red-900/95 to-orange-900/95 backdrop-blur-sm border-red-500/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white text-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            {crisis.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Countdown Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-medium">Tempo Restante</span>
            </div>
            <div className="flex justify-center gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold bg-red-800/50 rounded-lg px-3 py-2 min-w-[4rem]">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-300 mt-1">Horas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-red-800/50 rounded-lg px-3 py-2 min-w-[4rem]">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-300 mt-1">Min</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-red-800/50 rounded-lg px-3 py-2 min-w-[4rem]">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-300 mt-1">Seg</div>
              </div>
            </div>
          </div>

          {/* Crisis Description */}
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-gray-200 text-center text-lg">{crisis.description}</p>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  BTZ Arrecadados
                </span>
                <Badge variant="outline" className="text-white border-white/30">
                  {crisis.current_btz_contributions.toLocaleString()} / {crisis.total_btz_goal.toLocaleString()}
                </Badge>
              </div>
              <Progress value={btzProgress} className="h-3 bg-red-800/50" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  XP Arrecadado
                </span>
                <Badge variant="outline" className="text-white border-white/30">
                  {crisis.current_xp_contributions.toLocaleString()} / {crisis.total_xp_goal.toLocaleString()}
                </Badge>
              </div>
              <Progress value={xpProgress} className="h-3 bg-red-800/50" />
            </div>
          </div>

          {/* Donation Form */}
          <div className="bg-black/30 rounded-lg p-6 space-y-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Faça sua Contribuição
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 text-sm block mb-2">
                  BTZ (Disponível: {userBtz.toLocaleString()})
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={btzAmount}
                  onChange={(e) => setBtzAmount(e.target.value)}
                  max={userBtz}
                  className="bg-black/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">
                  XP (Disponível: {userXp.toLocaleString()})
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  max={userXp}
                  className="bg-black/50 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleContribute}
                disabled={isContributing || (!btzAmount && !xpAmount)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isContributing ? "Contribuindo..." : "Contribuir Agora"}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-800"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};