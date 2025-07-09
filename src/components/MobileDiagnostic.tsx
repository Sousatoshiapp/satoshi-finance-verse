import React, { useState, useEffect } from 'react';
import { mobileDebug } from '@/utils/mobile-debug';

export function MobileDiagnostic() {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const collectDiagnosticData = () => {
      const data = {
        userAgent: navigator.userAgent,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        devicePixelRatio: window.devicePixelRatio,
        isOnline: navigator.onLine,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length,
        cookies: document.cookie.split(';').length,
        orientation: window.screen.orientation?.type || 'unknown',
        memory: (performance as any).memory ? {
          used: `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB`,
        } : 'not available'
      };
      
      setDiagnosticData(data);
    };

    collectDiagnosticData();
    
    // Update every 5 seconds when diagnostic is open
    const interval = setInterval(() => {
      if (isOpen) {
        collectDiagnosticData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Only show on mobile or during development
  const shouldShow = typeof window !== 'undefined' && 
    (window.innerWidth < 768 || process.env.NODE_ENV === 'development');

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
        title="Mobile Diagnostic"
      >
        🔧
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-black/90 text-white p-4 rounded-lg shadow-xl max-w-sm w-80 max-h-96 overflow-y-auto text-xs">
          <h3 className="font-bold mb-2 text-sm">Mobile Diagnostic</h3>
          <div className="space-y-1">
            {Object.entries(diagnosticData).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-300">{key}:</span>
                <span className="text-green-300 ml-2 break-all">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2 border-t border-gray-600">
            <button
              onClick={() => {
                console.log('🔄 Manual diagnostic triggered');
                mobileDebug.init();
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              Run Debug
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 ml-2"
            >
              Clear & Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}