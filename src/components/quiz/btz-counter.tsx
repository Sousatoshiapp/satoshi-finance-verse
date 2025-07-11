import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { Clock, Shield, TrendingUp, TrendingDown } from "lucide-react";

interface BTZCounterProps {
  className?: string;
}

export function BTZCounter({ className = "" }: BTZCounterProps) {
  console.log("🎯 BTZCounter renderizado!");
  
  const { user } = useAuth();
  console.log("🔑 User no BTZCounter:", user?.id);
  
  const { points: currentBTZ, isLoading } = useRealtimePoints();
  console.log("💰 Points from useRealtimePoints:", { currentBTZ, isLoading });

  // Force a re-render when currentBTZ changes
  useEffect(() => {
    console.log("🔄 currentBTZ MUDOU:", currentBTZ);
  }, [currentBTZ]);

  const [displayBTZ, setDisplayBTZ] = useState(0);
  const [previousBTZ, setPreviousBTZ] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const { analytics, formatTimeUntilYield, getProtectionPercentage } = useBTZEconomics();

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayBTZRef = useRef(0);

  // Sempre manter o ref atualizado com o valor atual
  useEffect(() => {
    displayBTZRef.current = displayBTZ;
  }, [displayBTZ]);

  const animateToNewValue = useCallback((newValue: number) => {
    if (isAnimating) return;
    
    // Usar ref para capturar o valor mais atual
    const startValue = displayBTZRef.current;
    
    // Se o valor é o mesmo, não precisa animar
    if (startValue === newValue) {
      console.log('🎰 BTZ: Valor inalterado, pulando animação:', newValue);
      return;
    }
    
    console.log('🎰 Iniciando animação slot machine BTZ:', { from: startValue, to: newValue });
    
    setIsAnimating(true);
    
    // Limpar timer anterior se existir
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    
    // Efeito slot machine - animar números
    const duration = 800;
    const steps = 30;
    const increment = (newValue - startValue) / steps;
    let step = 0;

    animationTimerRef.current = setInterval(() => {
      step++;
      const currentStep = startValue + (increment * step);
      
      console.log('🎰 Step', step, '/', steps, ':', Math.round(currentStep));
      
      if (step >= steps) {
        setDisplayBTZ(newValue);
        setIsAnimating(false);
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current);
          animationTimerRef.current = null;
        }
        console.log('🎰 Animação slot machine BTZ concluída:', newValue);
      } else {
        setDisplayBTZ(Math.round(currentStep));
      }
    }, duration / steps);
  }, [isAnimating]);

  // Initialize display BTZ when currentBTZ loads
  useEffect(() => {
    console.log('🔄 BTZ currentBTZ changed:', { currentBTZ, isLoading, displayBTZ, isAnimating });
    
    if (!isLoading && currentBTZ !== undefined) {
      // CORREÇÃO: Sempre que currentBTZ mudar e for diferente do displayBTZ, animar
      if (currentBTZ !== displayBTZ) {
        if (displayBTZ === 0) {
          // Initial load - set without animation
          console.log('🚀 Carregamento inicial do BTZ:', currentBTZ);
          setDisplayBTZ(currentBTZ);
          setPreviousBTZ(currentBTZ);
        } else if (!isAnimating) {
          // BTZ changed - animate to new value
          console.log('💰 BTZ mudou - iniciando animação:', { from: displayBTZ, to: currentBTZ });
          setPreviousBTZ(displayBTZ);
          animateToNewValue(currentBTZ);
          setShowTrend(true);
          setTimeout(() => setShowTrend(false), 3000);
        }
      }
    }
  }, [currentBTZ, isLoading]);

  // Cleanup timer on unmount
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
          border border-[#adff2f]/20 rounded-xl p-4 
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
              <span className="text-2xl font-mono font-bold text-foreground">
                {displayBTZ.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground font-medium">BTZ</span>
              
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