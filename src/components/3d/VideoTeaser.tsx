import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VideoTeaserProps {
  title?: string;
  description?: string;
}

export function VideoTeaser({ 
  title = "Satoshi City - Em Breve", 
  description = "Uma experiência imersiva em desenvolvimento. Em breve você poderá explorar os distritos financeiros de Satoshi City em 3D!" 
}: VideoTeaserProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl backdrop-blur-xl bg-background/20 border border-white/10 shadow-2xl shadow-purple-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            {title}
          </CardTitle>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Carregando vídeo...</p>
                </div>
              </div>
            )}

            {hasError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-purple-800">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Vídeo em Produção</h3>
                  <p className="text-muted-foreground">
                    O teaser está sendo finalizado. Em breve você poderá ver uma prévia exclusiva!
                  </p>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="/videos/teaser-poster.jpg"
                muted={isMuted}
                loop
                playsInline
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                {/* Multiple formats for better compatibility */}
                <source src="/videos/teaser-hd.mp4" type="video/mp4" />
                <source src="/videos/teaser-hd.webm" type="video/webm" />
                <source src="/videos/teaser-sd.mp4" type="video/mp4" />
                Seu navegador não suporta reprodução de vídeo.
              </video>
            )}

            {/* Video Controls Overlay */}
            {!hasError && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 group">
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePlayPause}
                      className="bg-black/50 hover:bg-black/70 text-white border-none"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleMuteToggle}
                      className="bg-black/50 hover:bg-black/70 text-white border-none"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-background/10 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-purple-400 mb-1">Exploração 3D</h4>
                <p className="text-sm text-muted-foreground">
                  Navegue pelos distritos em um ambiente 3D imersivo
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/10 border-cyan-500/30">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-cyan-400 mb-1">Sistema de Distritos</h4>
                <p className="text-sm text-muted-foreground">
                  Cada distrito representa uma área específica do mercado financeiro
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/10 border-pink-500/30">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-pink-400 mb-1">Gamificação</h4>
                <p className="text-sm text-muted-foreground">
                  Sistema de níveis, XP e recompensas para tornar o aprendizado mais divertido
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Button */}
          <div className="text-center">
            <Button 
              disabled
              className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-white font-semibold px-8 py-3 rounded-full border border-purple-500/30 cursor-not-allowed"
            >
              <Play className="w-5 h-5 mr-2" />
              Em Breve - Aguarde!
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Acompanhe o desenvolvimento nas próximas atualizações
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}