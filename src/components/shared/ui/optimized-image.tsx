import { memo, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useProgressiveImage } from '../../../utils/progressive-image-loading';

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
  
  const { src: progressiveSrc, loadingState } = useProgressiveImage(src, {
    quality,
    formats: ['avif', 'webp', 'jpg']
  });

  const supportsWebP = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  const supportsAVIF = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }, []);

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

  const optimizedSrc = useMemo(() => {
    if (imageSrc.includes('unsplash')) {
      let format = 'auto';
      if (supportsAVIF()) {
        format = 'avif';
      } else if (supportsWebP()) {
        format = 'webp';
      }
      
      const params = new URLSearchParams();
      params.set('q', quality.toString());
      params.set('auto', 'format');
      params.set('fit', 'crop');
      if (format !== 'auto') params.set('fm', format);
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      
      return `${imageSrc}${imageSrc.includes('?') ? '&' : '?'}${params.toString()}`;
    }
    
    if (imageSrc.includes('supabase') || imageSrc.includes('storage')) {
      const params = new URLSearchParams();
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());
      params.set('quality', quality.toString());
      
      if (supportsAVIF()) {
        params.set('format', 'avif');
      } else if (supportsWebP()) {
        params.set('format', 'webp');
      }
      
      return params.toString() ? `${imageSrc}?${params.toString()}` : imageSrc;
    }
    
    return imageSrc;
  }, [imageSrc, quality, width, height, supportsWebP, supportsAVIF]);

  const finalSrc = progressiveSrc || optimizedSrc;
  const showPlaceholder = loadingState === 'loading' || (!isLoaded && !hasError);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showPlaceholder && (
        <div 
          className="absolute inset-0 bg-muted/20 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      <img
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoaded && loadingState === 'complete' ? "opacity-100" : "opacity-0",
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
