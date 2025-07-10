import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserLives {
  id: string;
  lives_count: number;
  last_life_recovery: string;
}

interface LifePackage {
  id: string;
  name: string;
  lives_count: number;
  price_cents: number;
  discount_percentage: number;
}

export function useLivesSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userLives, setUserLives] = useState<UserLives | null>(null);
  const [lifePackages, setLifePackages] = useState<LifePackage[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar vidas do usuário
  const loadUserLives = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: lives, error } = await supabase
        .from('user_lives')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Criar registro de vidas se não existir
        const { data: newLives } = await supabase
          .from('user_lives')
          .insert({ user_id: profile.id })
          .select()
          .single();
        
        setUserLives(newLives);
      } else if (!error) {
        setUserLives(lives);
      }
    } catch (error) {
      console.error('Error loading user lives:', error);
    }
  }, [user]);

  // Carregar pacotes de vida
  const loadLifePackages = useCallback(async () => {
    try {
      const { data: packages } = await supabase
        .from('life_packages')
        .select('*')
        .eq('is_active', true)
        .order('price_cents');

      setLifePackages(packages || []);
    } catch (error) {
      console.error('Error loading life packages:', error);
    }
  }, []);

  // Usar uma vida
  const useLife = useCallback(async (): Promise<boolean> => {
    if (!userLives || userLives.lives_count <= 0) {
      return false;
    }

    try {
      const { data: updatedLives } = await supabase
        .from('user_lives')
        .update({ 
          lives_count: userLives.lives_count - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userLives.id)
        .select()
        .single();

      if (updatedLives) {
        setUserLives(updatedLives);
        toast({
          title: "💖 Vida usada!",
          description: `Você manteve sua sequência! Vidas restantes: ${updatedLives.lives_count}`
        });
        return true;
      }
    } catch (error) {
      console.error('Error using life:', error);
      toast({
        title: "Erro",
        description: "Não foi possível usar a vida",
        variant: "destructive"
      });
    }

    return false;
  }, [userLives, toast]);

  // Verificar se tem vidas
  const hasLives = useCallback(() => {
    return userLives && userLives.lives_count > 0;
  }, [userLives]);

  // Comprar pacote de vidas
  const purchaseLifePackage = useCallback(async (packageId: string) => {
    setLoading(true);
    try {
      // Aqui seria integrado com Stripe
      // Por enquanto, apenas simular a compra
      const selectedPackage = lifePackages.find(p => p.id === packageId);
      if (!selectedPackage || !userLives) return;

      const { data: updatedLives } = await supabase
        .from('user_lives')
        .update({ 
          lives_count: userLives.lives_count + selectedPackage.lives_count,
          updated_at: new Date().toISOString()
        })
        .eq('id', userLives.id)
        .select()
        .single();

      if (updatedLives) {
        setUserLives(updatedLives);
        toast({
          title: "🎉 Compra realizada!",
          description: `+${selectedPackage.lives_count} vidas adicionadas!`
        });
      }
    } catch (error) {
      console.error('Error purchasing life package:', error);
      toast({
        title: "Erro na compra",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [lifePackages, userLives, toast]);

  // Calcular tempo para próxima vida
  const getTimeToNextLife = useCallback(() => {
    if (!userLives || userLives.lives_count >= 3) return null;

    const lastRecovery = new Date(userLives.last_life_recovery);
    const nextRecovery = new Date(lastRecovery.getTime() + (8 * 60 * 60 * 1000)); // 8 horas
    const now = new Date();

    if (nextRecovery <= now) {
      return { hours: 0, minutes: 0, ready: true };
    }

    const diff = nextRecovery.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, ready: false };
  }, [userLives]);

  useEffect(() => {
    if (user) {
      loadUserLives();
      loadLifePackages();
    }
  }, [user, loadUserLives, loadLifePackages]);

  return {
    userLives,
    lifePackages,
    loading,
    useLife,
    hasLives,
    purchaseLifePackage,
    getTimeToNextLife,
    loadUserLives
  };
}