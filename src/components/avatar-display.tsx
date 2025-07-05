import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

// Import avatar images
import neoTrader from "@/assets/avatars/neo-trader.jpg";
import cryptoAnalyst from "@/assets/avatars/crypto-analyst.jpg";
import financeHacker from "@/assets/avatars/finance-hacker.jpg";
import investmentScholar from "@/assets/avatars/investment-scholar.jpg";

interface Avatar {
  id: string;
  name: string;
  description: string;
  image_url: string;
  avatar_class: string;
  district_theme: string;
  rarity: string;
  evolution_level?: number;
}

interface AvatarDisplayProps {
  avatar: Avatar;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  evolutionLevel?: number;
}

const avatarImages = {
  'neo-trader': neoTrader,
  'crypto-analyst': cryptoAnalyst,
  'finance-hacker': financeHacker,
  'investment-scholar': investmentScholar,
};

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500',
};

export function AvatarDisplay({ avatar, size = 'md', showBadge = true, evolutionLevel = 1 }: AvatarDisplayProps) {
  const getAvatarImage = () => {
    const key = avatar.name.toLowerCase().replace(' ', '-') as keyof typeof avatarImages;
    return avatarImages[key] || avatar.image_url;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-12 h-12';
      case 'lg': return 'w-24 h-24';
      default: return 'w-16 h-16';
    }
  };

  const getRarityColor = () => {
    return rarityColors[avatar.rarity as keyof typeof rarityColors] || rarityColors.common;
  };

  return (
    <div className="relative">
      <div className={`${getSizeClasses()} rounded-full overflow-hidden border-2 border-primary/50 shadow-lg`}>
        <img 
          src={getAvatarImage()}
          alt={avatar.name}
          className="w-full h-full object-cover animate-pulse-subtle"
        />
      </div>
      
      {showBadge && (
        <div className="absolute -top-1 -right-1">
          <Badge className={`${getRarityColor()} text-white flex items-center gap-1 text-xs px-1`}>
            <Sparkles className="h-3 w-3" />
            {evolutionLevel}
          </Badge>
        </div>
      )}
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 -z-10 animate-pulse"
        style={{
          boxShadow: `0 0 20px var(--primary)`,
        }}
      />
    </div>
  );
}