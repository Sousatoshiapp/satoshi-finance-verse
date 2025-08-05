import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OptimizedDistrict {
  id: string;
  name: string;
  theme: string;
  color_primary: string;
  color_secondary: string;
  level_required: number;
  power_level: number;
  battles_won: number;
  sponsor_company: string;
  total_residents: number;
  total_xp: number;
  is_active: boolean;
}

export const useDistrictsOptimized = () => {
  return useQuery({
    queryKey: ['districts-optimized'],
    queryFn: async (): Promise<OptimizedDistrict[]> => {
      const { data, error } = await (supabase as any)
        .rpc('get_all_districts_optimized');

      if (error) {
        console.error('Error fetching optimized districts:', error);
        throw error;
      }

      return (data as OptimizedDistrict[]) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};
