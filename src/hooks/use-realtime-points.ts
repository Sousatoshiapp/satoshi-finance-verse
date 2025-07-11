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
      setIsLoading(false);
      return;
    }

    // Fetch initial points
    const fetchInitialPoints = async () => {
      try {
        console.log('🔍 Buscando pontos iniciais para user:', user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          console.log('📊 Pontos iniciais carregados:', profile.points);
          setPoints(profile.points || 0);
        }
      } catch (error) {
        console.error('Error fetching initial points:', error);
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
            currentStatePoints: points,
            timestamp: Date.now()
          });
          
          if (typeof newPoints === 'number' && newPoints !== oldPoints) {
            console.log('💰 ATUALIZANDO pontos via realtime:', { 
              old: oldPoints, 
              new: newPoints, 
              difference: newPoints - oldPoints,
              timestamp: Date.now()
            });
            
            // FORÇA a atualização dos pontos
            console.log('🚀 Chamando setPoints com:', newPoints);
            setPoints(newPoints);
            console.log('✅ setPoints chamado! Points devem ser:', newPoints);
            
            // Invalidate dashboard data to refresh all components
            console.log('🔄 Invalidando queries...');
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
            console.log('✅ Queries invalidadas!');
            
            // Force re-render with timeout
            setTimeout(() => {
              console.log('⏱️ Timeout check - Points state:', points, 'Expected:', newPoints);
            }, 100);
            
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
  }, [user, queryClient]);

  return { points, isLoading };
}