// FASE 1: Critical CSS Inline Expandido para carregamento instantâneo
export const injectUltraCriticalCSS = () => {
  const criticalCSS = `
    /* FASE 1: Critical CSS Inline - Layout e Skeleton críticos */
    
    /* Layout básico instantâneo */
    .ultra-layout {
      min-height: 100vh;
      background: hsl(var(--background));
      font-family: Inter, system-ui, sans-serif;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Dashboard layout crítico */
    .ultra-dashboard {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Skeleton loaders críticos */
    .ultra-skeleton {
      background: linear-gradient(90deg, 
        hsl(var(--muted)) 25%, 
        hsl(var(--muted-foreground) / 0.1) 50%, 
        hsl(var(--muted)) 75%
      );
      background-size: 200% 100%;
      animation: ultra-loading 1.5s infinite;
      border-radius: 0.5rem;
    }
    
    @keyframes ultra-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* Header crítico */
    .ultra-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: hsl(var(--background) / 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid hsl(var(--border));
    }
    
    /* Navegação crítica */
    .ultra-nav {
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px hsl(var(--foreground) / 0.1);
    }
    
    /* Loading crítico */
    .ultra-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
    }
    
    /* Spinner otimizado */
    .ultra-spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid hsl(var(--muted));
      border-top: 2px solid hsl(var(--primary));
      border-radius: 50%;
      animation: ultra-spin 1s linear infinite;
    }
    
    @keyframes ultra-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Otimizações visuais críticas */
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      overflow-x: hidden;
    }
    
    /* Buttons críticos */
    .ultra-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 150ms ease;
      cursor: pointer;
      border: none;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      padding: 0.5rem 1rem;
    }
    
    .ultra-button:hover {
      background: hsl(var(--primary) / 0.9);
    }
    
    /* Cards críticos */
    .ultra-card {
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 hsl(var(--foreground) / 0.1);
    }
  `;
  
  const style = document.createElement('style');
  style.id = 'ultra-critical-css';
  style.innerHTML = criticalCSS;
  
  // Inserir no início do head para máxima prioridade
  const head = document.head;
  head.insertBefore(style, head.firstChild);
};

// Preload fonts críticas
export const preloadUltraCriticalFonts = () => {
  const fonts = [
    { family: 'Inter', weights: [400, 500, 600, 700] }
  ];
  
  fonts.forEach(font => {
    font.weights.forEach(weight => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.googleapis.com/css2?family=${font.family}:wght@${weight}&display=swap`;
      document.head.appendChild(link);
    });
  });
};

// Inicialização crítica
export const initUltraCriticalAssets = () => {
  // CSS crítico inline
  injectUltraCriticalCSS();
  
  // Fonts críticas
  preloadUltraCriticalFonts();
  
  // Marcar como inicializado
  performance.mark('ultra-critical-assets-loaded');
};