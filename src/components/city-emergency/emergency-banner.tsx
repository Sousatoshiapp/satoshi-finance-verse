import React, { useState } from 'react';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Progress } from '@/components/shared/ui/progress';
import { Badge } from '@/components/shared/ui/badge';
import { AlertTriangle, Clock, Users, Zap, X } from 'lucide-react';
import { useCityEmergencyData } from '@/hooks/use-city-emergency';
import { EmergencyContributionDialog } from './emergency-contribution-dialog';

export function EmergencyBanner() {
  const { data: emergency, isLoading } = useCityEmergencyData();
  const [showContribution, setShowContribution] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !emergency || dismissed) return null;

  const now = new Date();
  const endTime = new Date(emergency.end_time);
  const timeLeft = Math.max(0, endTime.getTime() - now.getTime());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const btzProgress = (emergency.current_btz_contributions / emergency.btz_goal) * 100;
  const xpProgress = (emergency.current_xp_contributions / emergency.xp_goal) * 100;
  const overallProgress = (btzProgress + xpProgress) / 2;

  const getCrisisTheme = (type: string) => {
    switch (type) {
      case 'financial_hack':
        return {
          bgGradient: 'from-red-600 to-orange-600',
          icon: AlertTriangle,
          title: '🚨 HACK FINANCEIRO DETECTADO',
          urgencyText: 'SITUAÇÃO CRÍTICA'
        };
      case 'market_crash':
        return {
          bgGradient: 'from-purple-600 to-blue-600',
          icon: AlertTriangle,
          title: '📉 COLAPSO DO MERCADO',
          urgencyText: 'EMERGÊNCIA ECONÔMICA'
        };
      case 'cyber_attack':
        return {
          bgGradient: 'from-cyan-600 to-blue-600',
          icon: Zap,
          title: '⚡ ATAQUE CIBERNÉTICO',
          urgencyText: 'DEFESA ATIVA'
        };
      default:
        return {
          bgGradient: 'from-red-600 to-orange-600',
          icon: AlertTriangle,
          title: '🚨 EMERGÊNCIA NA CIDADE',
          urgencyText: 'AJUDA NECESSÁRIA'
        };
    }
  };

  const theme = getCrisisTheme(emergency.crisis_type);
  const IconComponent = theme.icon;

  return (
    <>
      <Card className={`relative overflow-hidden border-2 border-red-500 shadow-lg animate-pulse-slow bg-gradient-to-r ${theme.bgGradient}`}>
        <div className="absolute inset-0 bg-black/20" />
        <CardContent className="relative p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{theme.title}</h3>
                <Badge variant="destructive" className="bg-red-500/80">
                  {theme.urgencyText}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold">
                    {hoursLeft}h {minutesLeft}m
                  </span>
                </div>
                <span className="text-xs opacity-90">restantes</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm mb-4 opacity-90">
            {emergency.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Meta BTZ</span>
                <span className="text-xs">
                  {emergency.current_btz_contributions.toLocaleString()} / {emergency.btz_goal.toLocaleString()}
                </span>
              </div>
              <Progress value={btzProgress} className="h-2 bg-white/20" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Meta XP</span>
                <span className="text-xs">
                  {emergency.current_xp_contributions.toLocaleString()} / {emergency.xp_goal.toLocaleString()}
                </span>
              </div>
              <Progress value={xpProgress} className="h-2 bg-white/20" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4" />
                <span>Progresso Geral: {Math.round(overallProgress)}%</span>
              </div>
              <Badge variant="outline" className="border-white/40 text-white">
                Recompensa {emergency.reward_multiplier}x
              </Badge>
            </div>
            
            <Button
              onClick={() => setShowContribution(true)}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold"
            >
              CONTRIBUIR AGORA
            </Button>
          </div>
        </CardContent>
      </Card>

      <EmergencyContributionDialog
        emergency={emergency}
        open={showContribution}
        onOpenChange={setShowContribution}
      />
    </>
  );
}
