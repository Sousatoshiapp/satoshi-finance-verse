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
      console.log('🔍 Loading transfers for profile:', { id: profile.id, user_id: profile.user_id });
      
      const { data: sentTransfers, error: sentError } = await supabase
        .from('transactions')
        .select('id, amount_cents, created_at, user_id, receiver_id')
        .eq('user_id', profile.user_id)
        .eq('transfer_type', 'p2p')
        .order('created_at', { ascending: false }) as any;

      console.log('📤 Sent transfers query result:', { data: sentTransfers, error: sentError });
      if (sentError) throw sentError;

      const { data: receivedTransfers, error: receivedError } = await supabase
        .from('transactions')
        .select('id, amount_cents, created_at, user_id, receiver_id')
        .eq('receiver_id', profile.id)
        .eq('transfer_type', 'p2p')
        .order('created_at', { ascending: false }) as any;

      console.log('📥 Received transfers query result:', { data: receivedTransfers, error: receivedError });
      if (receivedError) throw receivedError;

      const allUserIds = new Set<string>();
      sentTransfers?.forEach(t => {
        if (t.receiver_id) allUserIds.add(t.receiver_id);
      });
      receivedTransfers?.forEach(t => {
        allUserIds.add(t.user_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', Array.from(allUserIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const allTransfers: Transfer[] = [
        ...(sentTransfers || []).map(t => ({
          id: t.id,
          amount_cents: t.amount_cents,
          created_at: t.created_at,
          user_id: t.user_id,
          receiver_id: t.receiver_id || '',
          type: 'sent' as const,
          otherUser: t.receiver_id ? profileMap.get(t.receiver_id) : undefined
        })),
        ...(receivedTransfers || []).map(t => ({
          id: t.id,
          amount_cents: t.amount_cents,
          created_at: t.created_at,
          user_id: t.user_id,
          receiver_id: t.receiver_id || '',
          type: 'received' as const,
          otherUser: profileMap.get(t.user_id)
        }))
      ];

      allTransfers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTransfers(allTransfers);
    } catch (error) {
      console.error('❌ Error loading transfers:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
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
