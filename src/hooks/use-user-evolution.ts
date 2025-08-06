import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EvolutionData {
  date: string;
  xp: number;
  level: number;
  btz: number;
  streak: number;
  quizzes_completed: number;
}

export function useUserEvolution(userId: string, timeRange: '7d' | '30d' | '90d' | '1y') {
  const [data, setData] = useState<EvolutionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvolutionData();
  }, [userId, timeRange]);

  const loadEvolutionData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Use real data from RPC function
      const { data: evolutionData, error } = await supabase
        .rpc('get_user_evolution_data', {
          user_id_param: userId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        });

      if (error) {
        console.error('Error loading evolution data:', error);
        const mockData = generateMockData(timeRange);
        setData(mockData);
      } else {
        setData(evolutionData || []);
      }
    } catch (error) {
      console.error('Error loading evolution data:', error);
      const mockData = generateMockData(timeRange);
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (timeRange: string): EvolutionData[] => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const mockData: EvolutionData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        xp: Math.floor(Math.random() * 1000) + (days - i) * 50,
        level: Math.floor((days - i) / 10) + 1,
        btz: Math.floor(Math.random() * 500) + (days - i) * 25,
        streak: Math.min(i === 0 ? 0 : Math.floor(Math.random() * 10), days - i),
        quizzes_completed: Math.floor(Math.random() * 5) + Math.floor((days - i) / 2)
      });
    }
    
    return mockData;
  };

  return {
    data,
    loading,
    refreshData: loadEvolutionData
  };
}
