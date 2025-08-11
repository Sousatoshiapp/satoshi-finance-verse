// Ultra-aggressive resource optimization
export class ResourceOptimizer {
  private static instance: ResourceOptimizer;
  private preloadedResources = new Set<string>();
  private criticalResourcesLoaded = false;

  static getInstance(): ResourceOptimizer {
    if (!ResourceOptimizer.instance) {
      ResourceOptimizer.instance = new ResourceOptimizer();
    }
    return ResourceOptimizer.instance;
  }

  // Preload critical resources immediately
  async preloadCriticalResources() {
    if (this.criticalResourcesLoaded) return;

    const criticalResources = [
      // Critical CSS
      { href: '/src/index.css', as: 'style', type: 'text/css' },
      
      // Critical JS chunks
      { href: '/src/main.tsx', as: 'script', type: 'module' },
      
      // Critical images
      { href: '/placeholder.svg', as: 'image', type: 'image/svg+xml' },
    ];

    await Promise.all(
      criticalResources.map(resource => this.preloadResource(resource))
    );

    this.criticalResourcesLoaded = true;
    console.log('🚀 Critical resources preloaded');
  }

  // Intelligent resource preloading
  private async preloadResource({ href, as, type }: { href: string; as: string; type?: string }) {
    if (this.preloadedResources.has(href)) return;

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      
      link.onload = () => {
        this.preloadedResources.add(href);
        resolve(true);
      };
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  }

  // Optimize image loading with lazy loading and intersection observer
  optimizeImageLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.dataset.src) {
          imgElement.src = imgElement.dataset.src;
          imgElement.removeAttribute('data-src');
        }
      });
    }
  }

  // Optimize font loading with font-display: swap
  optimizeFontLoading() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Satoshi-Fallback';
        src: local('Nunito'), local('system-ui'), local('sans-serif');
        font-display: swap;
        size-adjust: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  // Prefetch next probable routes based on current route
  prefetchRoutes(currentRoute: string) {
    const routePrefetchMap: Record<string, string[]> = {
      '/dashboard': ['/quiz', '/social', '/profile'],
      '/quiz': ['/leaderboard', '/dashboard'],
      '/social': ['/messages', '/profile'],
      '/profile': ['/settings', '/achievements'],
      '/duels': ['/find-opponent', '/dashboard'],
    };

    const routesToPrefetch = routePrefetchMap[currentRoute] || [];
    
    routesToPrefetch.forEach((route, index) => {
      setTimeout(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      }, index * 300);
    });
  }

  // Remove unused resources and clean up
  cleanupUnusedResources() {
    // Remove unused link tags
    const unusedLinks = document.querySelectorAll('link[rel="prefetch"]:not([href*="critical"])');
    unusedLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });

    // Clear preloaded resources set if too large
    if (this.preloadedResources.size > 50) {
      this.preloadedResources.clear();
    }
  }

  // Monitor and optimize bundle chunks
  optimizeBundleChunks() {
    if (process.env.NODE_ENV === 'development') {
      const scripts = document.querySelectorAll('script[src]');
      const largeChunks = Array.from(scripts).filter(script => {
        const src = script.getAttribute('src');
        return src && src.includes('.js') && !src.includes('vendor');
      });

      if (largeChunks.length > 10) {
        console.warn('⚠️ Too many script chunks detected. Consider more aggressive splitting.');
      }
    }
  }

  // Initialize all optimizations
  async initializeOptimizations(currentRoute?: string) {
    await this.preloadCriticalResources();
    this.optimizeImageLoading();
    this.optimizeFontLoading();
    
    if (currentRoute) {
      this.prefetchRoutes(currentRoute);
    }

    // Schedule cleanup
    setTimeout(() => this.cleanupUnusedResources(), 30000);
    
    // Monitor bundle
    this.optimizeBundleChunks();
  }
}

// Export singleton instance
export const resourceOptimizer = ResourceOptimizer.getInstance();