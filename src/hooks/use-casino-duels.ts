// SISTEMA ANTIGO COMENTADO - JANEIRO 2025
// Este arquivo foi desabilitado durante a migração para o novo sistema de duelo unificado
// Agora apenas o use-unified-duels.ts está ativo
// Mantido para referência durante a migração

/*
CÓDIGO ORIGINAL DO USECASINODUELS COMENTADO PARA MIGRAÇÃO

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
... [todo o código original foi desabilitado - ver git history para código completo]
*/

// Hook vazio para não quebrar importações existentes
export function useCasinoDuels() {
  console.warn('⚠️ useCasinoDuels is LEGACY - use unified system');
  return {
    currentDuel: null,
    loading: false,
    error: null,
    submitAnswer: () => Promise.resolve(null),
    completeDuel: () => Promise.resolve(null),
    abandonDuel: () => Promise.resolve(null),
    loadDuelById: () => Promise.resolve(null)
  };
}
