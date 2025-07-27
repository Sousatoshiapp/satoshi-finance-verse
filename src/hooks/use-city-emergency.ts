import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CityEmergencyEvent {
  id: string;
  title: string;
  description: string;
  crisis_type: string;
  duration_hours: number;
  btz_goal: number;
  xp_goal: number;
  current_btz_contributions: number;
  current_xp_contributions: number;
  reward_multiplier: number;
  penalty_multiplier: number;
  is_active: boolean;
  theme_data: any;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface CityEmergencyContribution {
  id: string;
  emergency_id: string;
  user_id: string;
  btz_contributed: number;
  xp_contributed: number;
  contribution_type: string;
  heroic_action?: string;
  created_at: string;
}

export const useCityEmergencyData = () => {
  return useQuery({
    queryKey: ["active-city-emergency"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("city_emergency_events")
        .select("*")
        .eq("is_active", true)
        .gt("end_time", new Date().toISOString())
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data as CityEmergencyEvent | null;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useCityEmergencyContributions = (emergencyId?: string) => {
  return useQuery({
    queryKey: ["city-emergency-contributions", emergencyId],
    queryFn: async () => {
      if (!emergencyId) return [];
      
      const { data, error } = await supabase
        .from("city_emergency_contributions")
        .select(`
          *,
          profiles!inner(nickname, avatar_url)
        `)
        .eq("emergency_id", emergencyId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!emergencyId,
    refetchInterval: 15000,
  });
};

export const useContributeToEmergency = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      emergencyId,
      btzAmount,
      xpAmount,
      heroicAction
    }: {
      emergencyId: string;
      btzAmount: number;
      xpAmount: number;
      heroicAction?: string;
    }) => {
      // Get user profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userProfile) throw new Error('Usuário não encontrado');

      // Create contribution
      const { data, error } = await supabase
        .from('city_emergency_contributions')
        .insert({
          emergency_id: emergencyId,
          user_id: userProfile.id,
          btz_contributed: btzAmount,
          xp_contributed: xpAmount,
          contribution_type: 'manual',
          heroic_action: heroicAction
        })
        .select()
        .single();

      if (error) throw error;

      // Update user's BTZ (deduct contribution)
      if (btzAmount > 0) {
        // Get current points first
        const { data: currentUser } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', userProfile.id)
          .single();

        if (!currentUser || currentUser.points < btzAmount) {
          throw new Error('BTZ insuficiente');
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            points: currentUser.points - btzAmount 
          })
          .eq('id', userProfile.id);

        if (updateError) throw updateError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-city-emergency"] });
      queryClient.invalidateQueries({ queryKey: ["city-emergency-contributions"] });
      
      toast({
        title: "Contribuição enviada!",
        description: "Obrigado por ajudar a cidade em momentos de crise.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na contribuição",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUserEmergencyContributions = (emergencyId?: string) => {
  return useQuery({
    queryKey: ["user-emergency-contributions", emergencyId],
    queryFn: async () => {
      if (!emergencyId) return null;
      
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userProfile) return null;

      const { data, error } = await supabase
        .from("city_emergency_contributions")
        .select("*")
        .eq("emergency_id", emergencyId)
        .eq("user_id", userProfile.id);
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!emergencyId,
  });
};