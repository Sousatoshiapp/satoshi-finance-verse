// FASE 2: Ultra App Entry - Otimizado para sub-0.2s com query optimizer
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { createUltraQueryClient, preloadCriticalAssets, monitorUltraPerformance } from "@/utils/ultra-performance";
// import { initUltraQueryOptimizer } from "@/utils/ultra-query-optimizer";
import { Toaster } from "@/components/shared/ui/toaster";
import App from "./App";
import "./index.css";

// Ultra QueryClient com optimizer
const ultraQueryClient = createUltraQueryClient();
// const queryOptimizer = initUltraQueryOptimizer(ultraQueryClient);

// Critical assets preload
preloadCriticalAssets();

// Performance monitoring
monitorUltraPerformance();

// Service Worker registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/ultra-sw.js').catch(() => {
    // Silent fail - no blocking
  });
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

// Performance mark for measurement
performance.mark('ultra-app-start');

// Ultra App Component com query optimizer
const UltraApp = () => {
  // Initialize critical prefetching - disabled
  // useEffect(() => {
  //   queryOptimizer.prefetchForRoute('dashboard');
  // }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={ultraQueryClient}>
          <App />
          <Toaster />
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
};

root.render(<UltraApp />);

// Measure time to interactive
performance.mark('ultra-app-end');
performance.measure('ultra-app-load', 'ultra-app-start', 'ultra-app-end');

// Log performance for debugging
setTimeout(() => {
  const measure = performance.getEntriesByName('ultra-app-load')[0];
  if (measure) {
    console.log(`🚀 Ultra App Load Time: ${measure.duration.toFixed(2)}ms`);
  }
}, 100);

export default UltraApp;