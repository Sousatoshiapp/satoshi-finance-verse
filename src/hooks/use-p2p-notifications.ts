import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import confetti from 'canvas-confetti';
import { useI18n } from '@/hooks/use-i18n';

export function useP2PNotifications(
  onTransferReceived?: (amount: number, senderNickname: string) => void
) {
  const { profile } = useProfile();
  const { t } = useI18n();

  const triggerReceiveNotification = (amount: number, senderNickname: string) => {
    // Enhanced confetti effect - multiple bursts
    const colors = ['#adff2f', '#32cd32', '#00ff00', '#90EE90', '#98FB98'];
    
    // First burst
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: colors,
      scalar: 1.2
    });
    
    // Second burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: colors,
        scalar: 0.8
      });
    }, 250);
    
    // Third burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.4 },
        colors: colors,
        scalar: 1.5
      });
    }, 500);

    // Vibration for mobile devices - enhanced pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(t('p2p.notifications.received.title', { amount }), {
        body: t('p2p.notifications.received.body', { amount }),
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
