import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { Clock, Shield, TrendingUp, TrendingDown } from "lucide-react";

interface BTZCounterProps {
  className?: string;
}

// State machine para animação robusta
type AnimationState = 'IDLE' | 'ANIMATING' | 'COMPLETE';

export function BTZCounter({ className = "" }: BTZCounterProps) {
  const { user } = useAuth();
  const { points: currentBTZ, isLoading } = useRealtimePoints();
  const { analytics, formatTimeUntilYield, getProtectionPercentage } = useBTZEconomics();

  const [displayBTZ, setDisplayBTZ] = useState(0);
  const [previousBTZ, setPreviousBTZ] = useState(0);
  const [animationState, setAnimationState] = useState<AnimationState>('IDLE');
  const [showDetails, setShowDetails] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedBTZ = useRef<number>(0);

  // Slot machine animation com state machine robusto
  const startSlotMachineAnimation = useCallback((targetValue: number, startValue: number) => {
    if (animationState !== 'IDLE' || startValue === targetValue) return;
    
    setAnimationState('ANIMATING');
    setPreviousBTZ(startValue);
    setAnimationProgress(0);
    
    // Clear existing timers
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }
    if (trendTimerRef.current) {
      clearTimeout(trendTimerRef.current);
    }
    
    const duration = 1000; // 1 segundo para animação mais fluida
    const steps = 30; // Mais steps para smoother animation
    const increment = (targetValue - startValue) / steps;
    let currentStep = 0;

    animationTimerRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setAnimationProgress(progress);
      
      if (currentStep >= steps) {
        // Animation complete
        setDisplayBTZ(targetValue);
        setAnimationState('COMPLETE');
        setShowTrend(true);
        
        // Clean up
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current);
          animationTimerRef.current = null;
        }
        
        // Hide trend after 3 seconds
        trendTimerRef.current = setTimeout(() => {
          setShowTrend(false);
          setAnimationState('IDLE');
        }, 3000);
        
      } else {
        // Slot machine effect with easing
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (increment * currentStep * easeOutQuart);
        
        // Add randomness for slot machine effect (mais sutil no final)
        const randomIntensity = Math.max(0.1, 1 - progress);
        const randomOffset = (Math.random() - 0.5) * 10 * randomIntensity;
        
        setDisplayBTZ(Math.round(Math.max(0, currentValue + randomOffset)));
      }
    }, duration / steps);
  }, [animationState]);

  // Effect otimizado para mudanças de BTZ - SEM dependências circulares
  useEffect(() => {
    if (isLoading || currentBTZ === undefined || currentBTZ === null) return;
    
    // Initial load
    if (lastProcessedBTZ.current === 0 && displayBTZ === 0) {
      setDisplayBTZ(currentBTZ);
      setPreviousBTZ(currentBTZ);
      lastProcessedBTZ.current = currentBTZ;
      return;
    }
    
    // Value changed and animation is ready
    if (currentBTZ !== lastProcessedBTZ.current && animationState === 'IDLE') {
      startSlotMachineAnimation(currentBTZ, lastProcessedBTZ.current);
      lastProcessedBTZ.current = currentBTZ;
    }
  }, [currentBTZ, isLoading, animationState, startSlotMachineAnimation]);

  // Cleanup robusto
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
      if (trendTimerRef.current) {
        clearTimeout(trendTimerRef.current);
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
          ${animationState === 'ANIMATING' ? 'scale-105 shadow-lg shadow-[#adff2f]/20' : ''}
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
              
              {/* Trend Arrow com progresso de animação */}
              {showTrend && currentBTZ !== previousBTZ && (
                <div className={`transition-all duration-300 ${showTrend ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                  {currentBTZ > previousBTZ ? (
                    <TrendingUp className="w-4 h-4 text-[#adff2f] animate-bounce" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 animate-bounce" />
                  )}
                  {/* Indicador de progresso durante animação */}
                  {animationState === 'ANIMATING' && (
                    <div className="w-8 h-1 bg-[#adff2f]/20 rounded-full overflow-hidden ml-2">
                      <div 
                        className="h-full bg-[#adff2f] transition-all duration-75"
                        style={{ width: `${animationProgress * 100}%` }}
                      />
                    </div>
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