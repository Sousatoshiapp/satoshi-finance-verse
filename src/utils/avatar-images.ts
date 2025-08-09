// Avatar image mapping for static imports - Updated with new cyberpunk 3D NFT avatars
import neoTrader from "@/assets/avatars/neo-trader.jpg";
import cryptoAnalyst from "@/assets/avatars/crypto-analyst.jpg";
import binaryMonk from "@/assets/avatars/binary-monk.jpg";
import financeHacker from "@/assets/avatars/finance-hacker.jpg";
import blockchainGuardian from "@/assets/avatars/blockchain-guardian.jpg";
import investmentScholar from "@/assets/avatars/investment-scholar.jpg";
import dataMiner from "@/assets/avatars/data-miner.jpg";
import cyberMechanic from "@/assets/avatars/cyber-mechanic.jpg";
import neuralArchitect from "@/assets/avatars/neural-architect.jpg";
import codeAssassin from "@/assets/avatars/code-assassin.jpg";
import cryptoShaman from "@/assets/avatars/crypto-shaman.jpg";
import defiSamurai from "@/assets/avatars/defi-samurai.jpg";
import marketProphet from "@/assets/avatars/market-prophet.jpg";
import neonDetective from "@/assets/avatars/neon-detective.jpg";
import digitalNomad from "@/assets/avatars/digital-nomad.jpg";
import ghostTrader from "@/assets/avatars/ghost-trader.jpg";
import hologramDancer from "@/assets/avatars/hologram-dancer.jpg";
import memoryKeeper from "@/assets/avatars/memory-keeper.jpg";
import chromeGladiator from "@/assets/avatars/chrome-gladiator.jpg";
import dreamArchitect from "@/assets/avatars/dream-architect.jpg";
import cosmicOracle from "@/assets/avatars/cosmic-oracle.jpg";
import galaxyCommander from "@/assets/avatars/galaxy-commander.jpg";
import digitalDeity from "@/assets/avatars/digital-deity.jpg";
import infinityGuardian from "@/assets/avatars/infinity-guardian.jpg";
import quantumSage from "@/assets/avatars/quantum-sage.jpg";
import shadowBroker from "@/assets/avatars/shadow-broker.jpg";
import stealthOperative from "@/assets/avatars/stealth-operative.jpg";
import stormRider from "@/assets/avatars/storm-rider.jpg";
import timeWeaver from "@/assets/avatars/time-weaver.jpg";
import voidWalker from "@/assets/avatars/void-walker.jpg";
import plasmaEngineer from "@/assets/avatars/plasma-engineer.jpg";
import protocolSage from "@/assets/avatars/protocol-sage.jpg";
import realityHacker from "@/assets/avatars/reality-hacker.jpg";
import soulTrader from "@/assets/avatars/soul-trader.jpg";
import starlightVoyager from "@/assets/avatars/starlight-voyager.jpg";
import zenMaster from "@/assets/avatars/zen-master.jpg";
import theSatoshi from "@/assets/avatars/the-satoshi.jpg";

export const avatarImages = {
  'neo-trader': neoTrader,
  'crypto-analyst': cryptoAnalyst,
  'binary-monk': binaryMonk,
  'finance-hacker': financeHacker,
  'blockchain-guardian': blockchainGuardian,
  'investment-scholar': investmentScholar,
  'data-miner': dataMiner,
  'cyber-mechanic': cyberMechanic,
  'neural-architect': neuralArchitect,
  'code-assassin': codeAssassin,
  'crypto-shaman': cryptoShaman,
  'defi-samurai': defiSamurai,
  'market-prophet': marketProphet,
  'neon-detective': neonDetective,
  'digital-nomad': digitalNomad,
  'ghost-trader': ghostTrader,
  'hologram-dancer': hologramDancer,
  'memory-keeper': memoryKeeper,
  'chrome-gladiator': chromeGladiator,
  'dream-architect': dreamArchitect,
  'cosmic-oracle': cosmicOracle,
  'galaxy-commander': galaxyCommander,
  'digital-deity': digitalDeity,
  'infinity-guardian': infinityGuardian,
  'quantum-sage': quantumSage,
  'shadow-broker': shadowBroker,
  'stealth-operative': stealthOperative,
  'storm-rider': stormRider,
  'time-weaver': timeWeaver,
  'void-walker': voidWalker,
  'plasma-engineer': plasmaEngineer,
  'protocol-sage': protocolSage,
  'reality-hacker': realityHacker,
  'soul-trader': soulTrader,
  'starlight-voyager': starlightVoyager,
  'zen-master': zenMaster,
  'the-satoshi': theSatoshi,
};

export function getAvatarImage(imageUrl: string): string {
  // Extract filename from URL (e.g., "/avatars/neo-trader.jpg" -> "neo-trader")
  const filename = imageUrl.replace('/avatars/', '').replace('.jpg', '');
  const key = filename as keyof typeof avatarImages;
  
  return avatarImages[key] || theSatoshi; // fallback to the-satoshi
}