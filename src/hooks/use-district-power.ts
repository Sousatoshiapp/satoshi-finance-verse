import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';

export function useDistrictPower() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const updateDistrictPower = async (districtId: string, actionType: string) => {
    setIsUpdating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t('errors.notAuthenticated'));

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error(t('errors.profileNotFound'));

      const response = await supabase.functions.invoke('update-district-power', {
        body: {
          districtId,
          userId: profile.id,
          actionType
        }
      });

      if (response.error) throw response.error;

      toast({
        title: t('district.powers.updated'),
        description: t('district.powers.updatedDesc'),
      });

      return response.data;
    } catch (error: any) {
      toast({
        title: t('district.powers.updateError'),
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateDistrictPower, isUpdating };
}
