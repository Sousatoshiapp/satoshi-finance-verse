import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/shared/ui/use-toast';
import { useProfile } from '@/hooks/use-profile';

export interface P2PTransferResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
}

export function useP2PTransfer() {
  const [transferring, setTransferring] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  const transferBTZ = async (receiverId: string, amount: number): Promise<P2PTransferResult> => {
    if (!profile?.id) return { success: false, error: 'Profile not found' };

    if (profile.points < amount) {
      toast({
        title: "BTZ insuficientes",
        description: `Você precisa de ${amount} BTZ para realizar esta transferência`,
        variant: "destructive"
      });
      return { success: false, error: 'Insufficient balance' };
    }

    if (amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero",
        variant: "destructive"
      });
      return { success: false, error: 'Invalid amount' };
    }

    setTransferring(true);
    try {
      const { data, error } = await supabase.rpc('transfer_btz', {
        sender_id: profile.id,
        receiver_id: receiverId,
        amount: amount
      }) as { data: any, error: any };

      if (error) throw error;

      if (!data?.success) {
        toast({
          title: "Erro na transferência",
          description: data?.error || "Falha ao processar transferência",
          variant: "destructive"
        });
        return { success: false, error: data?.error };
      }

      toast({
        title: "Transferência realizada!",
        description: `${amount} BTZ transferidos com sucesso`,
        variant: "default"
      });

      return { success: true, transaction_id: data.transaction_id };

    } catch (error: any) {
      console.error('Transfer error:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar transferência",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setTransferring(false);
    }
  };

  return {
    transferBTZ,
    transferring
  };
}
