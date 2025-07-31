import { Badge } from "@/components/shared/ui/badge";
import { Star, Crown } from "lucide-react";

interface SubscriptionIndicatorProps {
  tier: 'free' | 'pro' | 'elite';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function SubscriptionIndicator({ tier, size = 'sm', showText = false }: SubscriptionIndicatorProps) {
  if (tier === 'free') return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  if (tier === 'pro') {
    return (
      <Badge 
        className={`bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 ${sizeClasses[size]} flex items-center gap-1`}
      >
        <Star className={iconSize[size]} fill="currentColor" />
        {showText && "PRO"}
      </Badge>
    );
  }

  if (tier === 'elite') {
    return (
      <Badge 
        className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 ${sizeClasses[size]} flex items-center gap-1 animate-pulse`}
        style={{ 
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' 
        }}
      >
        <Crown className={iconSize[size]} fill="currentColor" />
        {showText && "ELITE"}
      </Badge>
    );
  }

  return null;
}
