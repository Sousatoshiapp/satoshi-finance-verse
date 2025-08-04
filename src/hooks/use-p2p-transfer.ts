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
      console.log('💸 useP2PTransfer: Starting transfer_btz RPC call', {
        sender_id: profile.id,
        receiver_id: receiverId,
        amount: amount,
        sender_profile: profile
      });

      const { data, error } = await supabase.rpc('transfer_btz' as any, {
        sender_id: profile.id,
        receiver_id: receiverId,
        amount: amount
      });

      console.log('💸 useP2PTransfer: transfer_btz RPC result', {
        data,
        error,
        success: data?.success,
        transaction_id: data?.transaction_id
      });

      if (error) {
        console.error('❌ useP2PTransfer: RPC error:', error);
        throw error;
      }

      const result = data as any;
      console.log('💸 useP2PTransfer: Processing RPC result', {
        result,
        success: result?.success,
        error: result?.error
      });

      if (result.success) {
        console.log('✅ useP2PTransfer: Transfer successful, showing success toast');
        
        toast({
          title: t('p2p.success.transferComplete'),
          description: t('p2p.success.transferCompleteDesc', { 
            amount, 
            receiver: receiverProfile.nickname 
          }),
          variant: "default"
        });
        
        console.log('🔄 useP2PTransfer: Reloading profile after successful transfer');
        await loadProfile();
        
        console.log('✅ useP2PTransfer: Transfer completed successfully', {
          amount,
          receiver: receiverId,
          transaction_id: result.transaction_id,
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          transaction_id: result.transaction_id,
          sender_new_balance: result.sender_new_balance,
          receiver_new_balance: result.receiver_new_balance
        };
      } else {
        console.error('❌ useP2PTransfer: Transfer failed with result error:', result.error);
        throw new Error(result.error || 'Transfer failed');
      }

    } catch (error: any) {
      console.error('❌ useP2PTransfer: Transfer exception:', error);
      console.error('❌ useP2PTransfer: Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
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
