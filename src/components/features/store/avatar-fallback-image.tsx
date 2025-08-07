import { Crown, Star, Gem, Zap, Infinity, Eye, Sparkles } from "lucide-react";

interface AvatarFallbackImageProps {
  name: string;
  rarity: string;
  price: number;
  className?: string;
}

export function AvatarFallbackImage({ name, rarity, price, className = "" }: AvatarFallbackImageProps) {
  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gradient-to-br from-gray-400 to-gray-600';
      case 'rare': return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 'epic': return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'legendary': return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      case 'mythic': return 'bg-gradient-to-br from-orange-400 to-red-500';
      case 'cosmic': return 'bg-gradient-to-br from-cyan-400 to-blue-500';
      case 'divine': return 'bg-gradient-to-br from-pink-400 to-purple-500';
      case 'transcendent': return 'bg-gradient-to-br from-purple-400 via-pink-500 to-gold-400';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  };

  const getRarityIcon = (rarity: string) => {
    const iconClass = "w-8 h-8 text-white drop-shadow-lg";
    switch (rarity) {
      case 'common': return <div className="w-6 h-6 rounded-full bg-white/80" />;
      case 'rare': return <Star className={iconClass} />;
      case 'epic': return <Gem className={iconClass} />;
      case 'legendary': return <Crown className={iconClass} />;
      case 'mythic': return <Zap className={iconClass} />;
      case 'cosmic': return <Infinity className={iconClass} />;
      case 'divine': return <Eye className={iconClass} />;
      case 'transcendent': return <Sparkles className={iconClass} />;
      default: return <div className="w-6 h-6 rounded-full bg-white/80" />;
    }
  };

  const getAvatarInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const isPremium = price >= 1000;

  return (
    <div className={`aspect-square ${getRarityGradient(rarity)} flex flex-col items-center justify-center relative rounded-lg overflow-hidden ${className}`}>
      {/* Background Pattern for Premium Avatars */}
      {isPremium && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(255,255,255,0.1)_100%)]" />
      )}
      
      {/* Avatar Letter */}
      <div className="text-white text-3xl font-bold mb-2 drop-shadow-lg z-10">
        {getAvatarInitial(name)}
      </div>
      
      {/* Rarity Icon */}
      <div className="z-10">
        {getRarityIcon(rarity)}
      </div>
      
      {/* Premium Border Effect */}
      {isPremium && (
        <div className="absolute inset-0 border-2 border-white/20 rounded-lg animate-pulse" />
      )}
      
      {/* Transcendent Special Effect */}
      {rarity === 'transcendent' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      )}
    </div>
  );
}