import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earn' | 'spend' | 'purchase' | 'transfer';
  amount: number;
  balance_after: number;
  source_type: string;
  source_id?: string;
  description: string;
  metadata: any;
  created_at: string;
}

export interface WalletStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  todayEarned: number;
  weekEarned: number;
  monthEarned: number;
}

export function useWalletTransactions() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useProfile();

  // Carregar transações da carteira
  const loadTransactions = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions((data || []) as WalletTransaction[]);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de transações",
        variant: "destructive"
      });
    }
  };

  // Calcular estatísticas da carteira
  const calculateStats = () => {
    if (!profile || transactions.length === 0) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalEarned = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const todayEarned = transactions
      .filter(t => {
        const transactionDate = new Date(t.created_at);
        return t.amount > 0 && transactionDate >= today;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const weekEarned = transactions
      .filter(t => {
        const transactionDate = new Date(t.created_at);
        return t.amount > 0 && transactionDate >= weekAgo;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthEarned = transactions
      .filter(t => {
        const transactionDate = new Date(t.created_at);
        return t.amount > 0 && transactionDate >= monthAgo;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      currentBalance: profile.points,
      totalEarned,
      totalSpent,
      todayEarned,
      weekEarned,
      monthEarned
    });
  };

  // Filtrar transações por tipo
  const filterTransactions = (type?: string, sourceType?: string) => {
    let filtered = transactions;

    if (type) {
      filtered = filtered.filter(t => t.transaction_type === type);
    }

    if (sourceType) {
      filtered = filtered.filter(t => t.source_type === sourceType);
    }

    return filtered;
  };

  // Agrupar transações por data
  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: WalletTransaction[] } = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toLocaleDateString('pt-BR');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });

    return grouped;
  };

  // Obter transações por período
  const getTransactionsByPeriod = (period: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        return transactions;
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.created_at);
      return transactionDate >= startDate;
    });
  };

  // Formatar valor da transação
  const formatAmount = (amount: number) => {
    const isPositive = amount > 0;
    const absAmount = Math.abs(amount);
    const sign = isPositive ? '+' : '-';
    
    return `${sign}${absAmount.toLocaleString('pt-BR')} Beetz`;
  };

  // Obter cor da transação
  const getTransactionColor = (transaction: WalletTransaction) => {
    if (transaction.amount > 0) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  // Obter ícone da transação
  const getTransactionIcon = (transaction: WalletTransaction) => {
    switch (transaction.source_type) {
      case 'quiz':
        return '🧠';
      case 'duel':
        return '⚔️';
      case 'purchase':
        return '🛍️';
      case 'store_purchase':
        return '🏪';
      case 'marketplace':
        return '🏛️';
      case 'referral':
        return '👥';
      case 'achievement':
        return '🏆';
      case 'daily_reward':
        return '🎁';
      default:
        return '💰';
    }
  };

  useEffect(() => {
    if (profile?.id) {
      loadTransactions();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile && transactions.length > 0) {
      calculateStats();
    }
  }, [profile, transactions]);

  useEffect(() => {
    setLoading(false);
  }, [transactions]);

  return {
    transactions,
    stats,
    loading,
    filterTransactions,
    groupTransactionsByDate,
    getTransactionsByPeriod,
    formatAmount,
    getTransactionColor,
    getTransactionIcon,
    refetch: loadTransactions
  };
}