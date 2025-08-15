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
      console.log('🔄 P2P Notifications: No profile ID found');
      return;
    }
    
    console.log('🔄 P2P Notifications: Setting up stable realtime subscription for profile.id:', profile.id);
    
    // Use a stable channel name and debounce to prevent constant reconnections
    const channelName = `p2p-stable-${profile.id}`;
    let timeoutId: NodeJS.Timeout;
    
    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: profile.id,
          },
          broadcast: { self: false },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `receiver_id=eq.${profile.id}`
        },
        async (payload) => {
          console.log('📨 P2P Notification: New transaction detected:', payload);
          console.log('📨 P2P Notification: Current profile.id:', profile.id);
          console.log('📨 P2P Notification: Transaction receiver_id:', payload.new?.receiver_id);
          console.log('📨 P2P Notification: Transaction user_id (sender):', payload.new?.user_id);
          console.log('📨 P2P Notification: Transaction type:', payload.new?.transfer_type);
          console.log('📨 P2P Notification: Transaction amount:', payload.new?.amount_cents);
          
          // CRITICAL VALIDATION: Only trigger if current user is actually the receiver
          if (payload.new?.receiver_id !== profile.id) {
            console.warn('⚠️ P2P Notification: Receiver ID mismatch! Current:', profile.id, 'Transaction:', payload.new?.receiver_id);
            return;
          }
          
          // Additional validation: Make sure current user is NOT the sender
          if (payload.new?.user_id === profile.id) {
            console.warn('⚠️ P2P Notification: User is sender, not receiver. Skipping notification.');
            return;
          }
          
          if (payload.new?.transfer_type === 'p2p') {
            // Debounce to prevent duplicate notifications
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
              try {
                // Get sender profile info
                const { data: senderProfile, error: senderError } = await supabase
                  .from('profiles')
                  .select('nickname')
                  .eq('id', payload.new.user_id)
                  .single();
                  
                if (senderError) {
                  console.error('❌ P2P Notification: Error fetching sender profile:', senderError);
                  return;
                }
                  
                const senderNickname = senderProfile?.nickname || 'Unknown User';
                const amount = payload.new.amount_cents;
                
                console.log('💰 P2P Notification: ✅ VALID RECEIVE - Triggering notification');
                console.log('💰 P2P Notification: Amount:', amount, 'from:', senderNickname, 'to:', profile.nickname);
                
                await triggerReceiveNotification(amount, senderNickname);
                showP2PModal(amount, senderNickname);
              } catch (error) {
                console.error('❌ P2P Notification: Error processing notification:', error);
              }
            }, 300); // 300ms debounce
          } else {
            console.log('📨 P2P Notification: Not a P2P transaction, skipping');
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 P2P Notification subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ P2P Notifications: Successfully subscribed to realtime updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ P2P Notifications: Channel error, will retry');
        }
      });

    return () => {
      console.log('🔌 P2P Notifications: Cleaning up realtime subscription for:', profile.id);
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [profile?.id, triggerReceiveNotification, showP2PModal]);

  return { 
    triggerReceiveNotification,
    currentNotification,
    dismissP2PModal
  };
}
