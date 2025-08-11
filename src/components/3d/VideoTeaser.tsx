import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

export function VideoTeaser() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // YouTube iframe loads automatically
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePlayPause = () => {
    // Note: YouTube iframe controls are limited without API
    // This is mainly for UI feedback
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    // Note: YouTube iframe mute control is limited without API
    // This is mainly for UI feedback
    setIsMuted(!isMuted);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
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
        <iframe
          ref={iframeRef}
          className="w-full h-full"
          src="https://www.youtube-nocookie.com/embed/69XDnqnRO9U?autoplay=1&mute=1&loop=1&playlist=69XDnqnRO9U&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          onClick={handlePlayPause}
        />
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