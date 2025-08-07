import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BTZTransaction {
  id: string;
  user_id: string;
  source: 'quiz' | 'daily' | 'achievement' | 'yield' | 'streak';
  amount: number;
  timestamp: Date;
  session_id?: string;
  metadata?: Record<string, any>;
}

interface BTZAnalytics {
  daily_earned: number;
  daily_cap_remaining: number;
  total_transactions: number;
  sources_breakdown: Record<string, number>;
  warning_level: 'green' | 'yellow' | 'red';
}

export function useBTZAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<BTZAnalytics | null>(null);
  const [transactions, setTransactions] = useState<BTZTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const DAILY_BTZ_CAP = 10; // Cap máximo diário

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Criar tabela de transações se não existir (simulação)
      const today = new Date().toDateString();
      
      // Simular dados por enquanto - depois será substituído por dados reais do banco
      const mockTransactions: BTZTransaction[] = [
        {
          id: '1',
          user_id: user.id,
          source: 'quiz',
          amount: 0.7, // 7 perguntas × 0.1 BTZ
          timestamp: new Date(),
          session_id: 'quiz-001'
        },
        {
          id: '2',
          user_id: user.id,
          source: 'daily',
          amount: 0.1,
          timestamp: new Date(),
        },
        {
          id: '3',
          user_id: user.id,
          source: 'yield',
          amount: 2.5,
          timestamp: new Date(),
        }
      ];

      setTransactions(mockTransactions);

      // Calcular analytics
      const dailyEarned = mockTransactions
        .filter(t => new Date(t.timestamp).toDateString() === today)
        .reduce((sum, t) => sum + t.amount, 0);

      const sourcesBreakdown = mockTransactions.reduce((acc, t) => {
        acc[t.source] = (acc[t.source] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      const capRemaining = Math.max(0, DAILY_BTZ_CAP - dailyEarned);
      
      let warningLevel: 'green' | 'yellow' | 'red' = 'green';
      if (dailyEarned >= DAILY_BTZ_CAP * 0.8) warningLevel = 'yellow';
      if (dailyEarned >= DAILY_BTZ_CAP) warningLevel = 'red';

      setAnalytics({
        daily_earned: dailyEarned,
        daily_cap_remaining: capRemaining,
        total_transactions: mockTransactions.length,
        sources_breakdown: sourcesBreakdown,
        warning_level: warningLevel
      });

    } catch (error) {
      console.error('Error loading BTZ analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const logBTZTransaction = async (
    source: BTZTransaction['source'],
    amount: number,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      // Log da transação
      console.log('🔍 BTZ Transaction:', {
        user_id: user.id,
        source,
        amount,
        metadata,
        timestamp: new Date().toISOString()
      });

      // Aqui seria salvo no banco de dados real
      // Por enquanto, apenas adicionar à lista local
      const newTransaction: BTZTransaction = {
        id: Date.now().toString(),
        user_id: user.id,
        source,
        amount,
        timestamp: new Date(),
        metadata
      };

      setTransactions(prev => [newTransaction, ...prev.slice(0, 99)]); // Manter últimas 100
      
      // Atualizar analytics
      await loadAnalytics();

    } catch (error) {
      console.error('Error logging BTZ transaction:', error);
    }
  };

  const checkDailyLimit = (source: string, amount: number): boolean => {
    if (!analytics) return true;

    const newTotal = analytics.daily_earned + amount;
    
    if (newTotal > DAILY_BTZ_CAP) {
      console.warn(`🚫 Daily BTZ cap exceeded! Attempted: ${amount}, Current: ${analytics.daily_earned}, Cap: ${DAILY_BTZ_CAP}`);
      return false;
    }

    return true;
  };

  return {
    analytics,
    transactions,
    loading,
    logBTZTransaction,
    checkDailyLimit,
    DAILY_BTZ_CAP,
    loadAnalytics
  };
}