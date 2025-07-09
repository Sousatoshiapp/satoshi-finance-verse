import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  // Also map common name variations
  'Neo Trader': neoTrader,
  'Crypto Analyst': cryptoAnalyst,
  'Finance Hacker': financeHacker,
  'Investment Scholar': investmentScholar,
  'Quantum Broker': quantumBroker,
  'DeFi Samurai': defiSamurai,
  'The Satoshi': theSatoshi,
  'Neural Architect': neuralArchitect,
  'Data Miner': dataMiner,
  'Blockchain Guardian': blockchainGuardian,
  'Quantum Physician': quantumPhysician,
  'Virtual Realtor': virtualRealtor,
  'Code Assassin': codeAssassin,
  'Crypto Shaman': cryptoShaman,
  'Market Prophet': marketProphet,
  'Digital Nomad': digitalNomad,
  'Neon Detective': neonDetective,
  'Hologram Dancer': hologramDancer,
  'Cyber Mechanic': cyberMechanic,
  'Ghost Trader': ghostTrader,
  'Binary Monk': binaryMonk,
  'Pixel Artist': pixelArtist,
  'Quantum Thief': quantumThief,
  'Memory Keeper': memoryKeeper,
  'Storm Hacker': stormHacker,
  'Dream Architect': dreamArchitect,
  'Chrome Gladiator': chromeGladiator,
};

interface AvatarDisplayUniversalProps {
  avatarName?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  nickname: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
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
  size = "md"
}: AvatarDisplayUniversalProps) => {
  const getAvatarImage = () => {
    // Try profile image URL first (uploaded images)
    if (profileImageUrl) return profileImageUrl;
    
    // Try avatar URL (if it's a proper URL)
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
      return avatarUrl;
    }
    
    // Try to map avatar name to local image
    if (avatarName) {
      // Try exact match first
      let normalizedName = avatarName.toLowerCase().replace(/\s+/g, '-');
      let avatarImage = avatarImages[normalizedName as keyof typeof avatarImages];
      
      // If no exact match, try variations
      if (!avatarImage) {
        // Try with different normalizations
        normalizedName = avatarName.toLowerCase().replace(/[\s_]+/g, '-');
        avatarImage = avatarImages[normalizedName as keyof typeof avatarImages];
      }
      
      if (avatarImage) {
        return avatarImage;
      }
    }
    
    // Fallback to default
    return theSatoshi;
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={getAvatarImage()} 
        alt={nickname}
        onError={(e) => {
          console.log('Avatar image failed to load:', e.currentTarget.src);
          e.currentTarget.src = theSatoshi;
        }}
      />
      <AvatarFallback>
        {nickname.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
});

AvatarDisplayUniversal.displayName = 'AvatarDisplayUniversal';