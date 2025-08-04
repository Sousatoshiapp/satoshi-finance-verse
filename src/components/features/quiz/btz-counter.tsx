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
      <div className="bg-card/80 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 transition-all duration-300 hover:border-green-500/50">
        <div className="flex items-center justify-between">
          {/* Left side - Icon and BTZ amount */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {displayBTZ.toLocaleString()}
                </span>
                <span className="text-xl text-muted-foreground font-medium">BTZ</span>
              </div>
              
              {analytics?.current.yield_applied_today && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-green-500 text-sm">✓ Rendeu hoje</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/p2p-transfer?tab=send');
              }}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              title="Enviar BTZ"
            >
              <Send className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/p2p-transfer?tab=receive');
              }}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              title="Receber BTZ"
            >
              <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
