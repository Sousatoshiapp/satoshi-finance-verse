import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

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

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  otherUser: OtherUser;
}

export function MessagesList({ messages, currentUserId, otherUser }: MessagesListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.sender_id === currentUserId;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !isOwnMessage && (!prevMessage || prevMessage.sender_id !== message.sender_id);

    return (
      <div
        key={message.id}
        className={cn(
          "flex gap-3 mb-4 group",
          isOwnMessage ? "justify-end" : "justify-start"
        )}
      >
        {!isOwnMessage && (
          <div className="flex flex-col items-center">
            {showAvatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={otherUser.profile_image_url} 
                  alt={otherUser.nickname}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {otherUser.nickname.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8" />
            )}
          </div>
        )}
        
        <div className={cn(
          "flex flex-col gap-1 max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start"
        )}>
          {message.message_type === 'image' && message.media_url ? (
            <div className={cn(
              "rounded-2xl overflow-hidden border",
              isOwnMessage 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}>
              <img 
                src={message.media_url} 
                alt="Imagem enviada"
                className="max-w-64 max-h-64 object-cover"
              />
              {message.content && (
                <div className="p-3">
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={cn(
              "px-4 py-2 rounded-2xl break-words",
              isOwnMessage 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-foreground"
            )}>
              <p className="text-sm">{message.content}</p>
            </div>
          )}
          
          <div className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground px-1",
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          )}>
            <span>
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
            
            {isOwnMessage && (
              <div className="flex items-center">
                {message.is_read ? (
                  <CheckCheck className="h-3 w-3 text-primary" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">
            <Avatar className="h-16 w-16 mx-auto">
              <AvatarImage 
                src={otherUser.profile_image_url} 
                alt={otherUser.nickname}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {otherUser.nickname.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="font-semibold text-lg mb-2">{otherUser.nickname}</h3>
          <p className="text-muted-foreground text-sm">
            Envie uma mensagem para começar a conversa
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-1">
        {messages.map((message, index) => renderMessage(message, index))}
      </div>
    </ScrollArea>
  );
}