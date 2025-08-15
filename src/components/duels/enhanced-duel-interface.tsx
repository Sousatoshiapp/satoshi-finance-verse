// SISTEMA ANTIGO COMENTADO - JANEIRO 2025
// Este arquivo foi desabilitado durante a migração para o novo sistema de duelo unificado
// Agora apenas o unified-duel-interface.tsx está ativo
// Mantido para referência durante a migração

/*
CÓDIGO ORIGINAL DO ENHANCEDDUELINTERFACE COMENTADO PARA MIGRAÇÃO

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

import { DuelQuestion } from '@/components/duels/duel-question';
import { DuelOpponent } from '@/components/duels/duel-opponent';
import { DuelTimer } from '@/components/duels/duel-timer';
import { DuelActionButtons } from '@/components/duels/duel-action-buttons';
import { DuelNotification } from '@/components/duels/duel-notification';
import { useDuelState } from '@/hooks/use-duel-state';
import { Duel, DuelQuestion as Question } from '@/types/duel';
import { calculateTimeRemaining } from '@/utils/duel-utils';
import { useUser } from '@/hooks/use-user';
import { Loading } from '@/components/shared/Loading';

const DuelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const QuestionContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const OpponentsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 20px;
`;

const TimerContainer = styled.div`
  margin-bottom: 20px;
`;

const ActionsContainer = styled.div`
  width: 100%;
`;

interface Props {
  duelId: string;
}

*/

// Component vazio para não quebrar importações existentes
export function EnhancedDuelInterface() {
  console.warn('⚠️ EnhancedDuelInterface is LEGACY - use unified-duel-interface');
  return null;
}
