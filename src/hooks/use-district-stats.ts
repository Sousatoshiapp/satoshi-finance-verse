import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DistrictStats {
  totalBTZ: number;
  totalXP: number;
  rank: number;
  memberCount: number;
}

export function useDistrictStats(districtId: string | undefined) {
  const [stats, setStats] = useState<DistrictStats>({
    totalBTZ: 0,
    totalXP: 0,
    rank: 0,
    memberCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!districtId) return;

    const loadDistrictStats = async () => {
      try {
        setLoading(true);
        
        // Get total BTZ and XP for this district members
        const { data: districtMembers, error: membersError } = await supabase
          .from('user_districts')
          .select('user_id')
          .eq('district_id', districtId);

        if (membersError) throw membersError;

        if (!districtMembers || districtMembers.length === 0) {
          setStats({
            totalBTZ: 0,
            totalXP: 0,
            rank: 0,
            memberCount: 0
          });
          return;
        }

        // Get profiles for district members
        const memberIds = districtMembers.map(m => m.user_id);
        const { data: memberProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, points, xp')
          .in('id', memberIds);

        if (profilesError) throw profilesError;

        const totalBTZ = memberProfiles?.reduce((sum, profile) => 
          sum + (profile.points || 0), 0) || 0;
        
        const totalXP = memberProfiles?.reduce((sum, profile) => 
          sum + (profile.xp || 0), 0) || 0;

        // Get all districts' BTZ totals for ranking
        const { data: allUserDistricts, error: allDistrictsError } = await supabase
          .from('user_districts')
          .select('district_id, user_id');

        if (allDistrictsError) throw allDistrictsError;

        // Get all profiles
        const allUserIds = allUserDistricts?.map(ud => ud.user_id) || [];
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('id, points')
          .in('id', allUserIds);

        if (allProfilesError) throw allProfilesError;

        // Calculate BTZ totals per district
        const districtTotals: Record<string, number> = {};
        
        allUserDistricts?.forEach(ud => {
          const profile = allProfiles?.find(p => p.id === ud.user_id);
          const points = profile?.points || 0;
          
          if (!districtTotals[ud.district_id]) {
            districtTotals[ud.district_id] = 0;
          }
          districtTotals[ud.district_id] += points;
        });

        // Sort districts by BTZ total and find rank
        const sortedDistricts = Object.entries(districtTotals)
          .sort(([, a], [, b]) => b - a);
        
        const rank = sortedDistricts.findIndex(([id]) => id === districtId) + 1;

        setStats({
          totalBTZ,
          totalXP,
          rank,
          memberCount: districtMembers?.length || 0
        });

      } catch (err) {
        console.error('Error loading district stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadDistrictStats();
  }, [districtId]);

  return { stats, loading, error };
}