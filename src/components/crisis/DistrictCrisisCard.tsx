import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { AlertTriangle, Zap, Target } from "lucide-react";
import { useCrisisDistrictGoal, useCrisisData } from "@/hooks/use-crisis-data";
import { CrisisContributionModal } from "./CrisisContributionModal";

interface DistrictCrisisCardProps {
  districtId: string;
}

export const DistrictCrisisCard = ({ districtId }: DistrictCrisisCardProps) => {
  const { data: crisis } = useCrisisData();
  const { data: districtGoal } = useCrisisDistrictGoal(districtId);
  const [showContributionModal, setShowContributionModal] = useState(false);

  if (!crisis || !districtGoal) return null;

  const btzProgress = (districtGoal.current_btz / districtGoal.btz_goal) * 100;
  const xpProgress = (districtGoal.current_xp / districtGoal.xp_goal) * 100;
  const overallProgress = (btzProgress + xpProgress) / 2;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <Card className="border-destructive/50 bg-destructive/5 mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-semibold text-destructive text-sm">EMERGÊNCIA ATIVA</span>
            </div>
            <Badge variant={districtGoal.is_completed ? "default" : "destructive"} className="text-xs">
              {districtGoal.is_completed ? "✅ Meta Atingida" : "🔥 Em Andamento"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm mb-1">{crisis.title}</h3>
            <p className="text-xs text-muted-foreground">Este distrito precisa colaborar para salvar Satoshi City!</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Progresso do Distrito
              </span>
              <span className="font-medium">{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#adff2f]">
                    <Zap className="h-3 w-3" />
                    <span>BTZ</span>
                  </div>
                  <span className="font-medium">{formatNumber(districtGoal.current_btz)}/{formatNumber(districtGoal.btz_goal)}</span>
                </div>
                <Progress value={btzProgress} className="h-1 mt-1" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#adff2f]">
                    <Zap className="h-3 w-3" />
                    <span>XP</span>
                  </div>
                  <span className="font-medium">{formatNumber(districtGoal.current_xp)}/{formatNumber(districtGoal.xp_goal)}</span>
                </div>
                <Progress value={xpProgress} className="h-1 mt-1" />
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setShowContributionModal(true)}
            className="w-full bg-destructive hover:bg-destructive/90 text-white"
            size="sm"
            disabled={districtGoal.is_completed}
          >
            {districtGoal.is_completed ? "✅ Missão Cumprida" : "🦸 Colaborar na Crise"}
          </Button>
        </CardContent>
      </Card>

      <CrisisContributionModal 
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        crisis={crisis}
      />
    </>
  );
};
