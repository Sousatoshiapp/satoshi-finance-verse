import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DistrictChatProps {
  districtId: string;
  districtName: string;
  districtColor: string;
  currentProfile: any;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    nickname: string;
    profile_image_url?: string;
  };
}

export function DistrictChat({ districtId, districtName, districtColor, currentProfile }: DistrictChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
    joinDistrictRoom();

    return () => {
      leaveDistrictRoom();
    };
  }, [districtId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('district_chat_messages')
        .select(`
          id,
          content,
          created_at,
          sender:profiles!district_chat_messages_user_id_fkey(
            id,
            nickname,
            profile_image_url
          )
        `)
        .eq('district_id', districtId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`district_chat_${districtId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'district_chat_messages',
          filter: `district_id=eq.${districtId}`
        },
        (payload) => {
          // Fetch the complete message with sender info
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const joinDistrictRoom = async () => {
    if (!currentProfile) return;

    const channel = supabase.channel(`district_presence_${districtId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // User left
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        await channel.track({
          user_id: currentProfile.id,
          nickname: currentProfile.nickname,
          online_at: new Date().toISOString(),
        });
      });
  };

  const leaveDistrictRoom = () => {
    // Cleanup handled by useEffect return
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentProfile) return;

    try {
      const { error } = await supabase
        .from('district_chat_messages')
        .insert({
          district_id: districtId,
          user_id: currentProfile.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Mensagem Enviada!",
        description: "Sua mensagem foi enviada para o distrito."
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem.",
        variant: "destructive"
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="bg-slate-800/90 backdrop-blur-sm border-2" style={{ borderColor: districtColor }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" style={{ color: districtColor }} />
            Chat do {districtName}
          </div>
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1" style={{ color: districtColor }} />
            <span className="text-gray-300">{onlineUsers.length} online</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages Area */}
        <ScrollArea className="h-64 w-full rounded-md border border-slate-600 p-4">
          <div className="space-y-3">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender?.profile_image_url} />
                    <AvatarFallback className="bg-slate-700 text-white text-xs">
                      {message.sender?.nickname?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">
                        {message.sender?.nickname}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Seja o primeiro a conversar no distrito!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-slate-700 border-slate-600 text-white"
            maxLength={500}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            style={{ backgroundColor: districtColor }}
            className="text-black font-bold"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-600">
            <span className="text-xs text-gray-400">Online:</span>
            <div className="flex space-x-1">
              {onlineUsers.slice(0, 5).map((user: any, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: districtColor, backgroundColor: `${districtColor}20` }}
                  title={user.nickname}
                >
                  {user.nickname?.slice(0, 1).toUpperCase()}
                </div>
              ))}
              {onlineUsers.length > 5 && (
                <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs text-gray-300">
                  +{onlineUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}