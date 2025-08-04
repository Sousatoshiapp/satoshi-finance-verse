import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import confetti from 'canvas-confetti';
import { useI18n } from '@/hooks/use-i18n';

export function useP2PNotifications(
  onTransferReceived?: (amount: number, senderNickname: string) => void,
  onDebugEvent?: (message: string, type: 'info' | 'success' | 'error') => void
) {
  const { profile } = useProfile();
  const { t } = useI18n();

  const triggerReceiveNotification = (amount: number, senderNickname: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#adff2f', '#32cd32', '#00ff00']
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(t('p2p.notifications.received.title'), {
        body: t('p2p.notifications.received.body', { amount, sender: senderNickname }),
        icon: '/icon-192.png',
        tag: 'p2p-received'
      });
    }

    if (onTransferReceived) {
      onTransferReceived(amount, senderNickname);
    }
  };

  useEffect(() => {
    if (!profile?.id) {
      return;
    }
    
    const channel = supabase
      .channel(`p2p-transfers-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `receiver_id=eq.${profile.id}`
      }, (payload) => {
        if (payload.new.transfer_type === 'p2p') {
          const fetchSenderProfile = async () => {
            try {
              const { data: senderProfile, error } = await supabase
                .from('profiles')
                .select('nickname, id, user_id')
                .eq('user_id', payload.new.user_id)
                .single();
              
              triggerReceiveNotification(
                payload.new.amount_cents,
                senderProfile?.nickname || 'Unknown'
              );
            } catch (error) {
              triggerReceiveNotification(
                payload.new.amount_cents,
                'Unknown'
              );
            }
          };
          
          fetchSenderProfile();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return { triggerReceiveNotification };
}
