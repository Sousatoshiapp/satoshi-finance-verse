// Lazy import utility for better tree shaking
export const dynamicImport = (importFn: () => Promise<any>) => {
  return importFn();
};

// Avatar images lazy loading
export const loadAvatarImage = async (avatarName: string): Promise<string> => {
  const avatarMap: Record<string, () => Promise<{ default: string }>> = {
    'neo-trader': () => import('@/assets/avatars/neo-trader.jpg'),
    'crypto-analyst': () => import('@/assets/avatars/crypto-analyst.jpg'),
    'finance-hacker': () => import('@/assets/avatars/finance-hacker.jpg'),
    'investment-scholar': () => import('@/assets/avatars/investment-scholar.jpg'),
    'quantum-broker': () => import('@/assets/avatars/quantum-broker.jpg'),
    'defi-samurai': () => import('@/assets/avatars/defi-samurai.jpg'),
    'the-satoshi': () => import('@/assets/avatars/the-satoshi.jpg'),
    'neural-architect': () => import('@/assets/avatars/neural-architect.jpg'),
    'data-miner': () => import('@/assets/avatars/data-miner.jpg'),
    'blockchain-guardian': () => import('@/assets/avatars/blockchain-guardian.jpg'),
    'quantum-physician': () => import('@/assets/avatars/quantum-physician.jpg'),
    'virtual-realtor': () => import('@/assets/avatars/virtual-realtor.jpg'),
    'code-assassin': () => import('@/assets/avatars/code-assassin.jpg'),
    'crypto-shaman': () => import('@/assets/avatars/crypto-shaman.jpg'),
    'market-prophet': () => import('@/assets/avatars/market-prophet.jpg'),
    'digital-nomad': () => import('@/assets/avatars/digital-nomad.jpg'),
    'neon-detective': () => import('@/assets/avatars/neon-detective.jpg'),
    'hologram-dancer': () => import('@/assets/avatars/hologram-dancer.jpg'),
    'cyber-mechanic': () => import('@/assets/avatars/cyber-mechanic.jpg'),
    'ghost-trader': () => import('@/assets/avatars/ghost-trader.jpg'),
    'binary-monk': () => import('@/assets/avatars/binary-monk.jpg'),
    'pixel-artist': () => import('@/assets/avatars/pixel-artist.jpg'),
    'quantum-thief': () => import('@/assets/avatars/quantum-thief.jpg'),
    'memory-keeper': () => import('@/assets/avatars/memory-keeper.jpg'),
    'storm-hacker': () => import('@/assets/avatars/storm-hacker.jpg'),
    'dream-architect': () => import('@/assets/avatars/dream-architect.jpg'),
    'chrome-gladiator': () => import('@/assets/avatars/chrome-gladiator.jpg'),
  };

  const importFn = avatarMap[avatarName];
  if (importFn) {
    const module = await importFn();
    return module.default;
  }
  
  return ''; // Fallback
};

// Lucide icons - only import what's needed
export const importLucideIcon = (iconName: string) => {
  const iconMap: Record<string, () => Promise<any>> = {
    Sparkles: () => import('lucide-react').then(m => ({ default: m.Sparkles })),
    Trophy: () => import('lucide-react').then(m => ({ default: m.Trophy })),
    Target: () => import('lucide-react').then(m => ({ default: m.Target })),
    TrendingUp: () => import('lucide-react').then(m => ({ default: m.TrendingUp })),
    Gamepad2: () => import('lucide-react').then(m => ({ default: m.Gamepad2 })),
    Users: () => import('lucide-react').then(m => ({ default: m.Users })),
    BookOpen: () => import('lucide-react').then(m => ({ default: m.BookOpen })),
    Zap: () => import('lucide-react').then(m => ({ default: m.Zap })),
  };

  return iconMap[iconName]?.();
};