import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface PowerBarProps {
  currentPower: number;
  maxPower: number;
  label?: string;
  className?: string;
  color?: string;
  showPercentage?: boolean;
  showMaxValue?: boolean;
}

export function PowerBar({
  currentPower,
  maxPower,
  label = "Poder",
  className,
  color = "#3B82F6",
  showPercentage = true,
  showMaxValue = true
}: PowerBarProps) {
  const percentage = Math.min((currentPower / maxPower) * 100, 100);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentPower.toLocaleString()}
          {showPercentage && ` (${percentage.toFixed(1)}%)`}
        </div>
      </div>
      
      <div className="relative">
        <Progress value={percentage} className="h-3" />
        <div 
          className="absolute inset-0 h-3 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            borderRadius: '9999px'
          }}
        />
      </div>
      
      {maxPower > 0 && showMaxValue && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          Max: {maxPower.toLocaleString()}
        </div>
      )}
    </div>
  );
}