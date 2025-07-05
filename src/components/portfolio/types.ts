export interface Portfolio {
  id?: string;
  name: string;
  description: string;
  is_public: boolean;
  district_theme?: string;
  initial_balance: number;
  current_balance: number;
  performance_percentage: number;
}

export interface Holding {
  id?: string;
  asset_symbol: string;
  asset_name: string;
  asset_type: string;
  quantity: number;
  avg_price: number;
  current_price?: number;
  total_value?: number;
}

export const assetTypes = [
  { value: 'stock', label: 'Ações' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'fund', label: 'Fundos' },
  { value: 'bond', label: 'Renda Fixa' }
];

export const mockAssets = {
  stock: [
    { symbol: 'PETR4', name: 'Petrobras PN', price: 32.45 },
    { symbol: 'VALE3', name: 'Vale ON', price: 65.20 },
    { symbol: 'ITUB4', name: 'Itaú Unibanco PN', price: 28.90 },
    { symbol: 'BBDC4', name: 'Bradesco PN', price: 15.75 }
  ],
  crypto: [
    { symbol: 'BTC', name: 'Bitcoin', price: 65000.00 },
    { symbol: 'ETH', name: 'Ethereum', price: 3200.00 },
    { symbol: 'ADA', name: 'Cardano', price: 0.45 },
    { symbol: 'SOL', name: 'Solana', price: 145.00 }
  ],
  fund: [
    { symbol: 'HGLG11', name: 'CSHG Logística FII', price: 145.50 },
    { symbol: 'XPML11', name: 'XP Malls FII', price: 95.20 },
    { symbol: 'KNRI11', name: 'Kinea Renda Imobiliária FII', price: 85.40 }
  ],
  bond: [
    { symbol: 'SELIC', name: 'Tesouro Selic', price: 100.00 },
    { symbol: 'IPCA+', name: 'Tesouro IPCA+', price: 95.50 },
    { symbol: 'PRE', name: 'Tesouro Prefixado', price: 92.30 }
  ]
};