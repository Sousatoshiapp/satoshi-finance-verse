// FASE 2: Advanced Performance Hacks - Entry point ultra-otimizado
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { createUltraQueryClient, preloadCriticalAssets, monitorUltraPerformance } from "@/utils/ultra-performance";
import { Toaster } from "@/components/shared/ui/toaster";
import App from "./App";
import "./index.css";

// Ultra-optimized QueryClient
const ultraQueryClient = createUltraQueryClient();

// Critical Path Inlining - Preload immediately
preloadCriticalAssets();

// Performance monitoring for sub-0.2s
monitorUltraPerformance();

// Service Worker for instant cache
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

// Ultra App Component
const UltraApp = () => (
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={ultraQueryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

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