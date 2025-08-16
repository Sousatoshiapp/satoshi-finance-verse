// SISTEMA ANTIGO COMENTADO - JANEIRO 2025
// Este arquivo foi desabilitado durante a migração para o novo sistema de duelo baseado no Quiz Solo
// Agora apenas o DuelScreen.tsx (baseado em SoloQuiz.tsx) está ativo
// Mantido para referência durante a migração

/*
CÓDIGO ORIGINAL DO UNIFIEDCASINODUELSCREEN COMENTADO PARA MIGRAÇÃO

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDuelAdaptiveEngine } from '@/hooks/use-duel-adaptive-engine';
import { UnifiedDuelInterface } from '@/components/duels/unified-duel-interface';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useSensoryFeedback } from '@/hooks/use-sensory-feedback';
import { useRewardAnimationSystem } from '@/hooks/use-reward-animation-system';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplayUniversal } from '@/components/shared/avatar-display-universal';
import { resolveAvatarImage } from '@/lib/avatar-utils';
import { DuelVictoryModal } from '@/components/duels/DuelVictoryModal';

... [todo o código original foi desabilitado - ver git history para código completo]
*/

// Component vazio para não quebrar importações existentes
export default function UnifiedCasinoDuelScreen() {
  console.warn('⚠️ UnifiedCasinoDuelScreen is LEGACY - use new DuelScreen based on SoloQuiz');
  return null;
}