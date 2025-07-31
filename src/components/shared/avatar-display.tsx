import { Badge } from "@/components/shared/ui/badge";
import { Sparkles } from "lucide-react";
import { memo, useMemo } from "react";

// Import avatar images
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

const avatarImages = {
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

const rarityColors = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500',
};

const AvatarDisplay = memo(function AvatarDisplay({ avatar, size = 'md', showBadge = true, evolutionLevel = 1 }: AvatarDisplayProps) {
  // Memoize expensive calculations
  const avatarImage = useMemo(() => {
    const key = avatar.name.toLowerCase().replace(' ', '-') as keyof typeof avatarImages;
    return avatarImages[key] || avatar.image_url;
  }, [avatar.name, avatar.image_url]);

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
          className="w-full h-full object-cover animate-pulse-subtle"
          loading="lazy"
        />
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

export { AvatarDisplay };
