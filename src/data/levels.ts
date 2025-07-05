export const levelTiers = [
  { level: 1, name: "Digital Newbie", description: "Seus primeiros passos no mundo financeiro digital" },
  { level: 2, name: "Crypto Rookie", description: "Descobrindo os segredos das criptomoedas" },
  { level: 3, name: "DeFi Explorer", description: "Explorando o universo das finanças descentralizadas" },
  { level: 4, name: "Trading Ninja", description: "Desenvolvendo habilidades furtivas de trading" },
  { level: 5, name: "Finance Hacker", description: "Hackeando o sistema financeiro tradicional" },
  { level: 6, name: "Blockchain Warrior", description: "Lutando nas trincheiras da revolução blockchain" },
  { level: 7, name: "Yield Farmer", description: "Cultivando lucros nas fazendas de rendimento" },
  { level: 8, name: "NFT Collector", description: "Colecionando ativos digitais únicos" },
  { level: 9, name: "Smart Contract Dev", description: "Desenvolvendo contratos inteligentes" },
  { level: 10, name: "Crypto Whale", description: "Movendo oceanos no mercado cripto" },
  { level: 11, name: "DeFi Architect", description: "Construindo o futuro das finanças" },
  { level: 12, name: "Web3 Pioneer", description: "Desbravando a nova internet descentralizada" },
  { level: 13, name: "Metaverse Tycoon", description: "Dominando economias virtuais" },
  { level: 14, name: "DAO Commander", description: "Liderando organizações autônomas" },
  { level: 15, name: "Alpha Hunter", description: "Caçando as melhores oportunidades" },
  { level: 16, name: "Liquidity Lord", description: "Controlando os fluxos de liquidez" },
  { level: 17, name: "Protocol Master", description: "Dominando protocolos complexos" },
  { level: 18, name: "Ecosystem King", description: "Reinando sobre ecossistemas inteiros" },
  { level: 19, name: "Crypto Legend", description: "Lenda viva do mundo cripto" },
  { level: 20, name: "The Satoshi", description: "O mestre supremo das finanças descentralizadas" }
];

export function getLevelInfo(level: number) {
  const tierInfo = levelTiers.find(tier => tier.level === level);
  return tierInfo || { level: 1, name: "Aprendiz das Finanças", description: "Seus primeiros passos no mundo financeiro" };
}