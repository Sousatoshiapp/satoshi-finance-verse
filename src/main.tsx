import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/shared/ui/toaster";
import { BrowserRouter } from "react-router-dom";
import { optimizeMemoryUsage, advancedMemoryOptimization, monitorPerformance } from "@/utils/bundle-optimizer";
import App from "./App";
import "./index.css";
import "./i18n";

// Configuração otimizada do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,      // 30 segundos para dados críticos
      gcTime: 3 * 60 * 1000,     // 3 minutos para garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const MemoryOptimizer = () => {
  useEffect(() => {
    monitorPerformance();
    
    const memoryInterval = setInterval(optimizeMemoryUsage, 30000);
    
    const advancedInterval = setInterval(advancedMemoryOptimization, 60000);
    
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

root.render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MemoryOptimizer />
        <App />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

