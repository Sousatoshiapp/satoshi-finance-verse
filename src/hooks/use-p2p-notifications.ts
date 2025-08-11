import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import confetti from 'canvas-confetti';
import { useI18n } from '@/hooks/use-i18n';

interface P2PNotification {
  amount: number;
  senderNickname: string;
}

export function useP2PNotifications() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const [currentNotification, setCurrentNotification] = useState<P2PNotification | null>(null);

  const showP2PModal = (amount: number, senderNickname: string) => {
    setCurrentNotification({ amount, senderNickname });
  };

  const dismissP2PModal = () => {
    setCurrentNotification(null);
  };

  const triggerReceiveNotification = async (amount: number, senderNickname: string) => {
    console.log('🎉 P2P Notification: Triggering receive notification', { amount, senderNickname });
    
    // Enhanced confetti effect - multiple bursts
    const colors = ['#adff2f', '#32cd32', '#00ff00', '#90EE90', '#98FB98'];
    
    // First burst
    confetti({
      particleCount: 600,
      spread: 90,
      origin: { y: 0.5 },
      colors: colors,
      scalar: 0.3
    });
    
    // Second burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 400,
        spread: 60,
        origin: { y: 0.7 },
        colors: colors,
        scalar: 0.2
      });
    }, 250);
    
    // Third burst
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 45,
        origin: { y: 0.4 },
        colors: colors,
        scalar: 0.35
      });
    }, 500);

    // Vibration for mobile devices - enhanced pattern
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
      console.log('📱 P2P Notification: Mobile vibration triggered');
    }

    // Browser notification with error handling
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notificationTitle = t('p2p.notifications.received.title', { amount }) || `You received ${amount} BTZ!`;
        const notificationBody = t('p2p.notifications.received.body', { amount, senderNickname }) || `${senderNickname} sent you ${amount} BTZ`;
        
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/icon-192.png',
          tag: 'p2p-received'
        });
        console.log('🔔 P2P Notification: Browser notification sent', { notificationTitle, notificationBody });
      }
    } catch (error) {
      console.error('🚨 P2P Notification: Browser notification error:', error);
    }

    if (profile?.id) {
      try {
        const notificationTitle = t('p2p.notifications.received.title', { amount }) || `You received ${amount} BTZ!`;
        const notificationMessage = t('p2p.notifications.received.body', { amount, senderNickname }) || `${senderNickname} sent you ${amount} BTZ`;
        
        await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            type: 'p2p_received',
            title: notificationTitle,
            message: notificationMessage,
            is_read: false
          });
        console.log('💾 P2P Notification: Database notification saved');
      } catch (error) {
        console.error('🚨 P2P Notification: Error saving to database:', error);
      }
    } else {
      console.warn('⚠️ P2P Notification: No profile ID found, skipping database save');
    }
  };

  useEffect(() => {
    if (!profile?.id) {
      console.log('P2P Notifications: No profile ID found');
      return;
    }
    
    console.log('P2P Notifications: Setting up channel for profile:', profile.id);
    
    const channel = supabase
      .channel(`p2p-transfers-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `receiver_id=eq.${profile.id}`
      }, (payload) => {
        console.log('P2P Notifications: Received transaction:', payload);
        
        if (payload.new.transfer_type === 'p2p') {
          const fetchSenderProfile = async () => {
            try {
              console.log('P2P Notifications: Fetching sender profile for user_id:', payload.new.user_id);
              
              const { data: senderProfile, error } = await supabase
                .from('profiles')
                .select('nickname, id, user_id')
                .eq('user_id', payload.new.user_id)
                .single();
              
              if (error) {
                console.error('P2P Notifications: Error fetching sender profile:', error);
              }
              
              console.log('P2P Notifications: Sender profile found:', senderProfile);
              
              await triggerReceiveNotification(
                payload.new.amount_cents,
                senderProfile?.nickname || 'Unknown'
              );
              
              // Show P2P modal
              showP2PModal(
                payload.new.amount_cents,
                senderProfile?.nickname || 'Unknown'
              );
            } catch (error) {
              console.error('P2P Notifications: Exception fetching sender profile:', error);
              await triggerReceiveNotification(
                payload.new.amount_cents,
                'Unknown'
              );
              
              // Show P2P modal
              showP2PModal(payload.new.amount_cents, 'Unknown');
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

  return { 
    triggerReceiveNotification,
    currentNotification,
    dismissP2PModal
  };
}
