import { cn } from "@/lib/utils";

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
      <span className="text-lg">🔥</span>
      <span>{days} dias</span>
    </div>
  );
}