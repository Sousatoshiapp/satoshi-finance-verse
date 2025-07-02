import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";

interface XPCardProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export function XPCard({ currentXP, nextLevelXP, level, className }: XPCardProps) {
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
          <span className="text-sm font-semibold text-foreground">Nível {level}</span>
        </div>
        <span className="text-xs text-muted-foreground">{currentXP} XP</span>
      </div>
      
      <ProgressBar
        value={currentXP}
        max={nextLevelXP}
        variant="experience"
        showLabel={false}
      />
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {nextLevelXP - currentXP} XP para próximo nível
      </p>
    </div>
  );
}