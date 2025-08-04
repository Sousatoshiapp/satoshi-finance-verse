import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { Clock, Shield, TrendingUp, TrendingDown, Send, Download } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface BTZCounterProps {
  className?: string;
}

// State machine para animação robusta
type AnimationState = 'IDLE' | 'ANIMATING' | 'COMPLETE';

export function BTZCounter({ className = "" }: BTZCounterProps) {
  const navigate = useNavigate();
  const { points: currentBTZ, isLoading } = useRealtimePoints();
  const { analytics, formatTimeUntilYield, getProtectionPercentage } = useBTZEconomics();
  const { t } = useI18n();

  const [displayBTZ, setDisplayBTZ] = useState(0);
  const [previousBTZ, setPreviousBTZ] = useState(0);
  const [animationState, setAnimationState] = useState<AnimationState>('IDLE');
  const [showDetails, setShowDetails] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const trendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedBTZ = useRef<number>(0);

  // Slot machine animation otimizada
  const startSlotMachineAnimation = useCallback((targetValue: number, startValue: number) => {
    if (animationState !== 'IDLE' || startValue === targetValue) return;
    
    setAnimationState('ANIMATING');
    setPreviousBTZ(startValue);
    
    // Clear existing timers
    if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    if (trendTimerRef.current) clearTimeout(trendTimerRef.current);
    
    const duration = 800;
    const steps = 20;
    const increment = (targetValue - startValue) / steps;
    let currentStep = 0;

    animationTimerRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      if (currentStep >= steps) {
        setDisplayBTZ(targetValue);
        setAnimationState('COMPLETE');
        setShowTrend(true);
        
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current);
          animationTimerRef.current = null;
        }
        
        trendTimerRef.current = setTimeout(() => {
          setShowTrend(false);
          setAnimationState('IDLE');
        }, 2000);
        
      } else {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (increment * currentStep * easeOut);
        const randomOffset = (Math.random() - 0.5) * 5 * (1 - progress);
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
    <div className={`relative w-full ${className}`}>
      <div 
        className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-xl p-4 transition-all duration-300 hover:border-primary/50 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Icon and BTZ amount */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            
            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground font-nunito">
                    {displayBTZ.toLocaleString()}
                  </span>
                  <span className="text-xl text-muted-foreground font-medium font-nunito">BTZ</span>
                </div>
                
                {/* Action buttons - moved to same line as BTZ */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/p2p-transfer?tab=send');
                    }}
                    className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                    title={t('btz.sendBTZ')}
                  >
                    <Send className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/p2p-transfer?tab=receive');
                    }}
                    className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                    title={t('btz.receiveBTZ')}
                  >
                    <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </div>
              
              {analytics?.current.yield_applied_today && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-primary text-sm font-nunito">✓ {t('btz.yieldedToday')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <div className={`overflow-hidden transition-all duration-300 ${showDetails ? 'max-h-40 mt-4' : 'max-h-0'}`}>
          <div className="border-t border-border pt-4 space-y-3">
            {analytics && (
              <>
                {/* Next yield info */}
                {analytics.current.time_until_next_yield_ms > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔥</span>
                      <span className="text-sm text-muted-foreground font-nunito">{t('btz.nextYield')}</span>
                    </div>
                    <span className="text-sm font-medium text-orange-500 font-nunito">
                      {formatTimeUntilYield(analytics.current.time_until_next_yield_ms)}
                    </span>
                  </div>
                )}

                {/* Protection percentage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground font-nunito">{t('btz.protectedBTZ')}</span>
                  </div>
                  <span className="text-sm font-medium text-primary font-nunito">
                    {getProtectionPercentage().toFixed(3)}%
                  </span>
                </div>

                {/* Next yield amount */}
                {analytics.current.next_yield_amount > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground font-nunito">{t('btz.nextGain')}</span>
                    </div>
                    <span className="text-sm font-medium text-primary font-nunito">
                      +{analytics.current.next_yield_amount.toLocaleString()} BTZ
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trend animation - outside card to avoid click conflicts */}
      {showTrend && (
        <div className="absolute -top-2 -right-2 pointer-events-none">
          <div className="animate-bounce">
            {currentBTZ > previousBTZ ? (
              <TrendingUp className="w-6 h-6 text-primary" />
            ) : (
              <TrendingDown className="w-6 h-6 text-destructive" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
