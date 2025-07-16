import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  crisis_type: string;
  status: string;
  total_btz_goal: number;
  total_xp_goal: number;
  current_btz_contributions: number;
  current_xp_contributions: number;
  start_time: string;
  end_time: string;
  reward_data: any;
  narrative_data: any;
  is_active: boolean;
}

export interface CrisisDistrictGoal {
  id: string;
  crisis_id: string;
  district_id: string;
  btz_goal: number;
  xp_goal: number;
  current_btz: number;
  current_xp: number;
  is_completed: boolean;
  completed_at: string | null;
}

export const useCrisisData = () => {
  return useQuery({
    queryKey: ["active-crisis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crisis_events")
        .select("*")
        .eq("is_active", true)
        .eq("status", "active")
        .gt("end_time", new Date().toISOString())
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data as CrisisEvent | null;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useCrisisDistrictGoal = (districtId?: string) => {
  return useQuery({
    queryKey: ["crisis-district-goal", districtId],
    queryFn: async () => {
      if (!districtId) return null;
      
      const { data: crisisData } = await supabase
        .from("crisis_events")
        .select("id")
        .eq("is_active", true)
        .eq("status", "active")
        .maybeSingle();
      
      if (!crisisData) return null;
      
      const { data, error } = await supabase
        .from("crisis_district_goals")
        .select("*")
        .eq("crisis_id", crisisData.id)
        .eq("district_id", districtId)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data as CrisisDistrictGoal | null;
    },
    enabled: !!districtId,
    refetchInterval: 30000,
  });
};

export const useUserCrisisContribution = (userId?: string) => {
  return useQuery({
    queryKey: ["user-crisis-contribution", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data: crisisData } = await supabase
        .from("crisis_events")
        .select("id")
        .eq("is_active", true)
        .eq("status", "active")
        .maybeSingle();
      
      if (!crisisData) return null;
      
      const { data, error } = await supabase
        .from("crisis_contributions")
        .select("*")
        .eq("crisis_id", crisisData.id)
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
};