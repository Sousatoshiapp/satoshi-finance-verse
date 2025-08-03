import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import confetti from 'canvas-confetti';
import { useI18n } from '@/hooks/use-i18n';

export function useP2PNotifications() {
  const { profile } = useProfile();
  const { sendLocalNotification } = usePushNotifications();
  const { t } = useI18n();

  const triggerReceiveNotification = (amount: number, senderNickname: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#adff2f', '#32cd32', '#00ff00']
    });

    sendLocalNotification({
      title: t('p2p.notifications.received.title'),
      body: t('p2p.notifications.received.body', { amount, sender: senderNickname }),
      icon: '/icon-192.png',
      tag: 'p2p-received'
    });
  };

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('p2p-transfers')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `receiver_id=eq.${profile.id}`
      }, (payload) => {
        if (payload.new.transfer_type === 'p2p') {
          supabase
            .from('profiles')
            .select('nickname')
            .eq('user_id', payload.new.user_id)
            .single()
            .then(({ data: senderProfile }) => {
              triggerReceiveNotification(
                payload.new.amount_cents,
                senderProfile?.nickname || 'Unknown'
              );
            });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return { triggerReceiveNotification };
}
