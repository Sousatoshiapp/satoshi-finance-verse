import React, { useEffect, useState } from 'react';

export function MobileCompatibilityChecker() {
  const [issues, setIssues] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCompatibility = () => {
      const foundIssues: string[] = [];

      // Check for mobile-specific issues
      if (window.innerWidth < 768) {
        console.log('🔄 Mobile compatibility check started');

        // Check for React issues
        if (typeof React === 'undefined') {
          foundIssues.push('React não está disponível');
        }

        // Check for localStorage issues
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
        } catch (error) {
          foundIssues.push('LocalStorage não está funcionando');
        }

        // Check for network issues
        if (!navigator.onLine) {
          foundIssues.push('Sem conexão com a internet');
        }

        // Check for JavaScript errors
        const originalError = window.onerror;
        let jsErrors = 0;
        window.onerror = (message, source, lineno, colno, error) => {
          jsErrors++;
          if (jsErrors > 3) {
            foundIssues.push('Muitos erros JavaScript detectados');
          }
          return originalError ? originalError(message, source, lineno, colno, error) : false;
        };

        // Check for memory issues
        if ((performance as any).memory) {
          const memory = (performance as any).memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
          
          if (usedMB / limitMB > 0.8) {
            foundIssues.push('Uso alto de memória detectado');
          }
        }

        // Check for CSS issues
        if (document.documentElement.style.fontSize === '') {
          foundIssues.push('Problemas com CSS detectados');
        }

        // Check for Service Worker issues
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'MOBILE_COMPATIBILITY_CHECK'
          });
        }

        console.log('🔄 Mobile compatibility check completed:', {
          issues: foundIssues,
          userAgent: navigator.userAgent.substring(0, 100),
          windowSize: `${window.innerWidth}x${window.innerHeight}`
        });
      }

      setIssues(foundIssues);
      setIsChecking(false);
    };

    // Run check after a short delay to ensure app is loaded
    const timeout = setTimeout(checkCompatibility, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // Don't show on desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  if (isChecking) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center text-sm z-50">
        Verificando compatibilidade mobile...
      </div>
    );
  }

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center text-sm z-50">
      <div className="font-bold">Problemas detectados:</div>
      <div className="text-xs mt-1">
        {issues.join(', ')}
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 bg-red-700 px-3 py-1 rounded text-xs"
      >
        Recarregar
      </button>
    </div>
  );
}