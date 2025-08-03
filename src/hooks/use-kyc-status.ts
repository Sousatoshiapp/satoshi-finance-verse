import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './use-profile';

export function useKYCStatus() {
  const { profile, loadProfile } = useProfile();
  
  const checkKYCRequired = () => {
    return profile?.kyc_status !== 'approved';
  };
  
  const updateKYCStatus = async (inquiryId: string) => {
    await supabase
      .from('profiles')
      .update({ 
        persona_inquiry_id: inquiryId,
        kyc_status: 'pending'
      })
      .eq('id', profile?.id);
    
    await loadProfile();
  };
  
  return { checkKYCRequired, updateKYCStatus };
}
