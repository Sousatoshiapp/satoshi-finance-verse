// FASE 1: QueryClient Ultra-Otimizado para performance máxima
import { QueryClient } from '@tanstack/react-query';

// Configuração ultra-agressiva do QueryClient
export const createUltraQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache agressivo para todas as queries
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 15 * 60 * 1000, // 15 minutos
        
        // Reduzir network requests
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        
        // Retry mínimo
        retry: 1,
        retryDelay: 1000,
        
        // Network mode otimizado
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  });
};

// Cleanup automático de queries antigas
export const setupUltraQueryCleanup = (queryClient: QueryClient) => {
  // Cleanup a cada 5 minutos
  const cleanupInterval = setInterval(() => {
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();
    
    queries.forEach(query => {
      const lastUpdated = query.state.dataUpdatedAt;
      const age = now - lastUpdated;
      
      // Remove queries > 10 minutos sem observers
      if (age > 10 * 60 * 1000 && query.getObserversCount() === 0) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    // Log apenas em dev
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Query cleanup: ${queries.length} total queries`);
    }
  }, 5 * 60 * 1000);

  // Cleanup final
  return () => clearInterval(cleanupInterval);
};

// Deduplicação de requests idênticos
const pendingRequests = new Map<string, Promise<any>>();

export const deduplicateUltraRequest = <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = requestFn()
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
};