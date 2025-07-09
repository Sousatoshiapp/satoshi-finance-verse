import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  product_type: 'premium_subscription' | 'beetz_pack' | 'avatar' | 'powerup' | 'loot_box' | 'course_access';
  price_cents: number;
  currency: 'BRL' | 'USD' | 'EUR';
  virtual_reward: any;
  featured: boolean;
  discount_percentage: number;
}

export interface Transaction {
  id: string;
  product_id: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  virtual_rewards_data: any;
  created_at: string;
  store_products?: StoreProduct;
}

export function useVirtualStore() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  // Carregar produtos da loja
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar produtos da loja",
        variant: "destructive"
      });
    }
  };

  // Carregar histórico de transações
  const loadTransactions = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          store_products:product_id (
            name,
            description,
            product_type
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de transações",
        variant: "destructive"
      });
    }
  };

  // Comprar produto virtual (com beetz)
  const purchaseWithBeetz = async (productId: string) => {
    if (!profile?.id) return false;

    setPurchasing(true);
    try {
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Produto não encontrado');

      const beetzCost = product.price_cents / 10; // 1 beetz = 10 centavos
      
      if (profile.points < beetzCost) {
        toast({
          title: "Beetz insuficientes",
          description: `Você precisa de ${beetzCost} beetz para comprar este item`,
          variant: "destructive"
        });
        return false;
      }

      // Criar transação
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: profile.id,
          product_id: productId,
          amount_cents: product.price_cents,
          currency: product.currency,
          status: 'completed',
          virtual_rewards_data: product.virtual_reward,
          processed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Processar compra virtual
      const { data: result, error: processError } = await supabase
        .rpc('process_virtual_purchase', {
          p_user_id: profile.user_id,
          p_product_id: productId,
          p_transaction_id: transaction.id
        });

      if (processError) throw processError;

      // Debitar beetz
      const { error: debitError } = await supabase
        .from('profiles')
        .update({ points: profile.points - beetzCost })
        .eq('id', profile.id);

      if (debitError) throw debitError;

      toast({
        title: "Compra realizada!",
        description: `${product.name} adicionado ao seu inventário`,
        variant: "default"
      });

      await loadTransactions();
      return true;

    } catch (error) {
      console.error('Erro na compra:', error);
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra",
        variant: "destructive"
      });
      return false;
    } finally {
      setPurchasing(false);
    }
  };

  // Comprar com dinheiro real (Stripe)
  const purchaseWithMoney = async (productId: string) => {
    if (!profile?.id) return false;

    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          product_id: productId,
          success_url: `${window.location.origin}/store/success`,
          cancel_url: `${window.location.origin}/store`
        }
      });

      if (error) throw error;
      
      // Redirecionar para Stripe Checkout
      window.open(data.url, '_blank');
      
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar pagamento",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadTransactions();
    }
  }, [profile?.id]);

  useEffect(() => {
    setLoading(false);
  }, [products]);

  return {
    products,
    transactions,
    loading,
    purchasing,
    purchaseWithBeetz,
    purchaseWithMoney,
    refetch: () => {
      loadProducts();
      loadTransactions();
    }
  };
}