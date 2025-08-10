import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

export function VideoTeaser() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play muted on mount
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Ignore auto-play errors
      });
    }
  }, []);

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
    <div 
      className="fixed inset-0 w-screen h-screen bg-black"
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-purple-800">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="w-8 h-8 text-primary" />
            </div>
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
          autoPlay
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={handlePlayPause}
        >
          <source src="/videos/teaser-hd.mp4" type="video/mp4" />
          <source src="/videos/teaser-hd.webm" type="video/webm" />
          <source src="/videos/teaser-sd.mp4" type="video/mp4" />
        </video>
      )}

      {/* Video Controls Overlay */}
      {!hasError && (
        <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePlayPause}
              className="bg-black/70 hover:bg-black/90 text-white border-none backdrop-blur-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMuteToggle}
              className="bg-black/70 hover:bg-black/90 text-white border-none backdrop-blur-sm"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}