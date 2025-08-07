import { useState, useEffect, useCallback } from "react";
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { cn } from "@/lib/utils";
import { formatBTZDisplay } from "@/utils/btz-formatter";

interface QuizBTZCardProps {
  className?: string;
}

type AnimationState = 'IDLE' | 'ANIMATING' | 'COMPLETE';

export function QuizBTZCard({ className = "" }: QuizBTZCardProps) {
  const { points: currentBTZ, isLoading } = useRealtimePoints();
  
  const [displayBTZ, setDisplayBTZ] = useState(0);
  const [previousBTZ, setPreviousBTZ] = useState(0);
  const [animationState, setAnimationState] = useState<AnimationState>('IDLE');
  const [showGlow, setShowGlow] = useState(false);
  const [logoAnimating, setLogoAnimating] = useState(false);

  // Inicializar valores quando carregar
  useEffect(() => {
    if (!isLoading && currentBTZ !== undefined && displayBTZ === 0) {
      setDisplayBTZ(currentBTZ);
      setPreviousBTZ(currentBTZ);
    }
  }, [currentBTZ, isLoading, displayBTZ]);

  // Animação slot machine quando BTZ muda
  const triggerSlotMachineAnimation = useCallback((newValue: number) => {
    if (animationState !== 'IDLE') return;
    
    setAnimationState('ANIMATING');
    setShowGlow(true);
    setLogoAnimating(true);
    
    const startTime = Date.now();
    const duration = 800;
    const startValue = displayBTZ;
    const targetValue = newValue;
    
    // Função de easing para suavizar a animação
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      // Slot machine effect: números "girando"
      const animatedValue = startValue + (targetValue - startValue) * easedProgress;
      
      setDisplayBTZ(animatedValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayBTZ(targetValue);
        setAnimationState('COMPLETE');
        
        // Efeitos finais
        setTimeout(() => {
          setShowGlow(false);
          setLogoAnimating(false);
          setAnimationState('IDLE');
        }, 200);
      }
    };
    
    requestAnimationFrame(animate);
  }, [displayBTZ, animationState]);

  // Detectar mudanças no BTZ e disparar animação
  useEffect(() => {
    if (isLoading || currentBTZ === undefined) return;
    
    if (currentBTZ !== previousBTZ && previousBTZ !== 0) {
      triggerSlotMachineAnimation(currentBTZ);
    }
    
    setPreviousBTZ(currentBTZ);
  }, [currentBTZ, previousBTZ, isLoading, triggerSlotMachineAnimation]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "bg-transparent backdrop-blur-sm border border-[#adff2f]/20 rounded-lg px-4 py-3 min-w-[140px]",
        "animate-pulse",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#adff2f]/50" />
          <div className="h-5 w-20 bg-[#adff2f]/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-transparent backdrop-blur-sm border border-[#adff2f]/20 rounded-lg",
        "px-2 py-2 transition-all duration-300",
        "hover:border-[#adff2f]/40 hover:backdrop-blur-md",
        "cursor-pointer select-none min-w-[120px]",
        showGlow && "shadow-[0_0_20px_rgba(173,255,47,0.4)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Logo BTZ - Círculo verde com "B" - Maior */}
        <div 
          className={cn(
            "w-6 h-6 rounded-full bg-[#adff2f] flex items-center justify-center",
            "transition-all duration-200",
            logoAnimating && "animate-bounce scale-110",
            showGlow && "shadow-[0_0_8px_rgba(173,255,47,0.6)]"
          )}
        >
          <span className="text-black font-bold text-sm">B</span>
        </div>
        
        {/* Valor BTZ com animação - Maior */}
        <div className="flex flex-col">
          <div 
            className={cn(
              "font-mono font-bold text-white transition-all duration-200",
              "text-lg leading-tight",
              animationState === 'ANIMATING' && "scale-105",
              showGlow && "text-[#adff2f] drop-shadow-[0_0_4px_rgba(173,255,47,0.8)]"
            )}
          >
            {formatBTZDisplay(displayBTZ)}
          </div>
        </div>
      </div>
      
      {/* Efeito de brilho adicional durante animação */}
      {showGlow && (
        <div className="absolute inset-0 rounded-lg border border-[#adff2f]/60 animate-pulse" />
      )}
    </div>
  );
}