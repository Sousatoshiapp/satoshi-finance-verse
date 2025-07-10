import { useState, useRef, useEffect } from "react";

interface VideoExplanationFullscreenProps {
  videoUrl: string;
  onClose: () => void;
}

export function VideoExplanationFullscreen({
  videoUrl,
  onClose
}: VideoExplanationFullscreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
      // Auto-play quando carregado
      video.play().catch(console.error);
    };

    const handleEnded = () => {
      // Auto-close quando o vídeo termina
      onClose();
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        playsInline
        muted={false}
        preload="auto"
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover'
        }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-lg">Carregando explicação...</div>
        </div>
      )}
    </div>
  );
}