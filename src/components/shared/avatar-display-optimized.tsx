import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { memo, useMemo, useState, useEffect } from "react";

// Import all avatar images directly
import neoTrader from "@/assets/avatars/neo-trader.jpg";
import cryptoAnalyst from "@/assets/avatars/crypto-analyst.jpg";
import financeHacker from "@/assets/avatars/finance-hacker.jpg";
import investmentScholar from "@/assets/avatars/investment-scholar.jpg";
import quantumBroker from "@/assets/avatars/quantum-broker.jpg";
import defiSamurai from "@/assets/avatars/defi-samurai.jpg";
import theSatoshi from "@/assets/avatars/the-satoshi.jpg";
import neuralArchitect from "@/assets/avatars/neural-architect.jpg";
import dataMiner from "@/assets/avatars/data-miner.jpg";
import blockchainGuardian from "@/assets/avatars/blockchain-guardian.jpg";
import quantumPhysician from "@/assets/avatars/quantum-physician.jpg";
import virtualRealtor from "@/assets/avatars/virtual-realtor.jpg";
import codeAssassin from "@/assets/avatars/code-assassin.jpg";
import cryptoShaman from "@/assets/avatars/crypto-shaman.jpg";
import marketProphet from "@/assets/avatars/market-prophet.jpg";
import digitalNomad from "@/assets/avatars/digital-nomad.jpg";
import neonDetective from "@/assets/avatars/neon-detective.jpg";
import hologramDancer from "@/assets/avatars/hologram-dancer.jpg";
import cyberMechanic from "@/assets/avatars/cyber-mechanic.jpg";
import ghostTrader from "@/assets/avatars/ghost-trader.jpg";
import binaryMonk from "@/assets/avatars/binary-monk.jpg";
import pixelArtist from "@/assets/avatars/pixel-artist.jpg";
import quantumThief from "@/assets/avatars/quantum-thief.jpg";
import memoryKeeper from "@/assets/avatars/memory-keeper.jpg";
import stormHacker from "@/assets/avatars/storm-hacker.jpg";
import dreamArchitect from "@/assets/avatars/dream-architect.jpg";
import chromeGladiator from "@/assets/avatars/chrome-gladiator.jpg";

const avatarImages: Record<string, string> = {
  'neo-trader': neoTrader,
  'crypto-analyst': cryptoAnalyst,
  'finance-hacker': financeHacker,
  'investment-scholar': investmentScholar,
  'quantum-broker': quantumBroker,
  'defi-samurai': defiSamurai,
  'the-satoshi': theSatoshi,
  'neural-architect': neuralArchitect,
  'data-miner': dataMiner,
  'blockchain-guardian': blockchainGuardian,
  'quantum-physician': quantumPhysician,
  'virtual-realtor': virtualRealtor,
  'code-assassin': codeAssassin,
  'crypto-shaman': cryptoShaman,
  'market-prophet': marketProphet,
  'digital-nomad': digitalNomad,
  'neon-detective': neonDetective,
  'hologram-dancer': hologramDancer,
  'cyber-mechanic': cyberMechanic,
  'ghost-trader': ghostTrader,
  'binary-monk': binaryMonk,
  'pixel-artist': pixelArtist,
  'quantum-thief': quantumThief,
  'memory-keeper': memoryKeeper,
  'storm-hacker': stormHacker,
  'dream-architect': dreamArchitect,
  'chrome-gladiator': chromeGladiator,
};

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
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  evolutionLevel?: number;
}

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500',
};

const AvatarDisplayOptimized = memo(function AvatarDisplayOptimized({ 
  avatar, 
  size = 'md', 
  showBadge = true, 
  evolutionLevel = 1 
}: AvatarDisplayProps) {
  // Convert avatar name to kebab-case for image lookup
  const getAvatarImage = (avatar: Avatar) => {
    const key = avatar.name.toLowerCase().replace(/\s+/g, '-');
    return avatarImages[key] || avatarImages['finance-hacker']; // Default fallback
  };

  const [avatarImage, setAvatarImage] = useState<string>(getAvatarImage(avatar));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Update image when avatar changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setAvatarImage(getAvatarImage(avatar));
  }, [avatar]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm': return 'w-12 h-12';
      case 'lg': return 'w-24 h-24';
      case 'xl': return 'w-48 h-48';
      default: return 'w-16 h-16';
    }
  }, [size]);

  const rarityColor = useMemo(() => {
    return rarityColors[avatar.rarity as keyof typeof rarityColors] || rarityColors.common;
  }, [avatar.rarity]);

  return (
    <div className="relative">
      <div className={`${sizeClasses} rounded-full overflow-hidden border-2 border-primary/50 shadow-lg`}>
        <img 
          src={avatarImage}
          alt={avatar.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {avatar.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {showBadge && (
        <div className="absolute -top-1 -right-1">
          <Badge className={`${rarityColor} text-white flex items-center gap-1 text-xs px-1`}>
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
});

export { AvatarDisplayOptimized };