interface BTZTransaction {
  user_id: string;
  source: 'quiz' | 'daily' | 'achievement' | 'yield';
  amount: number;
  timestamp: Date;
  session_id: string;
}

export function useBTZTransactions() {
  const logBTZTransaction = (transaction: BTZTransaction) => {
    console.log('📊 BTZ Transaction:', {
      user_id: transaction.user_id,
      source: transaction.source,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      session_id: transaction.session_id
    });
    
  };

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  return {
    logBTZTransaction,
    generateSessionId
  };
}
