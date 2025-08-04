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
    console.log('🔔 useP2PNotifications: Setting up subscription', { 
      profileId: profile?.id, 
      profileUserId: profile?.user_id 
    });
    
    if (!profile?.id) {
      console.log('❌ useP2PNotifications: No profile.id, skipping subscription setup');
      return;
    }

    console.log('✅ useP2PNotifications: Creating subscription channel for receiver_id:', profile.id);
    
    const channel = supabase
      .channel(`p2p-transfers-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `receiver_id=eq.${profile.id}`
      }, (payload) => {
        console.log('📨 useP2PNotifications: Received INSERT event', {
          payload,
          transferType: payload.new.transfer_type,
          senderId: payload.new.user_id,
          receiverId: payload.new.receiver_id,
          amount: payload.new.amount_cents
        });
        
        if (payload.new.transfer_type === 'p2p') {
          console.log('💰 useP2PNotifications: P2P transfer detected, fetching sender profile');
          
          const fetchSenderProfile = async () => {
            try {
              console.log('👤 useP2PNotifications: Looking up sender profile by user_id:', payload.new.user_id);
              
              const { data: senderProfile, error } = await supabase
                .from('profiles')
                .select('nickname, id, user_id')
                .eq('user_id', payload.new.user_id)
                .single();
              
              console.log('👤 useP2PNotifications: Sender profile query result', { 
                senderProfile, 
                error,
                queryUserId: payload.new.user_id 
              });
              
              if (error) {
                console.error('❌ useP2PNotifications: Error fetching sender profile:', error);
              }
              
              triggerReceiveNotification(
                payload.new.amount_cents,
                senderProfile?.nickname || 'Unknown'
              );
            } catch (error) {
              console.error('❌ useP2PNotifications: Exception in fetchSenderProfile:', error);
              triggerReceiveNotification(
                payload.new.amount_cents,
                'Unknown'
              );
            }
          };
          
          fetchSenderProfile();
        } else {
          console.log('⚠️ useP2PNotifications: Non-P2P transfer, ignoring', payload.new.transfer_type);
        }
      })
      .subscribe((status) => {
        console.log('📡 useP2PNotifications: Subscription status changed:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ P2P notifications subscription active for receiver_id:', profile.id);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ P2P notifications subscription error');
        }
      });

    return () => {
      console.log('🔌 useP2PNotifications: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return { triggerReceiveNotification };
}
