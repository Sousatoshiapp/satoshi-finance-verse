import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { Clock, Shield, TrendingUp, TrendingDown, Send, Download, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { formatBTZ } from "@/utils/btz-formatter";

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
  const [showBTZ, setShowBTZ] = useState(true);

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
        const randomOffset = (Math.random() - 0.5) * 0.05 * (1 - progress);
        setDisplayBTZ(Math.max(0, currentValue + randomOffset));
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

  // Load BTZ visibility preference from localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem('btz-visibility');
    if (savedVisibility !== null) {
      setShowBTZ(savedVisibility === 'true');
    }
  }, []);

  // Toggle BTZ visibility with persistence
  const toggleBTZVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newVisibility = !showBTZ;
    setShowBTZ(newVisibility);
    localStorage.setItem('btz-visibility', newVisibility.toString());
  }, [showBTZ]);

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
      <div className="flex items-center gap-3">
        {/* BTZ Card - 20% smaller */}
        <div 
          className={`
            bg-transparent backdrop-blur-sm 
            border border-[#adff2f]/20 rounded-lg px-3 md:px-6 py-2 md:py-3 
            transition-all duration-300 hover:shadow-lg hover:shadow-[#adff2f]/10
            ${animationState === 'ANIMATING' ? 'scale-105 shadow-lg shadow-[#adff2f]/20' : ''}
            cursor-pointer
            max-w-xs md:max-w-sm
          `}
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center w-full">
            {/* BTZ Icon + Number + Eye + Trend */}
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#adff2f] flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xs md:text-base">B</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-3xl md:text-4xl font-mono font-bold text-foreground">
                  {showBTZ ? formatBTZ(displayBTZ) : "••••"}
                </span>
                <span className="text-base md:text-lg text-muted-foreground font-medium">BTZ</span>
                
                {/* Eye toggle button */}
                <button 
                  onClick={toggleBTZVisibility}
                  className="ml-1 p-1 rounded hover:bg-muted/50 transition-colors"
                  title={showBTZ ? "Ocultar BTZ" : "Mostrar BTZ"}
                >
                  {showBTZ ? (
                    <Eye className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <EyeOff className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
                
                {/* Trend Arrow */}
                {showTrend && currentBTZ !== previousBTZ && (
                  <div className="transition-all duration-300 ml-1">
                    {currentBTZ > previousBTZ ? (
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-[#adff2f] animate-bounce" />
                    ) : (
                      <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-500 animate-bounce" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Compact view */}
          {!showDetails && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              {analytics?.current.yield_applied_today ? (
                <span className="text-[#adff2f]">✓ {t('btz.yieldedToday')}</span>
              ) : (
                <span className="text-orange-500">⏰ {t('btz.next')}: {analytics ? formatTimeUntilYield(analytics.current.time_until_next_yield_ms) : '--'}</span>
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
                  <span>{t('btz.nextYield')}</span>
                </div>
                <span className="font-mono text-[#adff2f]">
                  +{formatBTZ(analytics.current.next_yield_amount)} BTZ
                </span>
              </div>
              
              {/* Protected BTZ */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span>{t('btz.protectedBTZ')}</span>
                </div>
                <span className="font-mono text-blue-400">
                  {formatBTZ(analytics.current.protected_btz)} ({getProtectionPercentage().toFixed(1)}%)
                </span>
              </div>
              
              {/* Streak */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-orange-500">🔥</span>
                  <span>{t('btz.streak')}</span>
                </div>
                <span className="font-mono text-orange-500">
                  {analytics.current.consecutive_login_days} {t('btz.days')} (+{(analytics.bonuses.streak_bonus * 100).toFixed(1)}%)
                </span>
              </div>
              
              {/* Time until next yield */}
              {!analytics.current.yield_applied_today && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{t('btz.nextIn')}</span>
                  </div>
                  <span className="font-mono text-gray-400">
                    {formatTimeUntilYield(analytics.current.time_until_next_yield_ms)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* P2P Transfer Icons - Outside the card */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/p2p-transfer?tab=send');
            }}
            className="p-1.5 md:p-2 rounded-full hover:bg-muted/50 transition-colors"
            title="Enviar BTZ"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground hover:text-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/p2p-transfer?tab=receive');
            }}
            className="p-1.5 md:p-2 rounded-full hover:bg-muted/50 transition-colors"
            title="Receber BTZ"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
