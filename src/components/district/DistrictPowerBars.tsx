import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Progress } from "@/components/shared/ui/progress";
import { Badge } from "@/components/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shared/ui/tooltip";
import { 
  DollarSign, 
  Cpu, 
  Shield, 
  Zap, 
  ShoppingCart, 
  Users,
  TrendingUp,
  Info 
} from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface DistrictPowerBarsProps {
  district: {
    id: string;
    name: string;
    color_primary: string;
    monetary_power?: number;
    tech_power?: number;
    military_power?: number;
    energy_power?: number;
    commercial_power?: number;
    social_power?: number;
  };
  className?: string;
}

export function DistrictPowerBars({ district, className }: DistrictPowerBarsProps) {
  const { t } = useI18n();

  const powerConfig = [
    {
      key: 'monetary_power',
      label: t('district.powers.monetary'),
      icon: DollarSign,
      color: '#10B981',
      description: t('district.powers.monetaryDesc')
    },
    {
      key: 'tech_power',
      label: t('district.powers.tech'),
      icon: Cpu,
      color: '#3B82F6',
      description: t('district.powers.techDesc')
    },
    {
      key: 'military_power',
      label: t('district.powers.military'),
      icon: Shield,
      color: '#EF4444',
      description: t('district.powers.militaryDesc')
    },
    {
      key: 'energy_power',
      label: t('district.powers.energy'),
      icon: Zap,
      color: '#F59E0B',
      description: t('district.powers.energyDesc')
    },
    {
      key: 'commercial_power',
      label: t('district.powers.commercial'),
      icon: ShoppingCart,
      color: '#8B5CF6',
      description: t('district.powers.commercialDesc')
    },
    {
      key: 'social_power',
      label: t('district.powers.social'),
      icon: Users,
      color: '#EC4899',
      description: t('district.powers.socialDesc')
    }
  ];

  const totalPower = powerConfig.reduce((sum, config) => {
    return sum + (district[config.key as keyof typeof district] as number || 0);
  }, 0);

  const averagePower = Math.round(totalPower / powerConfig.length);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: district.color_primary }} />
            {t('district.powers.title')}
          </span>
          <Badge variant="outline">
            {t('district.powers.average')}: {averagePower}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {powerConfig.map((config) => {
            const IconComponent = config.icon;
            const value = (district[config.key as keyof typeof district] as number) || 0;
            
            return (
              <TooltipProvider key={config.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-help">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: config.color }}
                          >
                            <IconComponent className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">{value}%</span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Progress value={value} className="h-2" />
                        <div 
                          className="absolute inset-0 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${value}%`,
                            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                            borderRadius: '9999px'
                          }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          {t('district.powers.helpText')}
        </div>
      </CardContent>
    </Card>
  );
}
