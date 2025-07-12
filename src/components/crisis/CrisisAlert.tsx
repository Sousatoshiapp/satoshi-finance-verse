import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Zap } from "lucide-react";
import { useCrisisData } from "@/hooks/use-crisis-data";
import { CrisisContributionModal } from "./CrisisContributionModal";

export const CrisisAlert = () => {
  const { data: crisis, isLoading } = useCrisisData();
  const [showContributionModal, setShowContributionModal] = useState(false);

  if (isLoading || !crisis) return null;

  const btzProgress = (crisis.current_btz_contributions / crisis.total_btz_goal) * 100;
  const xpProgress = (crisis.current_xp_contributions / crisis.total_xp_goal) * 100;
  const overallProgress = (btzProgress + xpProgress) / 2;

  const formatTimeRemaining = () => {
    const endTime = new Date(crisis.end_time);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return "EXPIRADO";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <Alert className="border-destructive/50 bg-destructive/5 mb-6 animate-pulse">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-destructive mb-1">{crisis.title}</h3>
              <p className="text-sm text-muted-foreground">{crisis.description}</p>
            </div>
            <Badge variant="destructive" className="ml-4">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeRemaining()}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso Global</span>
              <span className="font-medium">{overallProgress.toFixed(1)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex items-center gap-1 text-[#adff2f]">
                  <Zap className="h-3 w-3" />
                  <span>BTZ: {formatNumber(crisis.current_btz_contributions)}/{formatNumber(crisis.total_btz_goal)}</span>
                </div>
                <Progress 
                  value={btzProgress} 
                  className="h-1 mt-1" 
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#adff2f]">
                  <Zap className="h-3 w-3" />
                  <span>XP: {formatNumber(crisis.current_xp_contributions)}/{formatNumber(crisis.total_xp_goal)}</span>
                </div>
                <Progress 
                  value={xpProgress} 
                  className="h-1 mt-1" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowContributionModal(true)}
              variant="destructive"
              size="sm"
              className="animate-pulse"
            >
              🦸 Colaborar Agora
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <CrisisContributionModal 
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        crisis={crisis}
      />
    </>
  );
};