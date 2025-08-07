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
    
    setLoading(true);

    try {
      console.log('Loading transfers for profile:', profile.id, 'user_id:', profile.user_id);
      
      // Get sent transfers (where current user is sender)
      const { data: sentTransfers, error: sentError } = await supabase
        .from('transactions')
        .select(`
          id, amount_cents, created_at, user_id, receiver_id, transfer_type
        `)
        .eq('user_id', profile.user_id)
        .eq('transfer_type', 'p2p')
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Get received transfers (where current user is receiver)
      const { data: receivedTransfers, error: receivedError } = await supabase
        .from('transactions')
        .select(`
          id, amount_cents, created_at, user_id, receiver_id, transfer_type
        `)
        .eq('receiver_id', profile.id)
        .eq('transfer_type', 'p2p')
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;
      
      console.log('Sent transfers:', sentTransfers);
      console.log('Received transfers:', receivedTransfers);

      // Combine and format transfers
      const transfers: Transfer[] = [];
      
      // Add sent transfers - need to get receiver nickname
      if (sentTransfers) {
        for (const transfer of sentTransfers) {
          const { data: receiverProfile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', transfer.receiver_id)
            .single();

          transfers.push({
            id: transfer.id,
            amount_cents: transfer.amount_cents,
            created_at: transfer.created_at,
            user_id: transfer.user_id,
            receiver_id: transfer.receiver_id,
            type: 'sent',
            otherUser: {
              id: transfer.receiver_id,
              nickname: receiverProfile?.nickname || 'Unknown'
            }
          });
        }
      }

      // Add received transfers - need to get sender nickname  
      if (receivedTransfers) {
        for (const transfer of receivedTransfers) {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('nickname, id')
            .eq('user_id', transfer.user_id)
            .single();

          transfers.push({
            id: transfer.id,
            amount_cents: transfer.amount_cents,
            created_at: transfer.created_at,
            user_id: transfer.user_id,
            receiver_id: transfer.receiver_id,
            type: 'received',
            otherUser: {
              id: transfer.user_id,
              nickname: senderProfile?.nickname || 'Unknown'
            }
          });
        }
      }

      // Sort by date (newest first)
      transfers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTransfers(transfers);
    } catch (error) {
      console.error('Error loading P2P transfers:', error);
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
                        {new Date(transfer.created_at).toLocaleString()}
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
