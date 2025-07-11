import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimePoints() {
  console.log("🔗 useRealtimePoints hook inicializado");
  
  const { user } = useAuth();
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  console.log("🔑 User no useRealtimePoints:", user?.id);

  useEffect(() => {
    if (!user) {
      console.log("❌ Sem usuário - definindo loading como false");
      setIsLoading(false);
      setPoints(0);
      return;
    }

    // Fetch initial points
    const fetchInitialPoints = async () => {
      try {
        console.log('🔍 Buscando pontos iniciais para user:', user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();
        
        console.log('📋 Profile query result:', { profile, error });
        
        if (profile) {
          console.log('📊 Pontos iniciais carregados:', profile.points);
          setPoints(profile.points || 0);
        } else if (error) {
          console.error('❌ Erro ao buscar profile:', error);
          // Se não há profile, criar um
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ user_id: user.id, nickname: 'Usuário', points: 0 })
            .select('points')
            .single();
          
          if (newProfile) {
            console.log('✅ Profile criado com pontos:', newProfile.points);
            setPoints(newProfile.points || 0);
          } else {
            console.error('❌ Erro ao criar profile:', createError);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching initial points:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPoints();

    // Set up realtime subscription for points updates
    console.log('🔗 Configurando realtime para user:', user.id);
    const channel = supabase
      .channel(`profile-points-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Realtime points update recebido:', payload, 'Timestamp:', Date.now());
          const newPoints = payload.new.points;
          const oldPoints = payload.old.points;
          
          console.log('🔍 Analisando mudança de pontos:', {
            newPoints,
            oldPoints,
            isNumber: typeof newPoints === 'number',
            isDifferent: newPoints !== oldPoints,
            timestamp: Date.now()
          });
          
          if (typeof newPoints === 'number' && newPoints !== oldPoints) {
            console.log('💰 ATUALIZANDO pontos via realtime:', { 
              old: oldPoints, 
              new: newPoints, 
              difference: newPoints - oldPoints,
              timestamp: Date.now()
            });
            
            setPoints(newPoints);
            console.log('✅ setPoints chamado! Novos points:', newPoints);
            
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
          } else {
            console.log('⚠️ Pontos NÃO ATUALIZADOS:', { 
              reason: typeof newPoints !== 'number' ? 'not a number' : 'same value',
              newPoints, 
              oldPoints,
              timestamp: Date.now()
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
      });

    return () => {
      console.log('🔌 Desconectando realtime');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return { points, isLoading };
}