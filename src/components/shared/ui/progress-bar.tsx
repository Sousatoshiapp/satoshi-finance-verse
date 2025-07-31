import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "experience" | "streak";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = "default"
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    default: "bg-primary",
    experience: "bg-experience",
    streak: "bg-streak"
  };

  const backgroundVariants = {
    default: "bg-muted",
    experience: "bg-muted",
    streak: "bg-muted"
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>Progresso</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className={cn(
        "h-3 rounded-full overflow-hidden",
        backgroundVariants[variant]
      )}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}