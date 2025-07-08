import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MissionData {
  id: string;
  title: string;
  description: string;
  category: string;
  mission_type: string;
  target_value: number;
  xp_reward: number;
  beetz_reward: number;
  difficulty: string;
  progress?: number;
  completed?: boolean;
}

const fetchMissionsData = async (): Promise<MissionData[]> => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return [];

  // Get user profile first
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authUser.id)
    .maybeSingle();

  if (!profile) return [];

  // Get active missions with user progress in one query
  const { data: missionsWithProgress } = await supabase
    .from('daily_missions')
    .select(`
      *,
      user_mission_progress!left (
        progress,
        completed
      )
    `)
    .eq('is_active', true)
    .eq('user_mission_progress.user_id', profile.id)
    .gte('expires_at', new Date().toISOString());

  if (!missionsWithProgress) return [];

  return missionsWithProgress.map(mission => {
    const progress = mission.user_mission_progress?.[0];
    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      category: mission.category,
      mission_type: mission.mission_type,
      target_value: mission.target_value,
      xp_reward: mission.xp_reward,
      beetz_reward: mission.beetz_reward,
      difficulty: mission.difficulty,
      progress: progress?.progress || 0,
      completed: progress?.completed || false
    };
  });
};

export const useMissionsData = () => {
  return useQuery({
    queryKey: ['missions-data'],
    queryFn: fetchMissionsData,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Missions change frequently
    retry: 1
  });
};