import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/shared/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { sanitizeText, validateMessageContent, globalRateLimiter, detectSuspiciousContent } from "@/lib/validation";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversationData();
    setupRealtimeSubscription();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Erro",
          description: "Perfil não encontrado",
          variant: "destructive"
        });
        return;
      }
      setCurrentUserId(profile.id);

      // Load conversation details with simplified query
      const { data: conversation, error: convError } = await supabase
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
        return;
      }

      // Validate conversation participants
      if (conversation.participant1_id === conversation.participant2_id) {
        toast({
          title: "Erro",
          description: "Conversa inválida",
          variant: "destructive"
        });
        return;
      }

      // Check if current user is part of this conversation
      if (conversation.participant1_id !== profile.id && conversation.participant2_id !== profile.id) {
        toast({
          title: "Erro",
          description: "Acesso negado a esta conversa",
          variant: "destructive"
        });
        return;
      }

      // Get other participant details
      const otherParticipantId = conversation.participant1_id === profile.id 
        ? conversation.participant2_id 
        : conversation.participant1_id;

      const { data: otherUserData, error: userError } = await supabase
        .from('profiles')
        .select('id, nickname, profile_image_url')
        .eq('id', otherParticipantId)
        .single();

      if (userError || !otherUserData) {
        console.error('Other user error:', userError);
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive"
        });
        return;
      }
      
      setOtherUser(otherUserData);

      // Load messages
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('Messages error:', msgError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens",
          variant: "destructive"
        });
        return;
      }
      setMessages(messagesData || []);

      // Mark messages as read
      const { error: readError } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', profile.id)
        .eq('is_read', false);

      if (readError) {
        console.error('Error marking messages as read:', readError);
      }

    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar a conversa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          
          // Mark new message as read if it's not from current user
          if (payload.new.sender_id !== currentUserId) {
            supabase
              .from('messages')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !currentUserId) return;

    // Enhanced security validation
    const messageValidation = validateMessageContent(newMessage);
    if (messageValidation) {
      toast({
        title: "Erro de Validação",
        description: messageValidation,
        variant: "destructive"
      });
      return;
    }

    // Check for suspicious content
    if (detectSuspiciousContent(newMessage)) {
      globalRateLimiter.logSecurityEvent('suspicious_message_content', currentUserId, {
        content: newMessage.substring(0, 100) + '...',
        conversationId
      });
      toast({
        title: "Conteúdo Bloqueado",
        description: "Mensagem contém conteúdo suspeito",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting
    if (!globalRateLimiter.canPerformAction(currentUserId, 'send_message', 30)) {
      toast({
        title: "Muitas Mensagens",
        description: "Aguarde um momento antes de enviar outra mensagem",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: sanitizeText(newMessage.trim())
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      globalRateLimiter.logSecurityEvent('message_send_failed', currentUserId, {
        error: error.message,
        conversationId
      });
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <FloatingNavbar />
      <div className="max-w-4xl mx-auto">
          <div className="text-center text-muted-foreground py-8">
            Carregando conversa...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-row items-center gap-3 pb-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {otherUser && (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.profile_image_url} />
                  <AvatarFallback>
                    {otherUser.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-semibold">{otherUser.nickname}</h2>
              </>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 max-w-[80%]",
                        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p>{sanitizeText(message.content)}</p>
                        <p className={cn(
                          "text-xs mt-1 opacity-70",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={sending}
                className="flex-1"
                maxLength={1000}
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
