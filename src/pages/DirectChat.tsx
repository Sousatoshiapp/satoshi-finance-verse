import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { DirectChatHeader } from "@/components/features/chat/DirectChatHeader";
import { MessagesList } from "@/components/features/chat/MessagesList";
import { MessageInput } from "@/components/features/chat/MessageInput";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  message_type?: string;
  media_url?: string;
}

interface OtherUser {
  id: string;
  nickname: string;
  profile_image_url?: string;
}

export default function DirectChat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<any>(null);

  useEffect(() => {
    if (!conversationId || !profile) return;
    
    loadConversationData();
    setupRealtimeSubscription();
  }, [conversationId, profile]);

  const loadConversationData = async () => {
    if (!profile || !conversationId) return;

    try {
      setLoading(true);

      // Load conversation data
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select('id, participant1_id, participant2_id')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('Conversation error:', convError);
        toast({
          title: "Erro",
          description: "Conversa não encontrada",
          variant: "destructive"
        });
        navigate('/social');
        return;
      }

      // Validate user is participant
      if (conversationData.participant1_id !== profile.id && conversationData.participant2_id !== profile.id) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta conversa",
          variant: "destructive"
        });
        navigate('/social');
        return;
      }

      // Determine other user ID
      const otherUserId = conversationData.participant1_id === profile.id 
        ? conversationData.participant2_id 
        : conversationData.participant1_id;

      // Load other user profile
      const { data: otherUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, nickname, profile_image_url')
        .eq('id', otherUserId)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast({
          title: "Erro",
          description: "Perfil do usuário não encontrado",
          variant: "destructive"
        });
        navigate('/social');
        return;
      }

      setConversation(conversationData);
      setOtherUser(otherUserProfile);

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) {
        console.error('Messages error:', messagesError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive"
        });
        return;
      }

      setMessages(messagesData || []);

      // Mark messages as read
      const unreadMessages = messagesData?.filter(msg => 
        msg.sender_id !== profile.id && !msg.is_read
      );

      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
      }

    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conversa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);

          // Mark as read if not sent by current user
          if (newMessage.sender_id !== profile?.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (content: string, messageType: string = 'text', mediaUrl?: string) => {
    if (!profile || !conversationId || (!content.trim() && !mediaUrl)) return;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: content.trim(),
          message_type: messageType,
          media_url: mediaUrl,
          is_read: false
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    // Voltar para messages se existe na história, senão voltar para social
    const referrer = document.referrer;
    if (referrer.includes('/messages') || window.history.length > 2) {
      navigate('/messages');
    } else {
      navigate('/social');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  if (!otherUser || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Conversa não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <DirectChatHeader 
        otherUser={otherUser}
        onBack={handleBack}
      />
      
      <div className="flex-1 flex flex-col">
        <MessagesList 
          messages={messages}
          currentUserId={profile?.id || ''}
          otherUser={otherUser}
        />
        
        <MessageInput 
          onSendMessage={handleSendMessage}
          conversationId={conversationId || ''}
        />
      </div>
    </div>
  );
}