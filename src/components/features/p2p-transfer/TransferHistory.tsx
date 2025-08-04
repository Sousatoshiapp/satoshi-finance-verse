import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { useI18n } from '@/hooks/use-i18n';

interface Transfer {
  id: string;
  amount_cents: number;
  created_at: string;
  user_id: string;
  receiver_id: string;
  type: 'sent' | 'received';
  otherUser?: {
    id: string;
    nickname: string;
  };
}

export function TransferHistory() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const { t } = useI18n();

  useEffect(() => {
    if (profile?.id) {
      loadTransfers();
    }
  }, [profile?.id]);

  const loadTransfers = async () => {
    if (!profile?.id) return;

    try {
      // Get sent transfers
      const { data: sentTransfers, error: sentError } = await supabase
        .from('transactions')
        .select('id, amount_cents, created_at, user_id, receiver_id')
        .eq('receiver_id', profile.id)  // Changed: looking for transfers TO this profile
        .eq('transfer_type', 'p2p')
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Get received transfers using wallet_transactions for better tracking
      const { data: walletTransactions, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', profile.id)
        .in('source_type', ['p2p_send', 'p2p_receive'])
        .order('created_at', { ascending: false });

      if (walletError) throw walletError;

      // Convert wallet transactions to transfer format
      const transfers: Transfer[] = [];
      
      if (walletTransactions) {
        for (const wt of walletTransactions) {
          // Extract user info from description
          const isReceived = wt.source_type === 'p2p_receive';
          const isSent = wt.source_type === 'p2p_send';
          
          if (isReceived || isSent) {
            // Parse nickname from description like "P2P transfer received from John" or "P2P transfer sent to Jane"
            const descParts = wt.description.split(isSent ? ' to ' : ' from ');
            const otherUserNickname = descParts[1] || 'Unknown';
            
            transfers.push({
              id: wt.id,
              amount_cents: Math.abs(wt.amount), // Make sure it's positive for display
              created_at: wt.created_at,
              user_id: profile.id,
              receiver_id: profile.id,
              type: isSent ? 'sent' : 'received',
              otherUser: {
                id: 'unknown',
                nickname: otherUserNickname
              }
            });
          }
        }
      }

      transfers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransfers(transfers);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('p2p.history.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {t('p2p.history.noTransfers')}
            </p>
          ) : (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {transfer.type === 'sent' ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {transfer.type === 'sent' 
                          ? t('p2p.history.sentTo', { user: transfer.otherUser?.nickname || 'Unknown' })
                          : t('p2p.history.receivedFrom', { user: transfer.otherUser?.nickname || 'Unknown' })
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transfer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={transfer.type === 'sent' ? 'destructive' : 'default'}>
                    {transfer.type === 'sent' ? '-' : '+'}{transfer.amount_cents} BTZ
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
