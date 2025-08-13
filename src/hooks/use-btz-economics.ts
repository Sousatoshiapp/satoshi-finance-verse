import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { YIELD_CONFIG, calculateDailyYield } from '@/config/yield-config';

interface BTZAnalytics {
  current: {
    total_btz: number;
    protected_btz: number;
    unprotected_btz: number;
    consecutive_login_days: number;
    current_yield_rate: number;
    next_yield_amount: number;
    time_until_next_yield_ms: number;
    yield_applied_today: boolean;
  };
  historical: {
    total_yield_earned: number;
    yield_last_30_days: number;
    penalty_last_30_days: number;
    net_gain_last_30_days: number;
  };
  charts: {
    yield_history: Array<{
      id: string;
      yield_amount: number;
      yield_rate: number;
      streak_bonus: number;
      subscription_bonus: number;
      created_at: string;
    }>;
    penalty_history: Array<{
      id: string;
      penalty_amount: number;
      days_inactive: number;
      penalty_rate: number;
      created_at: string;
    }>;
  };
  bonuses: {
    base_rate: number;
    subscription_bonus: number;
    streak_bonus: number;
    subscription_tier: string;
  };
}

interface YieldResult {
  yield_applied: boolean;
  yield_amount: number;
  new_total: number;
  streak_bonus: number;
}

export function useBTZEconomics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<BTZAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingYield, setProcessingYield] = useState(false);

  // Load BTZ analytics
  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-btz-analytics');
      
      if (error) {
        console.error('Error loading BTZ analytics:', error);
        return;
      }

      setAnalytics(data);
    } catch (error) {
      console.error('Error in loadAnalytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process daily yield and login - COM RATE LIMITING CRÍTICO
  const processYield = async () => {
    if (!user || processingYield) return;

    // RATE LIMITING CRÍTICO: Verificar se já processou hoje
    const lastProcessedKey = `btز_yield_processed_${user.id}`;
    const lastProcessed = localStorage.getItem(lastProcessedKey);
    const today = new Date().toISOString().split('T')[0];
    
    if (lastProcessed === today) {
      console.log('🛑 BTZ Yield já processado hoje, ignorando...');
      return;
    }

    setProcessingYield(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-daily-yield', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Error processing yield:', error);
        toast({
          title: "Erro",
          description: "Falha ao processar rendimento diário",
          variant: "destructive"
        });
        return;
      }

      const yieldResult = data.yield as YieldResult;
      const streakResult = data.streak;
      const penaltyResult = data.penalty;

      // Show notifications
      if (yieldResult?.yield_applied && yieldResult.yield_amount > 0) {
        toast({
          title: "💰 BTZ Rendeu!",
          description: `Você ganhou ${yieldResult.yield_amount.toLocaleString()} BTZ hoje! (+${(yieldResult.streak_bonus * 100).toFixed(1)}% streak bonus)`,
          duration: 5000
        });
      }

      if (streakResult?.streak_updated && streakResult.new_streak > 0) {
        const milestones = [3, 7, 14, 30, 60, 100];
        if (milestones.includes(streakResult.new_streak)) {
          toast({
            title: "🔥 Streak Milestone!",
            description: `${streakResult.new_streak} dias consecutivos! Seu rendimento aumentou!`,
            duration: 5000
          });
        }
      }

      if (penaltyResult?.penalty_applied && penaltyResult.penalty_amount > 0) {
        toast({
          title: "⚠️ BTZ Perdido",
          description: `Você perdeu ${penaltyResult.penalty_amount.toLocaleString()} BTZ por inatividade (${penaltyResult.days_inactive} dias)`,
          variant: "destructive",
          duration: 7000
        });
      }

      // Marcar como processado hoje - RATE LIMITING
      localStorage.setItem(lastProcessedKey, today);
      
      // Reload analytics after processing
      await loadAnalytics();

    } catch (error) {
      console.error('Error in processYield:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar login diário",
        variant: "destructive"
      });
    } finally {
      setProcessingYield(false);
    }
  };

  // Auto-process yield on login - COM DEBOUNCE 24H
  useEffect(() => {
    if (user && !loading) {
      // Debounce adicional: só processar se não processou nas últimas 24h
      const lastProcessed = localStorage.getItem(`btz_yield_processed_${user.id}`);
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      if (lastProcessed !== today) {
        const timeoutId = setTimeout(() => {
          processYield();
        }, 2000); // 2s delay para evitar múltiplas chamadas
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [user]);

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, [user]);

  // Format time until next yield
  const formatTimeUntilYield = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate protection percentage
  const getProtectionPercentage = () => {
    if (!analytics) return 0;
    return analytics.current.total_btz > 0 
      ? (analytics.current.protected_btz / analytics.current.total_btz) * 100 
      : 0;
  };

  // Get streak tier with corrected logic
  const getStreakTier = () => {
    if (!analytics) return 'Iniciante';
    const days = analytics.current.consecutive_login_days;
    if (days >= 100) return 'Lendário';
    if (days >= 60) return 'Épico';
    if (days >= 30) return 'Raro';
    if (days >= 14) return 'Incomum';
    if (days >= 7) return 'Comum';
    return 'Iniciante';
  };

  // Calculate corrected next yield using centralized config
  const getCorrectNextYield = () => {
    if (!analytics?.current) return 0;
    
    const result = calculateDailyYield(
      analytics.current.total_btz,
      analytics.current.consecutive_login_days,
      analytics.bonuses?.subscription_tier as 'free' | 'pro' | 'elite'
    );
    
    return result.appliedYield;
  };

  // Validate if current data is consistent
  const validateYieldData = () => {
    if (!analytics) return { isValid: true, issues: [] };
    
    const issues = [];
    
    // Check if next yield is above cap
    if (analytics.current.next_yield_amount > YIELD_CONFIG.ABSOLUTE_DAILY_CAP) {
      issues.push(`Next yield (${analytics.current.next_yield_amount}) exceeds daily cap (${YIELD_CONFIG.ABSOLUTE_DAILY_CAP})`);
    }
    
    // Check if yield rate is suspiciously high
    if (analytics.current.current_yield_rate > 0.01) {
      issues.push(`Yield rate (${(analytics.current.current_yield_rate * 100).toFixed(2)}%) is abnormally high`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  };

  return {
    analytics,
    loading,
    processingYield,
    processYield,
    loadAnalytics,
    formatTimeUntilYield,
    getProtectionPercentage,
    getStreakTier,
    getCorrectNextYield,
    validateYieldData,
    YIELD_CONFIG
  };
}