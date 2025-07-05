export const levelTiers = [
  { level: 1, name: "Aprendiz das Finanças", description: "Seus primeiros passos no mundo financeiro" },
  { level: 2, name: "Explorador Digital", description: "Descobrindo os segredos do dinheiro digital" },
  { level: 3, name: "Noviço Cripto", description: "Iniciando na era das criptomoedas" },
  { level: 4, name: "Caçador de Lucros", description: "Buscando as melhores oportunidades" },
  { level: 5, name: "Guardião dos Ativos", description: "Protegendo e multiplicando patrimônio" },
  { level: 6, name: "Navegador DeFi", description: "Explorando as finanças descentralizadas" },
  { level: 7, name: "Minerador de Dados", description: "Extraindo insights valiosos do mercado" },
  { level: 8, name: "Hacker Financeiro", description: "Dominando estratégias avançadas" },
  { level: 9, name: "Arquiteto Blockchain", description: "Construindo o futuro das finanças" },
  { level: 10, name: "Samurai dos Dividendos", description: "Mestre da renda passiva" },
  { level: 11, name: "Oráculo do Mercado", description: "Prevendo tendências com sabedoria" },
  { level: 12, name: "Phantom Trader", description: "Movendo-se nas sombras do mercado" },
  { level: 13, name: "Cyber Investidor", description: "Fusão perfeita de tecnologia e finanças" },
  { level: 14, name: "Neo Capitalista", description: "Redefinindo as regras do jogo" },
  { level: 15, name: "Lorde das Carteiras", description: "Comandando múltiplos portfólios" },
  { level: 16, name: "Gladiador Financeiro", description: "Lutando nas arenas do mercado" },
  { level: 17, name: "Profeta Quântico", description: "Visionário das finanças quânticas" },
  { level: 18, name: "Imperador Cripto", description: "Reinando sobre o império digital" },
  { level: 19, name: "Mestre Supremo", description: "Atingindo a iluminação financeira" },
  { level: 20, name: "O Satoshi", description: "Lenda viva das finanças descentralizadas" }
];

export function getLevelInfo(level: number) {
  const tierInfo = levelTiers.find(tier => tier.level === level);
  return tierInfo || { level: 1, name: "Aprendiz das Finanças", description: "Seus primeiros passos no mundo financeiro" };
}