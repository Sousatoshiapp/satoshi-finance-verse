import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { optimizeQueryClient } from "@/utils/critical-cache";
import { Toaster } from "@/components/shared/ui/toaster";
import { BrowserRouter } from "react-router-dom";
import { optimizeMemoryUsage, advancedMemoryOptimization, monitorPerformance } from "@/utils/bundle-optimizer";
import { initCriticalPreloading } from "@/utils/preload-critical";
import UltraApp from "./main-ultra";
import "./index.css";
import "./i18n";

// Configuração ultra-otimizada do QueryClient
const queryClient = optimizeQueryClient(new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 1000,      // 15 segundos para dados críticos
      gcTime: 2 * 60 * 1000,     // 2 minutos para garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
}));

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Initialize critical preloading immediately
    initCriticalPreloading();
    
    monitorPerformance();
    
    // Reduce frequency to prevent performance impact
    const memoryInterval = setInterval(optimizeMemoryUsage, 45000);
    const advancedInterval = setInterval(advancedMemoryOptimization, 90000);
    
    return () => {
      clearInterval(memoryInterval);
      clearInterval(advancedInterval);
    };
  }, []);
  return null;
};

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

root.render(<UltraApp />);

