// FASE 1: ULTRA-PERFORMANCE - Ativação completa de todas as otimizações
import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { optimizeQueryClient } from "@/utils/critical-cache";
import { Toaster } from "@/components/shared/ui/toaster";
import { BrowserRouter } from "react-router-dom";
import { optimizeMemoryUsage, advancedMemoryOptimization, monitorPerformance } from "@/utils/bundle-optimizer";
import { initCriticalPreloading } from "@/utils/preload-critical";
import { criticalPathOptimizer } from "@/utils/critical-path-optimizer";
import { bundleSplitter } from "@/utils/bundle-splitter";
import { initializePerformanceOptimizations } from "@/utils/performance-manager";
import { createUltraQueryClient, preloadCriticalAssets, monitorUltraPerformance } from "@/utils/ultra-performance";
import UltraApp from "./main-ultra";
import "./index.css";
import "./i18n";

// ULTRA QueryClient - Otimizado para sub-0.2s
const ultraQueryClient = createUltraQueryClient();

// FASE 1.1: Inicialização crítica IMEDIATA
preloadCriticalAssets();
monitorUltraPerformance();
criticalPathOptimizer.init();
bundleSplitter.init();
initializePerformanceOptimizations();

// FASE 1.2: Service Worker para cache instantâneo
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/ultra-sw.js').catch(() => {
    // Silent fail - no blocking
  });
}

// FASE 1.3: Critical Performance Marks
performance.mark('ultra-main-start');

// FASE 1.4: Ultra Performance Optimizer
const UltraPerformanceOptimizer = () => {
  useEffect(() => {
    // Preloading crítico imediato
    initCriticalPreloading();
    
    // Performance monitoring
    monitorPerformance();
    
    // Memory optimization com frequência otimizada
    const memoryInterval = setInterval(optimizeMemoryUsage, 30000); // Mais frequente
    const advancedInterval = setInterval(advancedMemoryOptimization, 60000); // Mais frequente
    
    // Memory pressure detection
    const pressureInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        if (usage > 0.8) {
          // Force cleanup se uso > 80%
          advancedMemoryOptimization();
        }
      }
    }, 15000);
    
    return () => {
      clearInterval(memoryInterval);
      clearInterval(advancedInterval);
      clearInterval(pressureInterval);
    };
  }, []);
  return null;
};

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

// FASE 1.5: Ultra App com todas as otimizações
const UltraMainApp = () => (
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={ultraQueryClient}>
        <UltraPerformanceOptimizer />
        <UltraApp />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

root.render(<UltraMainApp />);

// FASE 1.6: Performance measurement
performance.mark('ultra-main-end');
performance.measure('ultra-main-load', 'ultra-main-start', 'ultra-main-end');

// Log performance para debug
setTimeout(() => {
  const measure = performance.getEntriesByName('ultra-main-load')[0];
  if (measure) {
    console.log(`🚀 Ultra Main Load Time: ${measure.duration.toFixed(2)}ms`);
  }
}, 100);

