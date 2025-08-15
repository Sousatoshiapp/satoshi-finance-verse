import { useState, useEffect } from "react";

interface CircularTimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onTimeUp: () => void;
  onTick?: (timeLeft: number) => void;
  onCountdown?: () => void;
  enableCountdownSound?: boolean; // Controla se o som de countdown deve tocar
  size?: number;
  className?: string;
}

export function CircularTimer({ 
  duration, 
  isActive, 
  onTimeUp, 
  onTick, 
  onCountdown,
  enableCountdownSound = false,
  size = 120,
  className = ""
}: CircularTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    console.log('🔄 CircularTimer: Resetting timer to', duration);
    setTimeLeft(duration); // Reset when duration changes
  }, [duration]);
  
  // Reset when key changes (for question transitions)
  useEffect(() => {
    console.log('🔄 CircularTimer: Component mounted/key changed, resetting timer');
    setTimeLeft(duration);
  }, []);
  
  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    // Tocar som de contagem regressiva aos 5 segundos (apenas se habilitado)
    if (timeLeft <= 5 && timeLeft > 0 && enableCountdownSound) {
      onCountdown?.();
    }

    const timer = setTimeout(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime);
      onTick?.(newTime);
      
      if (newTime <= 0) {
        onTimeUp();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isActive, onTimeUp, onTick, onCountdown, enableCountdownSound]);

  const progress = timeLeft / duration;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference * (1 - progress);
  
  // Color based on time remaining
  const getColor = () => {
    if (progress > 0.6) return "hsl(var(--timer))"; // Verde #adff2f
    if (progress > 0.3) return "hsl(var(--warning))"; // Yellow
    return "hsl(var(--destructive))"; // Red
  };

  const getGlow = () => {
    if (progress <= 0.3) return "0 0 20px hsl(var(--destructive) / 0.5)";
    if (progress <= 0.6) return "0 0 15px hsl(var(--warning) / 0.3)";
    return "none";
  };

  return (
    <div className={`relative ${className}`}>
      <svg 
        width={size} 
        height={size} 
        className="transform -rotate-90"
        style={{ filter: getGlow() }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="hsl(var(--muted))"
          strokeWidth="4"
          fill="none"
          className="opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke={getColor()}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-linear ${
            timeLeft <= 5 ? 'animate-pulse' : ''
          }`}
        />
      </svg>
      
      {/* Time display in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div 
            className={`text-2xl font-bold transition-colors ${
              timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-foreground'
            }`}
          >
            {timeLeft}
          </div>
          <div className="text-xs text-muted-foreground">
            seg
          </div>
        </div>
      </div>
      
      {/* Pulse effect for low time */}
      {timeLeft <= 5 && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-destructive animate-ping"
          style={{
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}
        />
      )}
    </div>
  );
}
