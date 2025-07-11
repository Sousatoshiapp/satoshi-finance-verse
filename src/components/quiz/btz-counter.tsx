import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useBTZEconomics } from "@/hooks/use-btz-economics";
import { Clock, Shield, TrendingUp, TrendingDown } from "lucide-react";

interface BTZCounterProps {
  className?: string;
}

export function BTZCounter({ className = "" }: BTZCounterProps) {
  const { user } = useAuth();
  const [currentBTZ, setCurrentBTZ] = useState(0);
  const [displayBTZ, setDisplayBTZ] = useState(0);
  const [previousBTZ, setPreviousBTZ] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrend, setShowTrend] = useState(false);
  const { analytics, formatTimeUntilYield, getProtectionPercentage } = useBTZEconomics();

  // Buscar BTZ atual do usuário
  useEffect(() => {
    if (!user) return;

    const fetchBTZ = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setCurrentBTZ(data.points || 0);
        setDisplayBTZ(data.points || 0);
      }
    };

    fetchBTZ();

    // Realtime subscription para atualizações de BTZ
    const channel = supabase
      .channel('btz-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newPoints = payload.new.points || 0;
          console.log('BTZ Update received:', { currentBTZ, newPoints });
          if (newPoints !== currentBTZ) {
            setPreviousBTZ(currentBTZ);
            animateToNewValue(newPoints);
            setShowTrend(true);
            // Esconder trend após 3 segundos
            setTimeout(() => setShowTrend(false), 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // Removido currentBTZ da dependência para evitar loop

  const animateToNewValue = (newValue: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentBTZ(newValue);
    
    // Efeito slot machine - animar números
    const duration = 800;
    const steps = 30;
    const increment = (newValue - displayBTZ) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentStep = displayBTZ + (increment * step);
      
      if (step >= steps) {
        setDisplayBTZ(newValue);
        setIsAnimating(false);
        clearInterval(timer);
        
        // Som de máquina registradora
        playSlotMachineSound();
      } else {
        setDisplayBTZ(Math.round(currentStep));
      }
    }, duration / steps);
  };

  const playSlotMachineSound = () => {
    // Criar efeito sonoro de máquina registradora usando Web Audio API
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Som de registro de dinheiro
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

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