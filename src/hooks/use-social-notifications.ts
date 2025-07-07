import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

interface UnreadCounts {
  total: number;
  messages: number;
  social: number;
  system: number;
}

export function useSocialNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    total: 0,
    messages: 0,
    social: 0,
    system: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadNotifications();
      loadUnreadCounts();
      setupRealtimeSubscription();
    }
  }, [currentUserId]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setCurrentUserId(profile.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadNotifications = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    if (!currentUserId) return;

    try {
      // Total unread notifications
      const { count: totalCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false);

      // Unread messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', currentUserId)
        .eq('conversation_id', 'temp'); // Simplified for now

      // Unread social notifications
      const { count: socialCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false)
        .in('type', ['like', 'comment', 'follow', 'mention']);

      // Unread system notifications
      const { count: systemCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false)
        .in('type', ['system', 'challenge', 'badge']);

      setUnreadCounts({
        total: totalCount || 0,
        messages: messagesCount || 0,
        social: socialCount || 0,
        system: systemCount || 0
      });
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
          
          // Update unread counts
          loadUnreadCounts();
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });

          // Play notification sound (optional)
          if ('Notification' in window && Notification.permission === 'granted') {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`
        },
        () => {
          loadNotifications();
          loadUnreadCounts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          
          // Only show notification if message is not from current user
          if (newMessage.sender_id !== currentUserId) {
            loadUnreadCounts();
            
            // Show message notification
            toast({
              title: "💬 Nova mensagem",
              description: "Você recebeu uma nova mensagem",
              duration: 3000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      loadUnreadCounts();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [currentUserId]);

  const markAllAsRead = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCounts(prev => ({ ...prev, total: 0, social: 0, system: 0 }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [currentUserId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadUnreadCounts();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [currentUserId]);

  const sendNotification = useCallback(async (
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    data?: any
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-social-notification', {
        body: {
          userId,
          type,
          title,
          message,
          actionUrl,
          data
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  return {
    notifications,
    unreadCounts,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendNotification,
    refresh: loadNotifications
  };
}