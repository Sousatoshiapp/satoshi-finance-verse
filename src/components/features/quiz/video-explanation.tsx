import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, X } from "lucide-react";

interface VideoExplanationProps {
  videoUrl: string;
  question: string;
  correctAnswer: string;
  explanation?: string;
  onClose: () => void;
  onContinue: () => void;
}

export function VideoExplanation({
  videoUrl,
  question,
  correctAnswer,
  explanation,
  onClose,
  onContinue
}: VideoExplanationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    video.currentTime = percentage * duration;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-background border-border">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </Button>

          <CardContent className="p-6">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground mb-2">
                📚 Vídeo Explicativo
              </h3>
              <p className="text-sm text-muted-foreground">
                Vamos entender melhor essa questão!
              </p>
            </div>

            {/* Video Player */}
            <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video"
                playsInline
                preload="metadata"
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div 
                  className="w-full h-2 bg-white/30 rounded-full mb-3 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      {isPlaying ? 
                        <Pause className="h-5 w-5" /> : 
                        <Play className="h-5 w-5 ml-0.5" />
                      }
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 p-2"
                    >
                      {isMuted ? 
                        <VolumeX className="h-5 w-5" /> : 
                        <Volume2 className="h-5 w-5" />
                      }
                    </Button>
                    
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Review */}
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 text-foreground">Pergunta:</h4>
              <p className="text-sm text-muted-foreground mb-3">{question}</p>
              
              <h4 className="font-medium mb-2 text-foreground">Resposta Correta:</h4>
              <p className="text-sm text-green-600 font-medium">{correctAnswer}</p>
              
              {explanation && (
                <>
                  <h4 className="font-medium mb-2 mt-3 text-foreground">Explicação:</h4>
                  <p className="text-sm text-muted-foreground">{explanation}</p>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={onContinue}
                className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                Continuar Quiz
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}