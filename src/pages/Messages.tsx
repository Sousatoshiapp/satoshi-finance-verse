import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/shared/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/shared/ui/avatar';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Messages() {
  const navigate = useNavigate();
  const { conversations, loading, markConversationAsRead } = useUnreadMessages();

  const handleConversationClick = (conversationId: string) => {
    markConversationAsRead(conversationId);
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/50 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Mensagens</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Carregando conversas...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 space-y-2">
            <MessageCircle className="h-12 w-12 mx-auto opacity-50" />
            <p>Nenhuma conversa encontrada</p>
            <Button onClick={() => navigate('/social')} variant="outline" size="sm">
              Conhecer pessoas
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={conversation.other_user_avatar} 
                    alt={conversation.other_user_nickname}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {conversation.other_user_nickname.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate">
                      {conversation.other_user_nickname}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.last_message_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message || 'Nova conversa'}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}