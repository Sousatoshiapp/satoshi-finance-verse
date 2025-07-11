import React, { createContext, useContext, ReactNode } from 'react';

interface SponsorTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  actionThemes: {
    quiz: { name: string; icon: string; description: string };
    account: { name: string; icon: string; description: string };
    access: { name: string; icon: string; description: string };
    members: { name: string; icon: string; description: string };
    duels: { name: string; icon: string; description: string };
    store: { name: string; icon: string; description: string };
  };
}

const sponsorThemes: Record<string, SponsorTheme> = {
  renda_variavel: {
    name: 'XP Investimentos',
    primaryColor: 'hsl(142, 76%, 36%)', // Verde XP
    secondaryColor: 'hsl(220, 13%, 18%)', // Cinza escuro
    accentColor: 'hsl(142, 76%, 46%)', // Verde claro
    logoUrl: '/assets/districts/xp-investimentos-logo.jpg',
    actionThemes: {
      quiz: { name: 'Radar XP', icon: 'target', description: 'Teste seus conhecimentos em investimentos' },
      account: { name: 'Portal de Entrada', icon: 'door-open', description: 'Acesse sua conta XP' },
      access: { name: 'Núcleo XP', icon: 'building', description: 'Central de comando' },
      members: { name: 'Elite XP', icon: 'crown', description: 'Comunidade exclusiva' },
      duels: { name: 'Arena de Trading', icon: 'sword', description: 'Batalhas de conhecimento' },
      store: { name: 'Loja XP', icon: 'shopping-bag', description: 'Produtos exclusivos' }
    }
  },
  educacao_financeira: {
    name: 'Ânima Educação',
    primaryColor: 'hsl(24, 95%, 53%)', // Laranja Ânima
    secondaryColor: 'hsl(259, 94%, 51%)', // Roxo Ânima
    accentColor: 'hsl(24, 95%, 63%)', // Laranja claro
    logoUrl: '/assets/districts/anima-educacao-logo.jpg',
    actionThemes: {
      quiz: { name: 'Academia Ânima', icon: 'graduation-cap', description: 'Teste seu aprendizado' },
      account: { name: 'Portal Estudantil', icon: 'book-open', description: 'Acesse sua conta acadêmica' },
      access: { name: 'Campus Digital', icon: 'school', description: 'Centro de estudos' },
      members: { name: 'Turma Elite', icon: 'users', description: 'Comunidade acadêmica' },
      duels: { name: 'Olimpíada Financeira', icon: 'trophy', description: 'Competições educativas' },
      store: { name: 'Livraria Ânima', icon: 'book', description: 'Materiais de estudo' }
    }
  },
  criptomoedas: {
    name: 'Cripto Valley',
    primaryColor: 'hsl(43, 74%, 49%)', // Dourado Bitcoin
    secondaryColor: 'hsl(220, 13%, 18%)', // Preto tech
    accentColor: 'hsl(43, 84%, 59%)', // Dourado claro
    logoUrl: '/assets/districts/cripto-valley-logo.jpg',
    actionThemes: {
      quiz: { name: 'Mining Quiz', icon: 'cpu', description: 'Teste seus conhecimentos crypto' },
      account: { name: 'Wallet Connect', icon: 'key', description: 'Conecte sua carteira' },
      access: { name: 'Blockchain Hub', icon: 'link', description: 'Centro da blockchain' },
      members: { name: 'Crypto Elite', icon: 'diamond', description: 'Holders exclusivos' },
      duels: { name: 'Hash Wars', icon: 'zap', description: 'Batalhas crypto' },
      store: { name: 'NFT Market', icon: 'image', description: 'Marketplace NFT' }
    }
  },
  sistema_bancario: {
    name: 'Sistema Bancário',
    primaryColor: 'hsl(220, 50%, 47%)', // Azul bancário
    secondaryColor: 'hsl(210, 11%, 15%)', // Cinza metálico
    accentColor: 'hsl(220, 60%, 57%)', // Azul claro
    logoUrl: '/assets/districts/banking-sector-logo.jpg',
    actionThemes: {
      quiz: { name: 'Financial Test', icon: 'calculator', description: 'Avalie seus conhecimentos bancários' },
      account: { name: 'Banking Portal', icon: 'credit-card', description: 'Acesso seguro' },
      access: { name: 'Treasury Center', icon: 'vault', description: 'Centro do tesouro' },
      members: { name: 'VIP Banking', icon: 'shield', description: 'Clientes premium' },
      duels: { name: 'Finance Arena', icon: 'trending-up', description: 'Competições financeiras' },
      store: { name: 'Banking Store', icon: 'piggy-bank', description: 'Produtos bancários' }
    }
  },
  fundos_imobiliarios: {
    name: 'Real Estate',
    primaryColor: 'hsl(142, 69%, 58%)', // Verde imobiliário
    secondaryColor: 'hsl(30, 25%, 35%)', // Marrom terra
    accentColor: 'hsl(142, 79%, 68%)', // Verde claro
    logoUrl: '/assets/districts/real-estate-logo.jpg',
    actionThemes: {
      quiz: { name: 'Property Quiz', icon: 'home', description: 'Teste seus conhecimentos imobiliários' },
      account: { name: 'Real Estate Portal', icon: 'key-round', description: 'Portal de imóveis' },
      access: { name: 'Investment Hub', icon: 'building-2', description: 'Central de investimentos' },
      members: { name: 'Investors Club', icon: 'handshake', description: 'Clube de investidores' },
      duels: { name: 'Property Wars', icon: 'map-pin', description: 'Batalhas imobiliárias' },
      store: { name: 'RE Market', icon: 'landmark', description: 'Marketplace imobiliário' }
    }
  },
  mercado_internacional: {
    name: 'Global Trade',
    primaryColor: 'hsl(220, 70%, 50%)', // Azul internacional
    secondaryColor: 'hsl(0, 0%, 100%)', // Branco
    accentColor: 'hsl(220, 80%, 60%)', // Azul claro
    logoUrl: '/assets/districts/international-trade-logo.jpg',
    actionThemes: {
      quiz: { name: 'Global Quiz', icon: 'globe', description: 'Teste conhecimentos globais' },
      account: { name: 'Trade Portal', icon: 'plane', description: 'Portal de comércio' },
      access: { name: 'Global Hub', icon: 'earth', description: 'Centro global' },
      members: { name: 'Traders Elite', icon: 'users-2', description: 'Traders internacionais' },
      duels: { name: 'World Arena', icon: 'flag', description: 'Arena mundial' },
      store: { name: 'Global Store', icon: 'ship', description: 'Mercado global' }
    }
  },
  fintech: {
    name: 'Fintech Valley',
    primaryColor: 'hsl(271, 81%, 56%)', // Roxo tech
    secondaryColor: 'hsl(142, 76%, 36%)', // Verde neon
    accentColor: 'hsl(271, 91%, 66%)', // Roxo claro
    logoUrl: '/assets/districts/tech-finance-logo.jpg',
    actionThemes: {
      quiz: { name: 'Tech Quiz', icon: 'smartphone', description: 'Teste tech e fintech' },
      account: { name: 'App Connect', icon: 'monitor', description: 'Conecte-se ao app' },
      access: { name: 'Innovation Lab', icon: 'beaker', description: 'Laboratório de inovação' },
      members: { name: 'Tech Elite', icon: 'rocket', description: 'Inovadores tech' },
      duels: { name: 'Code Arena', icon: 'code', description: 'Batalhas de código' },
      store: { name: 'Tech Market', icon: 'circuit-board', description: 'Loja de tecnologia' }
    }
  }
};

interface SponsorThemeContextType {
  getTheme: (districtTheme: string) => SponsorTheme;
}

const SponsorThemeContext = createContext<SponsorThemeContextType | undefined>(undefined);

export const SponsorThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getTheme = (districtTheme: string): SponsorTheme => {
    return sponsorThemes[districtTheme] || sponsorThemes.sistema_bancario;
  };

  return (
    <SponsorThemeContext.Provider value={{ getTheme }}>
      {children}
    </SponsorThemeContext.Provider>
  );
};

export const useSponsorTheme = () => {
  const context = useContext(SponsorThemeContext);
  if (context === undefined) {
    throw new Error('useSponsorTheme must be used within a SponsorThemeProvider');
  }
  return context;
};