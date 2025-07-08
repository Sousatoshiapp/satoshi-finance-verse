// Bundle Splitter Avançado para otimização de carregamento
export class BundleSplitter {
  private static instance: BundleSplitter;
  private loadedChunks = new Set<string>();
  private chunkCache = new Map<string, any>();
  private vendorModules = new Set<string>();

  static getInstance(): BundleSplitter {
    if (!BundleSplitter.instance) {
      BundleSplitter.instance = new BundleSplitter();
    }
    return BundleSplitter.instance;
  }

  constructor() {
    this.initVendorModules();
    this.setupChunkPreloading();
  }

  // Definir módulos vendor para splitting
  private initVendorModules() {
    this.vendorModules = new Set([
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      '@radix-ui',
      'recharts',
      'date-fns'
    ]);
  }

  // Configurar preloading inteligente de chunks
  private setupChunkPreloading() {
    // Detectar chunks via network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const url = args[0] as string;
      
      // Detectar chunks JavaScript
      if (url.includes('.js') && url.includes('chunk')) {
        this.trackChunkLoad(url);
      }
      
      return response;
    };
  }

  // Rastrear carregamento de chunks
  private trackChunkLoad(chunkUrl: string) {
    const chunkId = this.extractChunkId(chunkUrl);
    this.loadedChunks.add(chunkId);
    
    console.log(`[Bundle] Chunk loaded: ${chunkId}`);
  }

  // Extrair ID do chunk da URL
  private extractChunkId(url: string): string {
    const match = url.match(/chunk-([A-Za-z0-9]+)/);
    return match ? match[1] : url;
  }

  // Preload chunks baseado na rota
  async preloadChunksForRoute(route: string) {
    const routeChunkMap: Record<string, string[]> = {
      '/dashboard': ['dashboard', 'charts', 'leaderboard'],
      '/quiz': ['quiz-engine', 'questions', 'results'],
      '/duels': ['duel-system', 'real-time', 'matchmaking'],
      '/social': ['social-feed', 'chat', 'notifications'],
      '/trading': ['trading-interface', 'charts', 'portfolio'],
      '/admin': ['admin-dashboard', 'user-management', 'analytics']
    };

    const chunks = routeChunkMap[route] || [];
    
    for (const chunk of chunks) {
      if (!this.loadedChunks.has(chunk)) {
        await this.preloadChunk(chunk);
      }
    }
  }

  // Preload chunk específico
  private async preloadChunk(chunkId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = `/src/chunks/${chunkId}.js`;
      
      link.onload = () => {
        this.loadedChunks.add(chunkId);
        console.log(`[Bundle] Preloaded chunk: ${chunkId}`);
        resolve();
      };
      
      link.onerror = () => {
        console.warn(`[Bundle] Failed to preload chunk: ${chunkId}`);
        reject(new Error(`Chunk preload failed: ${chunkId}`));
      };
      
      document.head.appendChild(link);
    });
  }

  // Lazy load de módulos específicos
  async loadModule<T>(modulePath: string): Promise<T> {
    if (this.chunkCache.has(modulePath)) {
      return this.chunkCache.get(modulePath);
    }

    try {
      const module = await import(modulePath);
      this.chunkCache.set(modulePath, module);
      return module;
    } catch (error) {
      console.error(`[Bundle] Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  // Dynamic import com retry
  async dynamicImport<T>(
    importFn: () => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        console.warn(`[Bundle] Import attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Delay exponencial
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
    
    throw new Error('Max retry attempts reached');
  }

  // Otimização de vendor chunks
  optimizeVendorChunks() {
    // Detectar vendor modules carregados
    const vendorChunks = Array.from(this.loadedChunks).filter(chunk =>
      Array.from(this.vendorModules).some(vendor => chunk.includes(vendor))
    );

    console.log(`[Bundle] Vendor chunks detected: ${vendorChunks.length}`);
    
    // Preload vendor chunks críticos
    this.preloadCriticalVendors();
  }

  // Preload vendors críticos
  private async preloadCriticalVendors() {
    const criticalVendors = [
      'react',
      'react-dom',
      '@tanstack/react-query'
    ];

    for (const vendor of criticalVendors) {
      if (this.vendorModules.has(vendor)) {
        try {
          await this.preloadChunk(`vendor-${vendor}`);
        } catch (error) {
          console.warn(`[Bundle] Failed to preload vendor: ${vendor}`, error);
        }
      }
    }
  }

  // Tree shaking monitoring
  monitorTreeShaking() {
    // Detectar módulos não utilizados
    const unusedModules = new Set<string>();
    
    // Analisar imports via performance API
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') && resource.transferSize === 0) {
          const moduleName = this.extractModuleName(resource.name);
          unusedModules.add(moduleName);
        }
      });
    }

    if (unusedModules.size > 0) {
      console.warn('[Bundle] Unused modules detected:', Array.from(unusedModules));
    }
  }

  // Extrair nome do módulo da URL
  private extractModuleName(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.[^/.]+$/, ''); // Remove extensão
  }

  // Cleanup de chunks não utilizados
  cleanupUnusedChunks() {
    const allChunks = Array.from(this.loadedChunks);
    const currentRoute = window.location.pathname;
    
    // Determinar chunks necessários para rota atual
    const necessaryChunks = this.getChunksForRoute(currentRoute);
    
    allChunks.forEach(chunk => {
      if (!necessaryChunks.includes(chunk)) {
        // Remover do cache se não necessário
        this.chunkCache.delete(chunk);
        this.loadedChunks.delete(chunk);
      }
    });
  }

  // Obter chunks necessários para rota
  private getChunksForRoute(route: string): string[] {
    const routeChunkMap: Record<string, string[]> = {
      '/dashboard': ['dashboard', 'charts', 'leaderboard', 'vendor-react'],
      '/quiz': ['quiz-engine', 'questions', 'vendor-react'],
      '/duels': ['duel-system', 'real-time', 'vendor-react'],
      '/social': ['social-feed', 'chat', 'vendor-react'],
      '/trading': ['trading-interface', 'charts', 'vendor-recharts'],
      '/admin': ['admin-dashboard', 'analytics', 'vendor-react']
    };

    return routeChunkMap[route] || ['vendor-react'];
  }

  // Análise de performance de bundles
  analyzePerformance() {
    const performance = {
      loadedChunks: this.loadedChunks.size,
      cachedModules: this.chunkCache.size,
      vendorModules: this.vendorModules.size,
      memoryUsage: this.estimateMemoryUsage()
    };

    console.log('[Bundle] Performance analysis:', performance);
    return performance;
  }

  // Estimar uso de memória
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    // Estimar baseado no número de módulos carregados
    totalSize += this.chunkCache.size * 50; // ~50KB por módulo médio
    totalSize += this.loadedChunks.size * 100; // ~100KB por chunk médio
    
    return totalSize; // Em KB
  }

  // Inicializar otimizações
  init() {
    console.log('[Bundle] Initializing advanced bundle splitting');
    
    this.optimizeVendorChunks();
    this.monitorTreeShaking();
    
    // Cleanup periódico
    setInterval(() => {
      this.cleanupUnusedChunks();
    }, 60000); // A cada minuto
    
    // Análise de performance periódica
    setInterval(() => {
      this.analyzePerformance();
    }, 300000); // A cada 5 minutos
    
    console.log('[Bundle] Bundle splitting optimizations initialized');
  }
}

// Export singleton
export const bundleSplitter = BundleSplitter.getInstance();

// Utility functions para Vite config
export const getViteBundleConfig = () => ({
  rollupOptions: {
    output: {
      manualChunks: {
        // Vendor chunks
        'vendor-react': ['react', 'react-dom'],
        'vendor-router': ['react-router-dom'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'vendor-charts': ['recharts'],
        'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
        
        // Feature chunks
        'chunk-auth': ['src/pages/Auth.tsx', 'src/contexts/AuthContext.tsx'],
        'chunk-quiz': ['src/pages/Quiz.tsx', 'src/pages/SoloQuiz.tsx'],
        'chunk-social': ['src/pages/Social.tsx', 'src/components/social'],
        'chunk-trading': ['src/components/trading', 'src/pages/SocialTrading.tsx'],
        'chunk-admin': ['src/pages/AdminDashboard.tsx', 'src/components/admin']
      }
    }
  },
  
  // Otimizações do build
  build: {
    target: 'esnext',
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
});