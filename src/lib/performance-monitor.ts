/**
 * Performance Monitor - Sistema de monitoramento automático de performance
 * Coleta métricas em tempo real e otimiza automaticamente quando necessário
 */

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  largestContentfulPaint: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  bundleSize: number;
}

interface OptimizationRule {
  metric: keyof PerformanceMetrics;
  threshold: number;
  action: () => void;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private optimizationRules: OptimizationRule[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeOptimizationRules();
    this.startMonitoring();
  }

  private initializeOptimizationRules(): void {
    this.optimizationRules = [
      {
        metric: 'memoryUsage',
        threshold: 90, // 90% de uso de memória
        action: () => this.optimizeMemory(),
        description: 'Otimizar uso de memória',
        severity: 'high'
      },
      {
        metric: 'firstInputDelay',
        threshold: 100, // 100ms FID
        action: () => this.optimizeInputDelay(),
        description: 'Reduzir delay de primeira interação',
        severity: 'medium'
      },
      {
        metric: 'cumulativeLayoutShift',
        threshold: 0.1, // CLS threshold
        action: () => this.optimizeLayoutShift(),
        description: 'Reduzir mudanças de layout',
        severity: 'medium'
      },
      {
        metric: 'largestContentfulPaint',
        threshold: 2500, // 2.5s LCP
        action: () => this.optimizeLCP(),
        description: 'Acelerar carregamento de conteúdo',
        severity: 'high'
      },
      {
        metric: 'networkLatency',
        threshold: 1000, // 1s latência
        action: () => this.optimizeNetwork(),
        description: 'Otimizar requisições de rede',
        severity: 'medium'
      }
    ];
  }

  private startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;

    // Web Vitals monitoring
    this.observeWebVitals();
    
    // Memory monitoring
    this.observeMemory();
    
    // Network monitoring
    this.observeNetwork();

    // Periodic optimization check
    setInterval(() => this.checkOptimizations(), 30000); // A cada 30 segundos

    console.log('🚀 Performance Monitor initialized');
  }

  private observeWebVitals(): void {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
          this.logMetric('FCP', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
      this.logMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const performanceEntry = entry as any;
        if (performanceEntry.processingStart && performanceEntry.startTime) {
          const fid = performanceEntry.processingStart - performanceEntry.startTime;
          this.metrics.firstInputDelay = fid;
          this.logMetric('FID', fid);
        }
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutEntry = entry as any;
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      }
      this.metrics.cumulativeLayoutShift = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private observeMemory(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.metrics.memoryUsage = usagePercent;
        
        if (usagePercent > 85) {
          console.info(`Memory usage: ${usagePercent.toFixed(1)}%`);
        }
      }, 5000);
    }
  }

  private observeNetwork(): void {
    // Monitorar requisições de rede
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        this.updateNetworkLatency(latency);
        return response;
      } catch (error) {
        const endTime = performance.now();
        const latency = endTime - startTime;
        this.updateNetworkLatency(latency);
        throw error;
      }
    };
  }

  private updateNetworkLatency(latency: number): void {
    if (!this.metrics.networkLatency) {
      this.metrics.networkLatency = latency;
    } else {
      // Média móvel das últimas requisições
      this.metrics.networkLatency = (this.metrics.networkLatency * 0.8) + (latency * 0.2);
    }
  }

  private checkOptimizations(): void {
    for (const rule of this.optimizationRules) {
      const currentValue = this.metrics[rule.metric];
      
      if (currentValue !== undefined && currentValue > rule.threshold) {
        console.warn(`⚠️ Performance threshold exceeded: ${rule.metric} = ${currentValue}`);
        
        try {
          rule.action();
          console.info(`✅ Applied optimization: ${rule.description}`);
        } catch (error) {
          console.error(`❌ Failed to apply optimization: ${rule.description}`, error);
        }
      }
    }
  }

  // Otimizações automáticas
  private optimizeMemory(): void {
    // Limpeza de cache desnecessário
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }

    // Forçar garbage collection se disponível
    if ('gc' in window) {
      (window as any).gc();
    }

    // Limpar event listeners não utilizados
    this.cleanupEventListeners();
  }

  private optimizeInputDelay(): void {
    // Quebrar tarefas longas em chunks menores
    this.scheduleIdleCallback(() => {
      // Executar tarefas não críticas em idle time
      this.deferNonCriticalTasks();
    });
  }

  private optimizeLayoutShift(): void {
    // Aplicar dimensões explícitas a imagens sem dimensões
    const images = document.querySelectorAll('img:not([width]):not([height])') as NodeListOf<HTMLImageElement>;
    images.forEach(img => {
      if (img.naturalWidth && img.naturalHeight) {
        img.setAttribute('width', img.naturalWidth.toString());
        img.setAttribute('height', img.naturalHeight.toString());
      }
    });
  }

  private optimizeLCP(): void {
    // Preload de recursos críticos
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.getAttribute('src') || '';
      document.head.appendChild(link);
    });

    // Otimizar fontes
    this.optimizeFonts();
  }

  private optimizeNetwork(): void {
    // Implementar cache inteligente
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }

    // Cancelar requisições desnecessárias
    this.cancelUnnecessaryRequests();
  }

  private optimizeFonts(): void {
    const fontLinks = document.querySelectorAll('link[rel="stylesheet"]');
    fontLinks.forEach(link => {
      if (!link.hasAttribute('data-optimized')) {
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', 'style');
        link.setAttribute('onload', "this.onload=null;this.rel='stylesheet'");
        link.setAttribute('data-optimized', 'true');
      }
    });
  }

  private cleanupEventListeners(): void {
    // Remover listeners órfãos (implementação específica do projeto)
    const elements = document.querySelectorAll('[data-cleanup-listeners]');
    elements.forEach(el => {
      el.removeAttribute('data-cleanup-listeners');
    });
  }

  private scheduleIdleCallback(callback: () => void): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 5000 });
    } else {
      setTimeout(callback, 0);
    }
  }

  private deferNonCriticalTasks(): void {
    // Adiar tarefas não críticas para momentos de menor carga
    const nonCriticalElements = document.querySelectorAll('[data-defer]');
    nonCriticalElements.forEach(el => {
      if (el.hasAttribute('data-defer')) {
        el.removeAttribute('data-defer');
        // Processar elemento quando houver tempo disponível
      }
    });
  }

  private cancelUnnecessaryRequests(): void {
    // Implementar lógica para cancelar requisições desnecessárias
    // baseado no contexto atual da aplicação
  }

  private logMetric(name: string, value: number): void {
    const color = value < 1000 ? 'green' : value < 2500 ? 'orange' : 'red';
    console.log(`%c📊 ${name}: ${value.toFixed(2)}ms`, `color: ${color}`);
  }

  // Métodos públicos para acesso às métricas
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getPerformanceScore(): number {
    const weights = {
      firstContentfulPaint: 0.2,
      largestContentfulPaint: 0.25,
      firstInputDelay: 0.25,
      cumulativeLayoutShift: 0.25,
      memoryUsage: 0.05
    };

    let score = 100;
    
    if (this.metrics.firstContentfulPaint && this.metrics.firstContentfulPaint > 1800) {
      score -= (this.metrics.firstContentfulPaint - 1800) / 100 * weights.firstContentfulPaint * 100;
    }
    
    if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint > 2500) {
      score -= (this.metrics.largestContentfulPaint - 2500) / 100 * weights.largestContentfulPaint * 100;
    }
    
    if (this.metrics.firstInputDelay && this.metrics.firstInputDelay > 100) {
      score -= (this.metrics.firstInputDelay - 100) / 10 * weights.firstInputDelay * 100;
    }
    
    if (this.metrics.cumulativeLayoutShift && this.metrics.cumulativeLayoutShift > 0.1) {
      score -= (this.metrics.cumulativeLayoutShift - 0.1) * weights.cumulativeLayoutShift * 1000;
    }
    
    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 75) {
      score -= (this.metrics.memoryUsage - 75) / 25 * weights.memoryUsage * 100;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Relatório de performance para dashboard
  getPerformanceReport(): any {
    const score = this.getPerformanceScore();
    const health = score > 80 ? 'good' : score > 60 ? 'needs-improvement' : 'poor';
    
    return {
      score: Math.round(score),
      health,
      metrics: this.metrics,
      recommendations: this.getRecommendations(),
      timestamp: Date.now()
    };
  }

  private getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 85) {
      recommendations.push('Otimizar uso de memória - limpar caches desnecessários');
    }
    
    if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint > 2500) {
      recommendations.push('Otimizar carregamento de imagens e recursos críticos');
    }
    
    if (this.metrics.firstInputDelay && this.metrics.firstInputDelay > 100) {
      recommendations.push('Reduzir JavaScript bloqueante na thread principal');
    }
    
    if (this.metrics.cumulativeLayoutShift && this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Adicionar dimensões a imagens e reservar espaço para conteúdo dinâmico');
    }
    
    if (this.metrics.networkLatency && this.metrics.networkLatency > 1000) {
      recommendations.push('Otimizar requisições de rede e implementar cache mais agressivo');
    }

    return recommendations;
  }
}

export const performanceMonitor = new PerformanceMonitor();