// Critical Path Optimizer para carregamento sub-500ms
export class CriticalPathOptimizer {
  private static instance: CriticalPathOptimizer;
  private resourceHints: HTMLLinkElement[] = [];
  private preloadQueue: string[] = [];
  private criticalCSS: string = '';

  static getInstance(): CriticalPathOptimizer {
    if (!CriticalPathOptimizer.instance) {
      CriticalPathOptimizer.instance = new CriticalPathOptimizer();
    }
    return CriticalPathOptimizer.instance;
  }

  // Preload recursos críticos
  preloadCriticalResources() {
    const criticalResources = [
      // Fonts críticas
      'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTk3j6zbXWjgevT5.woff2',
      // Imagens críticas (above-the-fold)
      '/src/assets/satoshi-mascot.png',
      // JavaScript crítico
      '/src/main.tsx'
    ];

    criticalResources.forEach(resource => {
      this.addPreload(resource, this.getResourceType(resource));
    });
  }

  // DNS Prefetch para domínios externos
  addDNSPrefetch() {
    const domains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'uabdmohgzsertxfishoh.supabase.co'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      this.addToHead(link);
    });
  }

  // Preconnect para recursos críticos
  addPreconnect() {
    const connections = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://uabdmohgzsertxfishoh.supabase.co'
    ];

    connections.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      this.addToHead(link);
    });
  }

  // Preload específico por tipo
  addPreload(href: string, as: string, crossorigin?: string) {
    if (this.preloadQueue.includes(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }

    this.addToHead(link);
    this.preloadQueue.push(href);
  }

  // Resource hints para próximas páginas
  addResourceHints() {
    const routes = [
      '/quiz',
      '/duels',
      '/leaderboard',
      '/profile',
      '/social'
    ];

    routes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      this.addToHead(link);
    });
  }

  // Inline critical CSS
  inlineCriticalCSS() {
    this.criticalCSS = `
      /* Critical above-the-fold styles */
      html, body { margin: 0; padding: 0; font-family: Nunito, sans-serif; }
      #root { min-height: 100vh; background: hsl(var(--background)); }
      .loading-skeleton { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      .critical-header { height: 64px; border-bottom: 1px solid hsl(var(--border)); }
      .critical-nav { position: fixed; bottom: 0; width: 100%; height: 64px; background: hsl(var(--background)); }
    `;

    const style = document.createElement('style');
    style.textContent = this.criticalCSS;
    document.head.appendChild(style);
  }

  // Progressive loading de imagens
  setupProgressiveImageLoading() {
    // Observer para lazy loading otimizado
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            
            // Preload em alta prioridade
            if (img.dataset.src) {
              const highPriorityImg = new Image();
              highPriorityImg.onload = () => {
                img.src = img.dataset.src!;
                img.classList.remove('loading-skeleton');
              };
              highPriorityImg.src = img.dataset.src;
            }
            
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Preload 50px antes de aparecer
        threshold: 0.1
      }
    );

    // Observer para imagens lazy
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Web Workers para tasks pesadas
  initializeWebWorkers() {
    // Verificar suporte a Web Workers
    if (typeof Worker !== 'undefined') {
      // Criar worker para cálculos pesados
      this.createCalculationWorker();
      // Criar worker para processamento de dados
      this.createDataProcessingWorker();
    }
  }

  private createCalculationWorker() {
    const workerCode = `
      self.onmessage = function(e) {
        const { type, data } = e.data;
        
        switch(type) {
          case 'CALCULATE_XP_PROGRESS':
            const progress = (data.current / data.target) * 100;
            self.postMessage({ type: 'XP_PROGRESS_RESULT', result: progress });
            break;
            
          case 'CALCULATE_LEADERBOARD_RANKINGS':
            const sorted = data.users.sort((a, b) => b.points - a.points);
            const rankings = sorted.map((user, index) => ({ ...user, rank: index + 1 }));
            self.postMessage({ type: 'RANKINGS_RESULT', result: rankings });
            break;
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    // Armazenar worker globalmente
    (window as any).calculationWorker = worker;
  }

  private createDataProcessingWorker() {
    const workerCode = `
      self.onmessage = function(e) {
        const { type, data } = e.data;
        
        switch(type) {
          case 'PROCESS_QUIZ_RESULTS':
            const processed = {
              accuracy: (data.correct / data.total) * 100,
              performance: data.correct > data.total * 0.8 ? 'excellent' : 'good',
              xpEarned: data.correct * 10
            };
            self.postMessage({ type: 'QUIZ_PROCESSED', result: processed });
            break;
            
          case 'FILTER_LEADERBOARD':
            const filtered = data.users.filter(user => 
              user.name.toLowerCase().includes(data.query.toLowerCase())
            );
            self.postMessage({ type: 'FILTER_RESULT', result: filtered });
            break;
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    // Armazenar worker globalmente
    (window as any).dataWorker = worker;
  }

  // Memory management agressivo
  setupMemoryManagement() {
    // Limpar recursos não utilizados
    setInterval(() => {
      this.cleanupUnusedResources();
    }, 30000); // A cada 30 segundos

    // Monitorar uso de memória
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / 1048576; // MB
        
        if (memoryUsage > 100) { // Mais de 100MB
          console.warn('[Critical Path] High memory usage:', memoryUsage, 'MB');
          this.forceGarbageCollection();
        }
      }, 10000); // A cada 10 segundos
    }
  }

  private cleanupUnusedResources() {
    // Remover event listeners órfãos
    // Limpar caches expirados
    // Remover elementos DOM desnecessários
    
    // Limpar preload queue antiga
    this.preloadQueue = this.preloadQueue.slice(-10); // Manter apenas últimos 10
    
    // Remover resource hints antigos
    this.resourceHints.forEach(hint => {
      if (hint.parentNode) {
        hint.parentNode.removeChild(hint);
      }
    });
    this.resourceHints = [];
  }

  private forceGarbageCollection() {
    // Forçar garbage collection se disponível
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Limpar caches manualmente
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('temp') || name.includes('old')) {
            caches.delete(name);
          }
        });
      });
    }
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'mjs':
        return 'script';
      case 'css':
        return 'style';
      case 'woff':
      case 'woff2':
      case 'ttf':
        return 'font';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'svg':
        return 'image';
      default:
        return 'fetch';
    }
  }

  private addToHead(element: HTMLElement) {
    document.head.appendChild(element);
    
    if (element instanceof HTMLLinkElement) {
      this.resourceHints.push(element);
    }
  }

  // Inicializar todas as otimizações
  init() {
    console.log('[Critical Path] Initializing extreme performance optimizations');
    
    // Executar otimizações em ordem de prioridade
    this.inlineCriticalCSS();
    this.addDNSPrefetch();
    this.addPreconnect();
    this.preloadCriticalResources();
    this.addResourceHints();
    this.setupProgressiveImageLoading();
    this.initializeWebWorkers();
    this.setupMemoryManagement();
    
    console.log('[Critical Path] All optimizations initialized');
  }
}

// Export singleton instance
export const criticalPathOptimizer = CriticalPathOptimizer.getInstance();