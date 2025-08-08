import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  X, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Send,
  Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  conversationId: string;
  onVoiceSent: (audioUrl: string) => Promise<void>;
  onCancel: () => void;
}

export function VoiceRecorder({ conversationId, onVoiceSent, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    try {
      setUploading(true);

      // Create unique filename
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webm`;
      const filePath = `chat-voice/${conversationId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('chat-voice')
        .upload(filePath, audioBlob);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Erro",
          description: "Não foi possível fazer upload do áudio",
          variant: "destructive"
        });
        return;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('chat-voice')
        .getPublicUrl(filePath);

      await onVoiceSent(publicData.publicUrl);

    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar áudio",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Gravar Áudio</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Recording Interface */}
        <div className="flex flex-col items-center space-y-4">
          {!audioBlob ? (
            <>
              {/* Record Button */}
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={cn(
                  "w-16 h-16 rounded-full",
                  isRecording && "animate-pulse"
                )}
              >
                {isRecording ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              {/* Recording Status */}
              <div className="text-center">
                {isRecording ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Gravando...</p>
                    <p className="text-lg font-mono">{formatTime(recordingTime)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Toque para gravar
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Audio Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  size="lg"
                  variant="outline"
                  className="w-12 h-12 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-mono">{formatTime(recordingTime)}</p>
                </div>

                <Button
                  onClick={deleteRecording}
                  size="lg"
                  variant="outline"
                  className="w-12 h-12 rounded-full text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Send Controls */}
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onCancel}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={uploadAudio}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
}