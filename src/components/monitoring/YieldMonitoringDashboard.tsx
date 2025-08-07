import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';

interface YieldAnomaly {
  profile_id: string;
  yield_amount: number;
  issue_type: string;
}

export function YieldMonitoringDashboard() {
  const [anomalies, setAnomalies] = useState<YieldAnomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAnomalies();
    
    // Check every 5 minutes
    const interval = setInterval(checkAnomalies, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAnomalies = async () => {
    try {
      const { data, error } = await supabase.rpc('monitor_yield_anomalies');
      
      if (error) {
        console.error('Error checking yield anomalies:', error);
        return;
      }

      setAnomalies(data || []);
    } catch (error) {
      console.error('Error in checkAnomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (anomalies.length === 0) return null;

  const yieldAboveCapCount = anomalies.filter(a => a.issue_type === 'yield_above_cap').length;
  const anomalousRateCount = anomalies.filter(a => a.issue_type === 'anomalous_rate').length;

  return (
    <div className="border border-orange-500/50 bg-orange-500/10 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-orange-700">
            Anomalias detectadas no sistema de yield:
          </span>
          <div className="flex gap-2">
            {yieldAboveCapCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                {yieldAboveCapCount} acima do cap
              </span>
            )}
            {anomalousRateCount > 0 && (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs">
                {anomalousRateCount} taxa suspeita
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}