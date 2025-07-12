import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Função para formatar números grandes
const formatLargeNumber = (value: number): { formatted: string; suffix: string } => {
  if (value >= 1000000) {
    return {
      formatted: (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1),
      suffix: 'M'
    };
  }
  if (value >= 1000) {
    return {
      formatted: (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1),
      suffix: 'K'
    };
  }
  return {
    formatted: value.toString(),
    suffix: ''
  };
};

interface DistrictStatsCardProps {
  title: string;
  value: number;
  suffix: string;
  icon: string;
  rank?: number;
  showRank?: boolean;
  loading?: boolean;
  className?: string;
}

export function DistrictStatsCard({ 
  title, 
  value, 
  suffix, 
  icon, 
  rank, 
  showRank = false,
  loading = false, 
  className = "" 
}: DistrictStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && value !== undefined) {
      // Animate number counting up
      const duration = 1000;
      const startTime = Date.now();
      const startValue = 0;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        const animatedValue = Math.floor(startValue + (value - startValue) * easedProgress);
        setDisplayValue(animatedValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [value, loading]);

  if (loading) {
    return (
      <div className={cn(
        "bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-4",
        "animate-pulse min-w-[160px]",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#adff2f]/50" />
          <div className="flex-1">
            <div className="h-4 w-16 bg-white/20 rounded mb-1" />
            <div className="h-5 w-20 bg-white/20 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl",
      "p-2 md:p-4 transition-all duration-300",
      "hover:border-[#adff2f]/40 hover:bg-black/30",
      "cursor-pointer select-none overflow-hidden",
      className
    )}>
      <div className="flex items-center gap-2 md:gap-3">
        {/* Icon Circle */}
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#adff2f] flex items-center justify-center">
          <span className="text-black font-bold text-sm md:text-lg">{icon}</span>
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-white/70 text-xs font-medium mb-1 truncate leading-tight">
            {title}
          </div>
          {showRank ? (
            <div className="flex flex-col items-start">
              <span className="font-mono font-bold text-white text-sm md:text-base leading-tight truncate">
                {value > 0 ? `${value}º` : '-'}
              </span>
              <div className="text-[#adff2f] text-xs mt-1 truncate">
                Lugar
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start">
              {(() => {
                const formatted = formatLargeNumber(displayValue);
                return (
                  <>
                    <span className="font-mono font-bold text-white text-sm md:text-base leading-tight truncate">
                      {formatted.formatted}{formatted.suffix}
                    </span>
                    <div className="text-[#adff2f] text-xs mt-1 truncate">
                      {suffix}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}