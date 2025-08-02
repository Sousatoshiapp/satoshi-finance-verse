import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';

interface Transfer {
  id: string;
  amount_cents: number;
  created_at: string;
  user_id: string;
  type: 'sent' | 'received';
  otherUser?: {
    nickname: string;
  };
}

export function TransferHistory() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.id) {
      loadTransfers();
    }
  }, [profile?.id]);

  const loadTransfers = async () => {
    if (!profile?.id) return;

    try {
      setTransfers([]);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Transferências
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma transferência P2P encontrada
            </p>
          ) : (
            <div className="space-y-3">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">
                        Transferência BTZ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transfer.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    -{transfer.amount_cents} BTZ
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
