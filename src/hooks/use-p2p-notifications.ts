import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import confetti from 'canvas-confetti';
import { useI18n } from '@/hooks/use-i18n';

export function useP2PNotifications(onTransferReceived?: (amount: number, senderNickname: string) => void) {
  const { profile } = useProfile();
  const { sendLocalNotification } = usePushNotifications();
  const { t } = useI18n();

  const triggerReceiveNotification = (amount: number, senderNickname: string) => {
    console.log('🎉 triggerReceiveNotification: Starting notification sequence', { amount, senderNickname });
    
    console.log('🎊 triggerReceiveNotification: Triggering confetti');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#adff2f', '#32cd32', '#00ff00']
    });

    console.log('📱 triggerReceiveNotification: Sending local notification');
    sendLocalNotification({
      title: t('p2p.notifications.received.title'),
      body: t('p2p.notifications.received.body', { amount, sender: senderNickname }),
      icon: '/icon-192.png',
      tag: 'p2p-received'
    });

    if (onTransferReceived) {
      console.log('🔔 triggerReceiveNotification: Calling onTransferReceived callback');
      onTransferReceived(amount, senderNickname);
    } else {
      console.log('⚠️ triggerReceiveNotification: No onTransferReceived callback provided');
    }
    
    console.log('✅ triggerReceiveNotification: Notification sequence completed');
  };

  useEffect(() => {
    console.log('🔔 useP2PNotifications: Setting up subscription', { profileId: profile?.id });
    
    if (!profile?.id) {
      console.log('❌ useP2PNotifications: No profile.id, skipping subscription setup');
      return;
    }

    console.log('✅ useP2PNotifications: Creating subscription channel for receiver_id:', profile.id);
    
    const channel = supabase
      .channel('p2p-transfers')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `receiver_id=eq.${profile.id}`
      }, (payload) => {
        console.log('📨 useP2PNotifications: Received INSERT event', payload);
        
        if (payload.new.transfer_type === 'p2p') {
          console.log('💰 useP2PNotifications: P2P transfer detected, fetching sender profile');
          
          supabase
            .from('profiles')
            .select('nickname')
            .eq('user_id', payload.new.user_id)
            .single()
            .then(({ data: senderProfile }) => {
              console.log('👤 useP2PNotifications: Sender profile fetched', senderProfile);
              
              triggerReceiveNotification(
                payload.new.amount_cents,
                senderProfile?.nickname || 'Unknown'
              );
            });
        } else {
          console.log('⚠️ useP2PNotifications: Non-P2P transfer, ignoring', payload.new.transfer_type);
        }
      })
      .subscribe();

    console.log('📡 useP2PNotifications: Subscription created', channel);

    return () => {
      console.log('🔌 useP2PNotifications: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return { triggerReceiveNotification };
}
