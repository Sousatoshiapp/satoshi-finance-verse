import { useState, useRef } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Image, 
  Mic, 
  Plus, 
  Smile,
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploader } from "./ImageUploader";
import { VoiceRecorder } from "./VoiceRecorder";

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, mediaUrl?: string) => Promise<void>;
  conversationId: string;
}

export function MessageInput({ onSendMessage, conversationId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSendText = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      await onSendMessage(message.trim());
      setMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleImageSent = async (imageUrl: string, caption?: string) => {
    try {
      setSending(true);
      await onSendMessage(caption || '', 'image', imageUrl);
      setShowImageUploader(false);
    } catch (error) {
      console.error('Error sending image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a imagem",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleVoiceSent = async (audioUrl: string) => {
    try {
      setSending(true);
      await onSendMessage('', 'voice', audioUrl);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Error sending voice:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o áudio",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  if (showImageUploader) {
    return (
      <ImageUploader
        conversationId={conversationId}
        onImageSent={handleImageSent}
        onCancel={() => setShowImageUploader(false)}
      />
    );
  }

  if (showVoiceRecorder) {
    return (
      <VoiceRecorder
        conversationId={conversationId}
        onVoiceSent={handleVoiceSent}
        onCancel={() => setShowVoiceRecorder(false)}
      />
    );
  }

  return (
    <div className="border-t border-border bg-card p-4 pb-6">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAttachments(!showAttachments)}
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <Plus className={cn(
              "h-5 w-5 transition-transform",
              showAttachments && "rotate-45"
            )} />
          </Button>

          {showAttachments && (
            <div className="absolute bottom-12 left-0 bg-popover border border-border rounded-lg shadow-lg p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowImageUploader(true);
                    setShowAttachments(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Image className="h-4 w-4" />
                  Imagem
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowVoiceRecorder(true);
                    setShowAttachments(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Áudio
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2"
                  disabled
                >
                  <Paperclip className="h-4 w-4" />
                  Arquivo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="pr-12 bg-background border-border"
            disabled={sending}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendText}
          disabled={!message.trim() || sending}
          size="icon"
          className="h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}