import { useCallback } from 'react';

/**
 * Hook de transição para migrar do sistema antigo para o unificado
 * Permite testar o novo sistema gradualmente
 */
export function useDuelTransition() {
  // Por enquanto, usar o novo sistema para todos os duelos
  const shouldUseUnifiedSystem = useCallback((duelId?: string) => {
    // Aqui podemos adicionar lógica para decidir qual sistema usar
    // Por exemplo: IDs específicos, usuários beta, etc.
    
    // Por agora, sempre usar o novo sistema
    return true;
  }, []);

  const getDuelRoute = useCallback((duelId: string) => {
    if (shouldUseUnifiedSystem(duelId)) {
      return `/unified-duel/${duelId}`;
    } else {
      return `/casino-duel/${duelId}`;
    }
  }, [shouldUseUnifiedSystem]);

  const getSystemName = useCallback((duelId?: string) => {
    return shouldUseUnifiedSystem(duelId) ? 'Unified' : 'Legacy';
  }, [shouldUseUnifiedSystem]);

  return {
    shouldUseUnifiedSystem,
    getDuelRoute,
    getSystemName
  };
}