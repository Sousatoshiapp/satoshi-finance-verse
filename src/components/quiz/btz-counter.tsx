import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { Clock, Shield, TrendingUp, TrendingDown } from "lucide-react";

interface BTZCounterProps {
  className?: string;
}

export function BTZCounter({ className = "" }: BTZCounterProps) {
  const { user } = useAuth();
  const { points: currentBTZ, isLoading } = useRealtimePoints();
  const { analytics, formatTimeUntilYield, getProtectionPercentage } = useBTZEconomics();

  const [displayBTZ, setDisplayBTZ] = useState(0);
  const [previousBTZ, setPreviousBTZ] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const animateToNewValue = useCallback((newValue: number, startValue: number) => {
    if (isAnimating || startValue === newValue) return;
    
    console.log('🎰 Animating BTZ:', { from: startValue, to: newValue });
    setIsAnimating(true);
    setPreviousBTZ(startValue);
    
    // Clear any existing timer
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    
    // Enhanced slot machine animation
    const duration = 800;
    const steps = 25;
    const increment = (newValue - startValue) / steps;
    let step = 0;

    animationTimerRef.current = setInterval(() => {
      step++;
      
      if (step >= steps) {
        console.log('✅ Animation complete:', newValue);
        setDisplayBTZ(newValue);
        setIsAnimating(false);
        setShowTrend(true);
        setTimeout(() => setShowTrend(false), 3000);
        
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current);
          animationTimerRef.current = null;
        }
      } else {
        const currentStep = startValue + (increment * step);
        const randomOffset = Math.random() * 5 - 2.5; // Slot machine effect
        setDisplayBTZ(Math.round(currentStep + randomOffset));
      }
    }, duration / steps);
  }, [isAnimating]);

  // Enhanced effect to handle BTZ changes with better logging
  useEffect(() => {
    if (isLoading || currentBTZ === undefined) return;
    
    console.log('🎰 BTZ Update:', { currentBTZ, displayBTZ, isAnimating, isLoading });
    
    if (displayBTZ === 0) {
      // Initial load - set immediately
      console.log('🚀 Initial BTZ load:', currentBTZ);
      setDisplayBTZ(currentBTZ);
      setPreviousBTZ(currentBTZ);
    } else if (currentBTZ !== displayBTZ && !isAnimating) {
      // Value changed - animate
      console.log('🎰 Starting slot machine animation:', { from: displayBTZ, to: currentBTZ });
      animateToNewValue(currentBTZ, displayBTZ);
    }
  }, [currentBTZ, isLoading, displayBTZ, isAnimating, animateToNewValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, []);


  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          bg-transparent backdrop-blur-sm 
          border border-[#adff2f]/20 rounded-lg px-8 py-4 
          transition-all duration-300 hover:shadow-lg hover:shadow-[#adff2f]/10
          ${isAnimating ? 'scale-105 shadow-lg shadow-[#adff2f]/20' : ''}
          cursor-pointer
        `}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#adff2f] flex items-center justify-center">
            <span className="text-black font-bold text-lg">B</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-mono font-bold text-foreground">
                {displayBTZ.toLocaleString()}
              </span>
              <span className="text-3xl text-muted-foreground font-medium">BTZ</span>
              
              {/* Trend Arrow */}
              {showTrend && currentBTZ !== previousBTZ && (
                <div className={`transition-all duration-300 ${showTrend ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                  {currentBTZ > previousBTZ ? (
                    <TrendingUp className="w-4 h-4 text-[#adff2f] animate-bounce" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 animate-bounce" />
                  )}
                </div>
              )}
            </div>
            
            {/* Compact view */}
            {!showDetails && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {analytics?.current.yield_applied_today ? (
                  <span className="text-[#adff2f]">✓ Rendeu hoje</span>
                ) : (
                  <span className="text-orange-500">⏰ Próximo: {analytics ? formatTimeUntilYield(analytics.current.time_until_next_yield_ms) : '--'}</span>
                )}
              </div>
            )}
            
            {/* Expanded view */}
            {showDetails && analytics && (
              <div className="mt-3 space-y-2">
                {/* Daily Yield */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#adff2f]" />
                    <span>Próximo rendimento</span>
                  </div>
                  <span className="font-mono text-[#adff2f]">
                    +{analytics.current.next_yield_amount.toLocaleString()} BTZ
                  </span>
                </div>
                
                {/* Protected BTZ */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span>BTZ Protegido</span>
                  </div>
                  <span className="font-mono text-blue-400">
                    {analytics.current.protected_btz.toLocaleString()} ({getProtectionPercentage().toFixed(1)}%)
                  </span>
                </div>
                
                {/* Streak */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500">🔥</span>
                    <span>Streak</span>
                  </div>
                  <span className="font-mono text-orange-500">
                    {analytics.current.consecutive_login_days} dias (+{(analytics.bonuses.streak_bonus * 100).toFixed(1)}%)
                  </span>
                </div>
                
                {/* Time until next yield */}
                {!analytics.current.yield_applied_today && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>Próximo em</span>
                    </div>
                    <span className="font-mono text-gray-400">
                      {formatTimeUntilYield(analytics.current.time_until_next_yield_ms)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}