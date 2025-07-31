import { cn } from "@/lib/utils";

interface CountdownBarProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

export function CountdownBar({ timeLeft, totalTime, className }: CountdownBarProps) {
  const percentage = Math.max((timeLeft / totalTime) * 100, 0);
  const isCritical = timeLeft <= 5;
  
  return (
    <div className={cn("w-full", className)}>
      <div className="h-3 rounded-full overflow-hidden bg-muted">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            isCritical 
              ? "bg-red-500 animate-pulse" 
              : "bg-[#adff2f]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}