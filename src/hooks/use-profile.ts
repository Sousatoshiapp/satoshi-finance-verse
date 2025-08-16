import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  user_id: string;
  nickname: string;
  points?: number;
  level?: number;
  xp?: number;
  streak?: number;
  profile_image_url?: string;
  // Add other profile fields as needed
}

export function useProfile() {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, nickname, points, level, xp, streak, profile_image_url')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as Profile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Return the old interface for backward compatibility
  return {
    profile: query.data,
    loading: query.isLoading,
    error: query.error,
    loadProfile: query.refetch
  };
}