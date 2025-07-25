import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateCryptoPaymentParams {
  productId: string;
  productName: string;
  amount: number; // in cents
  currency?: string;
  type: string;
}

interface CryptoPaymentResponse {
  success: boolean;
  payment_url?: string;
  payment_id?: string;
  crypto_amount?: number;
  crypto_currency?: string;
  address?: string;
  error?: string;
}

export function useCryptoPayments() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createCryptoPayment = async (params: CreateCryptoPaymentParams): Promise<CryptoPaymentResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: {
          productId: params.productId,
          productName: params.productName,
          amount: Math.round(params.amount * 0.95), // Apply 5% crypto discount
          currency: params.currency || 'USD',
          type: params.type
        }
      });

      if (error) {
        console.error('Crypto payment error:', error);
        toast({
          title: "Erro no pagamento",
          description: "Falha ao criar pagamento em criptomoeda. Tente novamente.",
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        toast({
          title: "Erro no pagamento",
          description: data.error || "Erro desconhecido",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Pagamento criado",
        description: "Redirecionando para página de pagamento em criptomoeda...",
      });

      return data;
    } catch (error) {
      console.error('Error creating crypto payment:', error);
      toast({
        title: "Erro inesperado",
        description: "Falha ao processar pagamento. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCryptoPayment = (paymentUrl: string) => {
    // Open in new tab to avoid losing the current session
    window.open(paymentUrl, '_blank');
  };

  return {
    isLoading,
    createCryptoPayment,
    redirectToCryptoPayment,
  };
}