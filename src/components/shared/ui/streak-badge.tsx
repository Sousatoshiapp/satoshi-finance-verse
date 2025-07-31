import { cn } from "@/lib/utils";
import { StreakIcon } from "@/components/icons/game-icons";

interface StreakBadgeProps {
  days: number;
  className?: string;
}

export function StreakBadge({ days, className }: StreakBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 bg-streak text-streak-foreground px-3 py-1.5 rounded-full text-sm font-semibold",
      days > 0 && "animate-pulse-glow",
      className
    )}>
      <StreakIcon size="sm" animated={days > 0} variant={days > 0 ? "glow" : "default"} />
      <span>{days} dias</span>
    </div>
  );
}