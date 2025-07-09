import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';

export interface AffiliateProgram {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  total_referrals: number;
  total_commission_earned: number;
  is_active: boolean;
  created_at: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  transaction_id: string;
  commission_amount_cents: number;
  status: string;
  paid_at?: string;
  created_at: string;
  transactions?: {
    amount_cents: number;
    store_products?: {
      name: string;
    };
  };
}

export function useAffiliateProgram() {
  const [program, setProgram] = useState<AffiliateProgram | null>(null);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  // Carregar programa de afiliado
  const loadAffiliateProgram = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_programs')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProgram(data || null);
    } catch (error) {
      console.error('Erro ao carregar programa de afiliado:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar programa de afiliado",
        variant: "destructive"
      });
    }
  };

  // Carregar comissões
  const loadCommissions = async () => {
    if (!program?.id) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_commissions')
        .select(`
          *,
          transactions (
            amount_cents,
            store_products (
              name
            )
          )
        `)
        .eq('affiliate_id', program.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar comissões",
        variant: "destructive"
      });
    }
  };

  // Criar programa de afiliado
  const createAffiliateProgram = async () => {
    if (!profile?.user_id || program) return false;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .rpc('create_affiliate_program', {
          p_user_id: profile.user_id
        });

      if (error) throw error;

      toast({
        title: "Programa criado!",
        description: `Seu código de referral: ${data}`,
        variant: "default"
      });

      await loadAffiliateProgram();
      return true;

    } catch (error) {
      console.error('Erro ao criar programa:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar programa de afiliado",
        variant: "destructive"
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Gerar link de referral
  const generateReferralLink = (page: string = '') => {
    if (!program?.referral_code) return '';
    
    const baseUrl = window.location.origin;
    const path = page ? `/${page}` : '';
    return `${baseUrl}${path}?ref=${program.referral_code}`;
  };

  // Copiar link de referral
  const copyReferralLink = async (page: string = '') => {
    const link = generateReferralLink(page);
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copiado!",
        description: "Link de referral copiado para a área de transferência",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast({
        title: "Erro",
        description: "Falha ao copiar link",
        variant: "destructive"
      });
    }
  };

  // Calcular estatísticas
  const getStats = () => {
    if (!program) return null;

    const totalEarned = program.total_commission_earned / 100; // converter centavos para reais
    const pendingCommissions = commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commission_amount_cents, 0) / 100;
    
    const paidCommissions = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commission_amount_cents, 0) / 100;

    return {
      totalReferrals: program.total_referrals,
      totalEarned,
      pendingCommissions,
      paidCommissions,
      commissionRate: program.commission_rate * 100, // converter para porcentagem
      activeProgram: program.is_active
    };
  };

  useEffect(() => {
    if (profile?.id) {
      loadAffiliateProgram();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (program?.id) {
      loadCommissions();
    }
  }, [program?.id]);

  useEffect(() => {
    setLoading(false);
  }, [program]);

  return {
    program,
    commissions,
    loading,
    creating,
    hasProgram: !!program,
    createAffiliateProgram,
    generateReferralLink,
    copyReferralLink,
    getStats,
    refetch: () => {
      loadAffiliateProgram();
      if (program?.id) {
        loadCommissions();
      }
    }
  };
}