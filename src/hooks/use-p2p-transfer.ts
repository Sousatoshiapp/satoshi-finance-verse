import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useI18n } from '@/hooks/use-i18n';
import { useKYCStatus } from '@/hooks/use-kyc-status';

export interface P2PTransferResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
  sender_new_balance?: number;
  receiver_new_balance?: number;
}

export function useP2PTransfer() {
  const [transferring, setTransferring] = useState(false);
  const { toast } = useToast();
  const { profile, loadProfile } = useProfile();
  const { t } = useI18n();
  const { checkKYCRequired } = useKYCStatus();

  const transferBTZ = async (receiverId: string, amount: number): Promise<P2PTransferResult> => {
    if (!profile?.id) return { success: false, error: 'Profile not found' };

    // if (checkKYCRequired()) {
    //   toast({
    //     title: t('kyc.required'),
    //     description: t('kyc.subtitle'),
    //     variant: "destructive",
    //   });
    //   return { success: false, error: 'KYC verification required' };
    // }

    if (profile.points < amount) {
      toast({
        title: t('p2p.errors.insufficientBalance'),
        description: t('p2p.errors.insufficientBalanceDesc', { amount }),
        variant: "destructive"
      });
      return { success: false, error: 'Insufficient balance' };
    }

    if (amount <= 0) {
      toast({
        title: t('p2p.errors.invalidAmount'),
        description: t('p2p.errors.invalidAmountDesc'),
        variant: "destructive"
      });
      return { success: false, error: 'Invalid amount' };
    }

    const { data: receiverProfile, error: receiverError } = await supabase
      .from('profiles')
      .select('id, nickname')
      .eq('id', receiverId)
      .single();

    if (receiverError || !receiverProfile) {
      toast({
        title: t('p2p.errors.receiverNotFound'),
        description: t('p2p.errors.receiverNotFoundDesc'),
        variant: "destructive"
      });
      return { success: false, error: 'Receiver not found' };
    }

    if (receiverId === profile.id) {
      toast({
        title: t('p2p.errors.selfTransfer'),
        description: t('p2p.errors.selfTransferDesc'),
        variant: "destructive"
      });
      return { success: false, error: 'Cannot transfer to yourself' };
    }

    setTransferring(true);
    try {
      const { data, error } = await supabase.rpc('transfer_btz' as any, {
        sender_id: profile.id,
        receiver_id: receiverId,
        amount: amount
      });

      if (error) {
        throw error;
      }

      const result = data as any;

      if (result.success) {
        toast({
          title: t('p2p.success.transferComplete'),
          description: t('p2p.success.transferCompleteDesc', { 
            amount, 
            receiver: receiverProfile.nickname 
          }),
          variant: "default"
        });
        
        await loadProfile();
        
        return {
          success: true,
          transaction_id: result.transaction_id,
          sender_new_balance: result.sender_new_balance,
          receiver_new_balance: result.receiver_new_balance
        };
      } else {
        throw new Error(result.error || 'Transfer failed');
      }

    } catch (error: any) {
      toast({
        title: t('p2p.errors.transferFailed'),
        description: error.message || t('p2p.errors.transferFailedDesc'),
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
