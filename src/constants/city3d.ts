// Posições expandidas para cidade hiperrealista estilo Google Maps
export const district3DPositions = {
  // Centro Financeiro - Sistema Bancário (coração da cidade)
  sistema_bancario: { x: 0, y: 0, z: 0 },
  
  // Distrito Norte - Educação Financeira
  educacao_financeira: { x: 150, y: 0, z: -200 },
  
  // Distrito Sul - Renda Variável (Bolsa de Valores)
  renda_variavel: { x: -180, y: 0, z: 250 },
  
  // Distrito Leste - Criptomoedas (Vale do Silício Cripto)
  criptomoedas: { x: 300, y: 0, z: 120 },
  
  // Distrito Oeste - Fundos Imobiliários
  fundos_imobiliarios: { x: -250, y: 0, z: -150 },
  
  // Distrito Nordeste - Mercado Internacional
  mercado_internacional: { x: 200, y: 0, z: -300 },
  
  // Distrito Sudeste - Fintech
  fintech: { x: 280, y: 0, z: 200 },
};

// Configurações da cidade expandida
export const cityConfig = {
  totalSize: 1000, // Tamanho total da cidade
  districtRadius: 50, // Raio de cada distrito
  streetWidth: 8, // Largura das ruas
  blockSize: 40, // Tamanho dos quarteirões
  cameraLimits: {
    min: { x: -500, z: -500 },
    max: { x: 500, z: 500 }
  },
  navigationSpeeds: {
    walk: 1.5,
    fly: 8.0,
    teleport: 0.5 // duração da animação
  }
};