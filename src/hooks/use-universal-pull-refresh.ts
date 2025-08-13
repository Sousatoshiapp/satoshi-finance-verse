import { useCallback } from 'react';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface UniversalPullRefreshConfig {
  onRefresh?: () => Promise<void>;
  refreshMessage?: {
    title: string;
    description: string;
  };
  invalidateQueries?: string[];
  pullThreshold?: number;
}

export function useUniversalPullRefresh({
  onRefresh,
  refreshMessage = {
    title: "Atualizado",
    description: "Dados atualizados com sucesso"
  },
  invalidateQueries = [],
  pullThreshold = 80
}: UniversalPullRefreshConfig = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePullToRefresh = useCallback(async () => {
    try {
      // Custom refresh function
      if (onRefresh) {
        await onRefresh();
      }
      
      // Invalidate specified queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      // Show success message
      toast({
        title: refreshMessage.title,
        description: refreshMessage.description,
      });
    } catch (error) {
      console.error('Pull to refresh error:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente em alguns segundos",
        variant: "destructive"
      });
    }
  }, [onRefresh, invalidateQueries, refreshMessage, toast, queryClient]);

  const {
    containerRef,
    isRefreshing,
    pullDistance,
    indicators
  } = useMobileGestures({
    onPullToRefresh: handlePullToRefresh,
    pullThreshold,
    scrollThreshold: 200
  });

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    indicators,
    pullThreshold
  };
}