import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/shared/ui/toaster";
import { BrowserRouter } from "react-router-dom";
// ATIVAÇÃO ULTRA: Usar versão ultra-otimizada
import UltraApp from "./App-Ultra";
import { createUltraQueryClient, preloadCriticalAssets, monitorUltraPerformance } from "@/utils/ultra-performance";
import "./index.css";
import "./i18n";

// FASE 5: Ultra-optimized QueryClient para sub-0.2s
const ultraQueryClient = createUltraQueryClient();

// FASE 4: Critical Path Inlining - Preload immediately
preloadCriticalAssets();

// FASE 5: Performance monitoring para sub-0.2s
monitorUltraPerformance();

// FASE 4: Service Worker para cache instantâneo
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/ultra-sw.js').catch(() => {
    // Silent fail - não bloquear
  });
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

// Performance mark para medição
performance.mark('ultra-app-start');

root.render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={ultraQueryClient}>
        <UltraApp />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

// Medir tempo até interativo
performance.mark('ultra-app-end');
performance.measure('ultra-app-load', 'ultra-app-start', 'ultra-app-end');

// Log performance para debug
setTimeout(() => {
  const measure = performance.getEntriesByName('ultra-app-load')[0];
  if (measure) {
    console.log(`🚀 Ultra App Load Time: ${measure.duration.toFixed(2)}ms`);
  }
}, 100);

