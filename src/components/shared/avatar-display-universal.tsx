import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { resolveAvatarImage, type AvatarData } from "@/lib/avatar-utils";

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

interface AvatarDisplayUniversalProps {
  avatarName?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  nickname: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  // New prop to accept normalized avatar data
  avatarData?: AvatarData;
  // Add onClick support
  onClick?: () => void;
}

const sizeClasses = {
  xs: "h-5 w-5",
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-16 w-16",
  xl: "h-24 w-24"
};

export const AvatarDisplayUniversal = memo(({ 
  avatarName, 
  avatarUrl, 
  profileImageUrl, 
  nickname,
  className = "",
  size = "md",
  avatarData,
  onClick
}: AvatarDisplayUniversalProps) => {
  // Function to resolve avatar URLs to actual imported images
  const resolveAvatarUrl = (url: string): string => {
    // If it's already a full URL (starts with http/https), return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a /avatars/ path, convert to the actual imported image
    if (url.startsWith('/avatars/')) {
      const filename = url.replace('/avatars/', '').replace('.jpg', '');
      const key = filename.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return avatarImages[key] || '/avatars/default-avatar.jpg';
    }
    
    return url;
  };

  const getResolvedAvatar = () => {
    // If avatarData is provided, use the new resolution logic
    if (avatarData) {
      const resolved = resolveAvatarImage(avatarData, nickname);
      return {
        ...resolved,
        imageUrl: resolveAvatarUrl(resolved.imageUrl)
      };
    }

    // Legacy support for existing props - PRIORITIZE profile_image_url first!
    const legacyData: AvatarData = {
      profile_image_url: profileImageUrl,
      current_avatar_id: null,
      avatars: avatarName ? {
        name: avatarName,
        image_url: avatarUrl || ''
      } : undefined
    };

    const resolved = resolveAvatarImage(legacyData, nickname);
    return {
      ...resolved,
      imageUrl: resolveAvatarUrl(resolved.imageUrl)
    };
  };

  const resolved = getResolvedAvatar();

  return (
    <Avatar 
      className={`${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      <AvatarImage 
        src={resolved.imageUrl} 
        alt={nickname}
        onError={(e) => {
          // UNIVERSAL fallback - sempre o mesmo avatar para todos
          e.currentTarget.src = avatarImages['the-satoshi'] || '/avatars/the-satoshi.jpg';
        }}
      />
      <AvatarFallback>
        {resolved.fallbackText}
      </AvatarFallback>
    </Avatar>
  );
});

AvatarDisplayUniversal.displayName = 'AvatarDisplayUniversal';
