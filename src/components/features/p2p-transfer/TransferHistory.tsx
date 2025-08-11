import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { formatBTZDisplay } from "@/utils/btz-formatter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";

interface Transfer {
  id: string;
  amount: number;
  created_at: string;
  user_id: string;
  receiver_id: string;
  type: 'sent' | 'received';
  sender_nickname?: string;
  receiver_nickname?: string;
}

type FilterType = 'all' | 'sent' | 'received';

export function TransferHistory() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.id) {
      loadTransfers();
    }
  }, [profile?.id]);

  // Auto-refresh transfers when new P2P transactions occur
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`transfer-history-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          if (payload.new?.transfer_type === 'p2p') {
            setTimeout(() => loadTransfers(), 1000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `receiver_id=eq.${profile.id}`
        },
        (payload) => {
          if (payload.new?.transfer_type === 'p2p') {
            setTimeout(() => loadTransfers(), 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const loadTransfers = async () => {
    if (!profile?.id) return;
    
    setLoading(true);

    try {
      // Get sent transfers (where current user is sender)
      const { data: sentTransfers, error: sentError } = await supabase
        .from('transactions')
        .select(`
          id, amount_cents, created_at, user_id, receiver_id, transfer_type
        `)
        .eq('user_id', profile.id)
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
            amount: transfer.amount_cents,
            created_at: transfer.created_at,
            user_id: transfer.user_id,
            receiver_id: transfer.receiver_id,
            type: 'sent',
            receiver_nickname: receiverProfile?.nickname || 'Unknown'
          });
        }
      }

      // Add received transfers - need to get sender nickname  
      if (receivedTransfers) {
        for (const transfer of receivedTransfers) {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', transfer.user_id)
            .single();

          transfers.push({
            id: transfer.id,
            amount: transfer.amount_cents,
            created_at: transfer.created_at,
            user_id: transfer.user_id,
            receiver_id: transfer.receiver_id,
            type: 'received',
            sender_nickname: senderProfile?.nickname || 'Unknown'
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

  const filteredTransfers = transfers.filter(transfer => {
    if (filter === 'all') return true;
    if (filter === 'sent') return transfer.type === 'sent';
    if (filter === 'received') return transfer.type === 'received';
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transferências</CardTitle>
        <CardDescription>
          Suas transferências P2P mais recentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            Todos
          </Button>
          <Button
            variant={filter === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('sent')}
            className="text-xs"
          >
            Enviados
          </Button>
          <Button
            variant={filter === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('received')}
            className="text-xs"
          >
            Recebidos
          </Button>
        </div>

        {filteredTransfers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'Nenhuma transferência encontrada' 
                : `Nenhuma transferência ${filter === 'sent' ? 'enviada' : 'recebida'} encontrada`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransfers.map((transfer) => {
              const isSent = transfer.type === 'sent';
              const otherUser = isSent ? transfer.receiver_nickname : transfer.sender_nickname;
              
              return (
                <div key={transfer.id} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-full ${isSent ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                      {isSent ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base truncate">
                        {isSent ? 'Enviado para' : 'Recebido de'} {otherUser}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {format(new Date(transfer.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-semibold text-sm md:text-base ${isSent ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {isSent ? '-' : '+'}{formatBTZDisplay(transfer.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}