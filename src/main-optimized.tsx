import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Only retry on network errors, not on 4xx/5xx
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      // Enable background refetch
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Performance monitoring
if (import.meta.env.DEV) {
  // Development performance monitoring
  import('@/utils/bundle-optimizer').then(({ analyzeBundle }) => {
    analyzeBundle();
  });
}

// Initialize performance optimizations
import('@/utils/performance-manager').then(({ initializePerformanceOptimizations }) => {
  initializePerformanceOptimizations();
});

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

root.render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

// Register service worker for caching (if available)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore service worker registration errors
    });
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  import('@/utils/bundle-optimizer').then(({ cleanupUnusedModules }) => {
    cleanupUnusedModules();
  });
});