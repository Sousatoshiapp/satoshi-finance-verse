import React from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePullIndicatorProps {
  pullDistance: number;
  pullThreshold: number;
  isRefreshing: boolean;
  className?: string;
}

export function MobilePullIndicator({ 
  pullDistance, 
  pullThreshold, 
  isRefreshing,
  className 
}: MobilePullIndicatorProps) {
  const progress = Math.min(pullDistance / pullThreshold, 1);
  const canRefresh = pullDistance > pullThreshold;
  
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div 
      className={cn(
        "flex items-center justify-center py-4 transition-all duration-300",
        "bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm",
        className
      )}
      style={{
        transform: `translateY(${Math.min(pullDistance - 20, 40)}px)`,
        opacity: isRefreshing ? 1 : progress
      }}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className={cn(
          "relative transition-all duration-200",
          isRefreshing && "animate-spin"
        )}>
          {isRefreshing ? (
            <RefreshCw className="h-6 w-6 text-primary" />
          ) : (
            <ChevronDown 
              className={cn(
                "h-6 w-6 transition-all duration-200",
                canRefresh ? "text-primary rotate-180" : "text-muted-foreground"
              )}
            />
          )}
        </div>
        
        <div className="flex flex-col items-center">
          <p className={cn(
            "text-xs font-medium transition-colors duration-200",
            canRefresh || isRefreshing ? "text-primary" : "text-muted-foreground"
          )}>
            {isRefreshing 
              ? "Atualizando..." 
              : canRefresh 
                ? "Solte para atualizar" 
                : "Puxe para atualizar"
            }
          </p>
          
          {!isRefreshing && (
            <div className="w-16 h-1 bg-muted/30 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-100 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}