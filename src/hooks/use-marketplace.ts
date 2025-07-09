import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';

export interface CollectibleItem {
  id: string;
  name: string;
  description: string;
  rarity: string;
  category: string;
  image_url?: string;
  attributes: any;
  mint_price_beetz: number;
  total_supply: number;
  current_supply: number;
  is_mintable: boolean;
}

export interface UserCollectible {
  id: string;
  user_id: string;
  collectible_id: string;
  token_id?: string;
  is_listed_for_sale: boolean;
  sale_price_beetz?: number;
  acquired_at: string;
  collectible_items?: CollectibleItem;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  user_collectible_id: string;
  price_beetz: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  user_collectibles?: UserCollectible & {
    collectible_items?: CollectibleItem;
  };
  profiles?: {
    nickname: string;
    avatar_id?: string;
  };
}

export interface MarketplaceSale {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price_beetz: number;
  platform_fee_beetz: number;
  completed_at: string;
  user_collectibles?: UserCollectible & {
    collectible_items?: CollectibleItem;
  };
}

export function useMarketplace() {
  const [collectibles, setCollectibles] = useState<CollectibleItem[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<UserCollectible[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [sales, setSales] = useState<MarketplaceSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();

  // Carregar itens colecionáveis disponíveis
  const loadCollectibles = async () => {
    try {
      const { data, error } = await supabase
        .from('collectible_items')
        .select('*')
        .eq('is_mintable', true)
        .order('rarity', { ascending: false });

      if (error) throw error;
      setCollectibles(data || []);
    } catch (error) {
      console.error('Erro ao carregar colecionáveis:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar itens colecionáveis",
        variant: "destructive"
      });
    }
  };

  // Carregar colecionáveis do usuário
  const loadUserCollectibles = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_collectibles')
        .select(`
          *,
          collectible_items (*)
        `)
        .eq('user_id', profile.id)
        .order('acquired_at', { ascending: false });

      if (error) throw error;
      setUserCollectibles(data || []);
    } catch (error) {
      console.error('Erro ao carregar colecionáveis do usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar seus colecionáveis",
        variant: "destructive"
      });
    }
  };

  // Carregar listagens do marketplace
  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          user_collectibles (
            *,
            collectible_items (*)
          ),
          profiles!seller_id (
            nickname,
            avatar_id
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings((data || []) as MarketplaceListing[]);
    } catch (error) {
      console.error('Erro ao carregar listagens:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar listagens do marketplace",
        variant: "destructive"
      });
    }
  };

  // Carregar histórico de vendas
  const loadSales = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_sales')
        .select(`
          *,
          user_collectibles (
            *,
            collectible_items (*)
          )
        `)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setSales((data || []) as MarketplaceSale[]);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar histórico de vendas",
        variant: "destructive"
      });
    }
  };

  // Mintar novo item colecionável
  const mintCollectible = async (collectibleId: string) => {
    if (!profile?.id) return false;

    setProcessing(true);
    try {
      const collectible = collectibles.find(c => c.id === collectibleId);
      if (!collectible) throw new Error('Item não encontrado');

      if (profile.points < collectible.mint_price_beetz) {
        toast({
          title: "Beetz insuficientes",
          description: `Você precisa de ${collectible.mint_price_beetz} beetz para mintar este item`,
          variant: "destructive"
        });
        return false;
      }

      if (collectible.current_supply >= collectible.total_supply) {
        toast({
          title: "Esgotado",
          description: "Este item não está mais disponível",
          variant: "destructive"
        });
        return false;
      }

      // Criar item do usuário
      const { error: mintError } = await supabase
        .from('user_collectibles')
        .insert({
          user_id: profile.id,
          collectible_id: collectibleId,
          token_id: `${collectibleId}-${Date.now()}`
        });

      if (mintError) throw mintError;

      // Debitar beetz
      const { error: debitError } = await supabase
        .from('profiles')
        .update({ points: profile.points - collectible.mint_price_beetz })
        .eq('id', profile.id);

      if (debitError) throw debitError;

      // Atualizar supply
      const { error: supplyError } = await supabase
        .from('collectible_items')
        .update({ current_supply: collectible.current_supply + 1 })
        .eq('id', collectibleId);

      if (supplyError) throw supplyError;

      toast({
        title: "Item mintado!",
        description: `${collectible.name} foi adicionado à sua coleção`,
        variant: "default"
      });

      await loadUserCollectibles();
      await loadCollectibles();
      return true;

    } catch (error) {
      console.error('Erro ao mintar item:', error);
      toast({
        title: "Erro",
        description: "Falha ao mintar item",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Listar item para venda
  const listForSale = async (userCollectibleId: string, priceBeetz: number) => {
    if (!profile?.id) return false;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          seller_id: profile.id,
          user_collectible_id: userCollectibleId,
          price_beetz: priceBeetz,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
        });

      if (error) throw error;

      // Atualizar status do item
      const { error: updateError } = await supabase
        .from('user_collectibles')
        .update({ 
          is_listed_for_sale: true,
          sale_price_beetz: priceBeetz
        })
        .eq('id', userCollectibleId);

      if (updateError) throw updateError;

      toast({
        title: "Item listado!",
        description: "Seu item foi listado no marketplace",
        variant: "default"
      });

      await loadUserCollectibles();
      await loadListings();
      return true;

    } catch (error) {
      console.error('Erro ao listar item:', error);
      toast({
        title: "Erro",
        description: "Falha ao listar item para venda",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Comprar item do marketplace
  const buyFromMarketplace = async (listingId: string) => {
    if (!profile?.id) return false;

    setProcessing(true);
    try {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) throw new Error('Listagem não encontrada');

      if (profile.points < listing.price_beetz) {
        toast({
          title: "Beetz insuficientes",
          description: `Você precisa de ${listing.price_beetz} beetz para comprar este item`,
          variant: "destructive"
        });
        return false;
      }

      const platformFee = Math.floor(listing.price_beetz * 0.05); // 5% de taxa
      const sellerAmount = listing.price_beetz - platformFee;

      // Transferir item para o comprador
      const { error: transferError } = await supabase
        .from('user_collectibles')
        .update({
          user_id: profile.id,
          is_listed_for_sale: false,
          sale_price_beetz: null
        })
        .eq('id', listing.user_collectible_id);

      if (transferError) throw transferError;

      // Desativar listagem
      const { error: listingError } = await supabase
        .from('marketplace_listings')
        .update({ is_active: false })
        .eq('id', listingId);

      if (listingError) throw listingError;

      // Registrar venda
      const { error: saleError } = await supabase
        .from('marketplace_sales')
        .insert({
          listing_id: listingId,
          buyer_id: profile.id,
          seller_id: listing.seller_id,
          price_beetz: listing.price_beetz,
          platform_fee_beetz: platformFee
        });

      if (saleError) throw saleError;

      // Debitar beetz do comprador
      const { error: debitError } = await supabase
        .from('profiles')
        .update({ points: profile.points - listing.price_beetz })
        .eq('id', profile.id);

      if (debitError) throw debitError;

      // Creditar beetz ao vendedor
      const { error: creditError } = await supabase
        .rpc('update_profile_points', {
          profile_id: listing.seller_id,
          points_to_add: sellerAmount
        });

      if (creditError) throw creditError;

      toast({
        title: "Compra realizada!",
        description: "Item adicionado à sua coleção",
        variant: "default"
      });

      await loadUserCollectibles();
      await loadListings();
      await loadSales();
      return true;

    } catch (error) {
      console.error('Erro na compra:', error);
      toast({
        title: "Erro",
        description: "Falha ao comprar item",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadCollectibles();
    loadListings();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadUserCollectibles();
      loadSales();
    }
  }, [profile?.id]);

  useEffect(() => {
    setLoading(false);
  }, [collectibles, listings]);

  return {
    collectibles,
    userCollectibles,
    listings,
    sales,
    loading,
    processing,
    mintCollectible,
    listForSale,
    buyFromMarketplace,
    refetch: () => {
      loadCollectibles();
      loadUserCollectibles();
      loadListings();
      loadSales();
    }
  };
}