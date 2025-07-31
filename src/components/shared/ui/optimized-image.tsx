import { memo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className,
  quality = 75,
  priority = false,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg'
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  }, [hasError, fallbackSrc, onError]);

  // Optimize image URL for better performance
  const optimizedSrc = imageSrc.includes('unsplash') 
    ? `${imageSrc}${imageSrc.includes('?') ? '&' : '?'}q=${quality}&auto=format&fit=crop${width ? `&w=${width}` : ''}${height ? `&h=${height}` : ''}`
    : imageSrc;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-muted/20 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';