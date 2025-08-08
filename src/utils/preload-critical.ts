// Preload critical resources for sub-1 second loading
export const preloadCriticalAssets = () => {
  // Preload critical images
  const criticalImages = [
    '/placeholder.svg', // Avatar fallback
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Preload critical CSS
  const criticalCSS = document.createElement('style');
  criticalCSS.innerHTML = `
    .loading-skeleton {
      background: linear-gradient(90deg, hsl(var(--muted)) 25%, transparent 50%, hsl(var(--muted)) 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(criticalCSS);
};

// Preload critical routes
export const preloadCriticalRoutes = async () => {
  // Only preload most critical routes to avoid over-fetching
  const criticalRoutes = [
    () => import('@/pages/Profile'),
    () => import('@/pages/Social'),
  ];

  // Use requestIdleCallback for non-blocking preloading
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      criticalRoutes.forEach(importFn => {
        importFn().catch(console.debug);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      criticalRoutes.forEach(importFn => {
        importFn().catch(console.debug);
      });
    }, 2000);
  }
};

// Initialize critical preloading
export const initCriticalPreloading = () => {
  // Run immediately for assets
  preloadCriticalAssets();
  
  // Delay route preloading until after initial render
  setTimeout(preloadCriticalRoutes, 1000);
};