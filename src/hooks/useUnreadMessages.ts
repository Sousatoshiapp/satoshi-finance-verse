import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UnreadConversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  other_user_nickname: string;
  other_user_avatar?: string;
}

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<UnreadConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadUnreadMessages();
    
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages'
        },
        () => {
          loadUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadUnreadMessages = async () => {
    if (!user) return;

    try {
      // Get current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get conversations with unread messages
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant1_id,
          participant2_id,
          updated_at
        `)
        .or(`participant1_id.eq.${profile.id},participant2_id.eq.${profile.id}`);

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      if (!conversationsData?.length) {
        setConversations([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const conversationsWithUnread = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherUserId = conv.participant1_id === profile.id 
            ? conv.participant2_id 
            : conv.participant1_id;

          // Count unread messages
          const { count } = await supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', profile.id)
            .eq('is_read', false);

          // Get other user's profile
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('nickname, profile_image_url')
            .eq('id', otherUserId)
            .maybeSingle();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('direct_messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: conv.id,
            participant1_id: conv.participant1_id,
            participant2_id: conv.participant2_id,
            unread_count: count || 0,
            last_message: lastMessage?.content || '',
            last_message_at: lastMessage?.created_at || conv.updated_at,
            other_user_nickname: otherUserProfile?.nickname || 'Usuário',
            other_user_avatar: otherUserProfile?.profile_image_url
          };
        })
      );

      const unreadConversations = conversationsWithUnread.filter(conv => conv.unread_count > 0);
      const totalUnread = unreadConversations.reduce((sum, conv) => sum + conv.unread_count, 0);

      setConversations(unreadConversations);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error loading unread messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return;

      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', profile.id);

      // Reload unread messages
      loadUnreadMessages();
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  return {
    unreadCount,
    conversations,
    loading,
    markConversationAsRead,
    refresh: loadUnreadMessages
  };
}