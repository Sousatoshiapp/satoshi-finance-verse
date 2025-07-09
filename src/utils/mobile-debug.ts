// Mobile-specific debugging utilities
export const mobileDebug = {
  init() {
    if (typeof window === 'undefined') return;
    
    console.log('🔄 Mobile Debug Init:', {
      userAgent: navigator.userAgent,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      devicePixelRatio: window.devicePixelRatio,
      isOnline: navigator.onLine,
      orientation: window.screen.orientation?.type,
      timestamp: new Date().toISOString()
    });

    // Monitor for mobile-specific issues
    this.monitorOrientation();
    this.monitorNetworkStatus();
    this.monitorMemory();
  },

  monitorOrientation() {
    if (typeof window === 'undefined' || !window.screen?.orientation) return;
    
    window.screen.orientation.addEventListener('change', () => {
      console.log('🔄 Orientation changed:', {
        type: window.screen.orientation.type,
        angle: window.screen.orientation.angle,
        windowSize: `${window.innerWidth}x${window.innerHeight}`
      });
    });
  },

  monitorNetworkStatus() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      console.log('🔄 Network: Online');
    });
    
    window.addEventListener('offline', () => {
      console.log('🔄 Network: Offline');
    });
  },

  monitorMemory() {
    if (typeof window === 'undefined' || !('memory' in performance)) return;
    
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        console.log('🔄 Memory usage:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
        });
      }
    }, 30000); // Every 30 seconds
  },

  logError(error: Error, context: string) {
    console.error(`🔥 Mobile Error in ${context}:`, {
      error: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
  mobileDebug.init();
}