import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import { getLevelInfo } from "@/data/levels";
import { OptimizedImage } from "@/components/shared/ui/optimized-image";
import xpLogo from "@/assets/xp-logo.png";

interface XPCardProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export function XPCard({ currentXP, nextLevelXP, level, className }: XPCardProps) {
  const currentLevelInfo = getLevelInfo(level);
  const nextLevelInfo = getLevelInfo(level + 1);
  const isMaxLevel = nextLevelXP === 0 || level >= 100;
  
  // Calculate current level XP requirement
  const getCurrentLevelXP = (level: number) => {
    if (level === 1) return 0;
    
    // XP requirements by level
    const xpTable: { [key: number]: number } = {
      1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
      6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
      11: 3250, 12: 3850, 13: 4500, 14: 5200, 15: 5950,
      16: 6750, 17: 7600, 18: 8500, 19: 9450, 20: 10450,
      21: 10500, 22: 11000, 23: 12000, 24: 13500, 25: 15500
    };
    
    return xpTable[level] || 0;
  };

  // Calculate progress within current level
  const currentLevelXP = getCurrentLevelXP(level);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const xpRemaining = nextLevelXP - currentXP;
  
  return (
    <div className={cn(
      "bg-card rounded-xl p-4 shadow-card border",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <OptimizedImage 
              src={xpLogo} 
              alt="XP" 
              width={24} 
              height={24} 
              className="w-6 h-6 object-contain" 
              priority={false}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{currentLevelInfo.name}</span>
            <span className="text-xs text-muted-foreground">Nível {level}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{currentXP} XP</span>
      </div>
      
      <ProgressBar
        value={isMaxLevel ? 100 : Math.max(0, xpInCurrentLevel)}
        max={isMaxLevel ? 100 : Math.max(1, xpNeededForLevel)}
        variant="experience"
        showLabel={false}
      />
      
      <div className="flex justify-between items-center mt-2">
        {isMaxLevel ? (
          <p className="text-xs font-semibold text-primary">
            🏆 NÍVEL MÁXIMO ATINGIDO
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Próximo: {nextLevelInfo.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.max(0, xpRemaining)} XP
            </p>
          </>
        )}
      </div>
    </div>
  );
}
