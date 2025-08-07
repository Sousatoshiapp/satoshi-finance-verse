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
      staleTime: 2 * 60 * 1000, // Reduzir para 2 minutos
      gcTime: 5 * 60 * 1000,    // Reduzir para 5 minutos
      refetchOnWindowFocus: false,
      refetchOnMount: false,     // Evitar refetch desnecessário
      retry: 1,                  // Reduzir tentativas
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

