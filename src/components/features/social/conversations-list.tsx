import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { VirtualList } from "@/components/shared/ui/virtual-list";
import { Badge } from "@/components/shared/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  updated_at: string;
  other_user: {
    id: string;
    nickname: string;
    profile_image_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationsList({ onSelectConversation }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
    setupRealtimeSubscription();
  }, []);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;
      
      setCurrentUserId(profile.id);

      // Get conversations with a more optimized query using JOINs
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant1_id,
          participant2_id,
          updated_at,
          participant1:profiles!conversations_participant1_id_fkey(id, nickname, profile_image_url),
          participant2:profiles!conversations_participant2_id_fkey(id, nickname, profile_image_url)
        `)
        .or(`participant1_id.eq.${profile.id},participant2_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      // Process conversations and get additional data
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          try {
            // Validate conversation
            if (conv.participant1_id === conv.participant2_id) {
              console.warn('Invalid conversation with same participants:', conv.id);
              return null;
            }

            // Get other participant - use fallback if JOIN failed
            let otherUser;
            if (conv.participant1_id === profile.id) {
              otherUser = conv.participant2 || await getProfileFallback(conv.participant2_id);
            } else {
              otherUser = conv.participant1 || await getProfileFallback(conv.participant1_id);
            }

            if (!otherUser) {
              console.warn('Could not find other participant for conversation:', conv.id);
              return null;
            }

            // Get last message
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Get unread count
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('is_read', false)
              .neq('sender_id', profile.id);

            return {
              id: conv.id,
              participant1_id: conv.participant1_id,
              participant2_id: conv.participant2_id,
              updated_at: conv.updated_at,
              other_user: otherUser,
              last_message: lastMessage,
              unread_count: unreadCount || 0
            };
          } catch (convError) {
            console.error('Error processing conversation:', conv.id, convError);
            return null;
          }
        })
      );

      // Filter out null conversations and set state
      const validConversations = conversationsWithDetails.filter(conv => conv !== null) as Conversation[];
      setConversations(validConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to get profile data if JOIN fails
  const getProfileFallback = async (profileId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, profile_image_url')
        .eq('id', profileId)
        .single();
      return data;
    } catch (error) {
      console.error('Error getting profile fallback:', error);
      return { id: profileId, nickname: 'Usuário', profile_image_url: undefined };
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Carregando conversas...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhuma conversa ainda
        <p className="text-sm mt-2">
          Encontre usuários na aba "Descobrir" para iniciar uma conversa
        </p>
      </div>
    );
  }

  const renderConversation = useMemo(() => (conversation: Conversation) => (
    <div
      onClick={() => onSelectConversation(conversation.id)}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={conversation.other_user.profile_image_url} />
        <AvatarFallback>
          {conversation.other_user.nickname.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">
            {conversation.other_user.nickname}
          </h3>
          <div className="flex items-center gap-2">
            {conversation.unread_count > 0 && (
              <Badge variant="destructive" className="text-xs">
                {conversation.unread_count}
              </Badge>
            )}
            {conversation.last_message && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            )}
          </div>
        </div>
        
        {conversation.last_message && (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {conversation.last_message.sender_id === currentUserId ? "Você: " : ""}
            {conversation.last_message.content}
          </p>
        )}
      </div>
    </div>
  ), [currentUserId, onSelectConversation]);

  return (
    <VirtualList
      items={conversations}
      itemHeight={80}
      height={500}
      renderItem={renderConversation}
      className="space-y-2"
    />
  );
}
