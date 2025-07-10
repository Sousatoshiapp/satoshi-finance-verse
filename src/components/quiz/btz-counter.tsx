import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BTZCounterProps {
  className?: string;
}

export function BTZCounter({ className = "" }: BTZCounterProps) {
  const { user } = useAuth();
  const [currentBTZ, setCurrentBTZ] = useState(0);
  const [displayBTZ, setDisplayBTZ] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
    const subscription = supabase
      .channel('btz-updates')
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
          if (newPoints !== currentBTZ) {
            animateToNewValue(newPoints);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, currentBTZ]);

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
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Efeito de brilho quando animando */}
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse rounded-lg" />
        )}
        
        <div className={`
          bg-transparent backdrop-blur-sm
          text-white font-bold text-4xl px-8 py-4 rounded-lg
          shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-[#adff2f]/20
          ${isAnimating ? 'animate-pulse shadow-[0_4px_25px_rgba(173,255,47,0.3)]' : ''}
          transition-all duration-300
        `}>
          <div className="flex items-center space-x-3">
            {/* Logo Beetz simples */}
            <div className="w-8 h-8 rounded-full bg-[#adff2f] flex items-center justify-center">
              <span className="text-black font-bold text-lg">B</span>
            </div>
            <span className="font-mono text-3xl">
              {displayBTZ.toLocaleString()} BTZ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}