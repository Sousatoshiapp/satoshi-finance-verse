// FASE 2: BTZ Counter Ultra-Light - Versão mínima apenas com valor
import React, { memo } from 'react';

interface UltraBTZCounterProps {
  points: number;
  level: number;
}

// Ultra-minimalist BTZ counter - no animations, no timers, just value
const UltraBTZCounter = memo(({ points, level }: UltraBTZCounterProps) => {
  return (
    <div className="p-4 bg-gradient-to-r from-card to-muted/50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">BTZ Balance</p>
          <p className="text-2xl font-bold text-foreground">
            {points.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Level {level} • 0.1% daily yield
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
          ₿
        </div>
      </div>
    </div>
  );
});

UltraBTZCounter.displayName = 'UltraBTZCounter';

export { UltraBTZCounter };