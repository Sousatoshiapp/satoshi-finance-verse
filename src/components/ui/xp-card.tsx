import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import { getLevelInfo } from "@/data/levels";

interface XPCardProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export function XPCard({ currentXP, nextLevelXP, level, className }: XPCardProps) {
  const currentLevelInfo = getLevelInfo(level);
  const nextLevelInfo = getLevelInfo(level + 1);
  
  return (
    <div className={cn(
      "bg-card rounded-xl p-4 shadow-card border",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-experience text-white flex items-center justify-center text-sm font-bold">
            {level}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{currentLevelInfo.name}</span>
            <span className="text-xs text-muted-foreground">Nível {level}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{currentXP} XP</span>
      </div>
      
      <ProgressBar
        value={currentXP}
        max={nextLevelXP}
        variant="experience"
        showLabel={false}
      />
      
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-muted-foreground">
          Próximo: {nextLevelInfo.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {nextLevelXP - currentXP} XP
        </p>
      </div>
    </div>
  );
}