import { QueryClient } from "@tanstack/react-query";

// Estratégias de cache baseadas na frequência de uso
export const CacheStrategies = {
  // Cache ultra-longo para dados quase estáticos
  STATIC: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Cache longo para dados que mudam pouco
  SLOW_CHANGING: {
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },
  
  // Cache médio para dados padrão
  STANDARD: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },
  
  // Cache curto para dados frequentemente atualizados
  FAST_CHANGING: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  
  // Cache muito curto para dados em tempo real
  REALTIME: {
    staleTime: 10 * 1000, // 10 segundos
    gcTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30 * 1000, // Refetch a cada 30s
  },
} as const;

// Factory para criar QueryClient com estratégias otimizadas
export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: CacheStrategies.STANDARD,
      mutations: {
        retry: 1,
      },
    },
  });
}

// Query keys organizados por domínio
export const QueryKeys = {
  // Dados estáticos/quasi-estáticos (CacheStrategies.STATIC)
  QUESTIONS: {
    all: ['questions'] as const,
    list: (filters?: any) => [...QueryKeys.QUESTIONS.all, 'list', filters] as const,
    detail: (id: string) => [...QueryKeys.QUESTIONS.all, 'detail', id] as const,
  },
  
  // Dados que mudam pouco (CacheStrategies.SLOW_CHANGING)
  PROFILES: {
    all: ['profiles'] as const,
    detail: (id: string) => [...QueryKeys.PROFILES.all, 'detail', id] as const,
  },
  
  // Dados padrão (CacheStrategies.STANDARD)
  LEADERBOARD: {
    all: ['leaderboard'] as const,
    list: (filters?: any) => [...QueryKeys.LEADERBOARD.all, 'list', filters] as const,
  },
  
  // Dados que mudam frequentemente (CacheStrategies.FAST_CHANGING)
  DUELS: {
    all: ['duels'] as const,
    active: () => [...QueryKeys.DUELS.all, 'active'] as const,
    user: (userId: string) => [...QueryKeys.DUELS.all, 'user', userId] as const,
  },
  
  // Dados em tempo real (CacheStrategies.REALTIME)
  NOTIFICATIONS: {
    all: ['notifications'] as const,
    unread: () => [...QueryKeys.NOTIFICATIONS.all, 'unread'] as const,
  },
} as const;

// Utilitários para invalidação de cache estratégica
export const CacheUtils = {
  invalidateStatic: (queryClient: QueryClient) => {
    // Invalidar apenas dados críticos estáticos
    queryClient.invalidateQueries({ queryKey: QueryKeys.QUESTIONS.all });
  },
  
  invalidateUserData: (queryClient: QueryClient, userId: string) => {
    // Invalidar dados específicos do usuário
    queryClient.invalidateQueries({ queryKey: QueryKeys.PROFILES.detail(userId) });
    queryClient.invalidateQueries({ queryKey: QueryKeys.DUELS.user(userId) });
  },
  
  invalidateRealtime: (queryClient: QueryClient) => {
    // Invalidar dados em tempo real
    queryClient.invalidateQueries({ queryKey: QueryKeys.NOTIFICATIONS.all });
    queryClient.invalidateQueries({ queryKey: QueryKeys.DUELS.active() });
  },
};