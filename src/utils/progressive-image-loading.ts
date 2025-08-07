interface ProgressiveImageOptions {
  src: string;
  placeholder?: string;
  quality?: number;
  sizes?: string[];
  formats?: string[];
}

class ProgressiveImageLoader {
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  async loadImage(options: ProgressiveImageOptions): Promise<HTMLImageElement> {
    const { src, placeholder, quality = 75, sizes = [], formats = ['avif', 'webp', 'jpg'] } = options;
    
    const cacheKey = `${src}-${quality}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    const loadPromise = this.loadProgressively(src, { placeholder, quality, sizes, formats });
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const img = await loadPromise;
      this.cache.set(cacheKey, img);
      this.loadingPromises.delete(cacheKey);
      return img;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  private async loadProgressively(
    src: string, 
    options: Omit<ProgressiveImageOptions, 'src'>
  ): Promise<HTMLImageElement> {
    const { placeholder, quality, formats } = options;

    if (placeholder) {
      const placeholderImg = await this.loadSingleImage(placeholder);
      this.emitProgressEvent(src, { stage: 'placeholder', image: placeholderImg });
    }

    for (const format of formats!) {
      try {
        const optimizedSrc = this.getOptimizedUrl(src, format, quality!);
        const img = await this.loadSingleImage(optimizedSrc);
        this.emitProgressEvent(src, { stage: 'complete', image: img, format });
        return img;
      } catch (error) {
        console.warn(`Failed to load ${format} format for ${src}:`, error);
        continue;
      }
    }

    const fallbackImg = await this.loadSingleImage(src);
    this.emitProgressEvent(src, { stage: 'complete', image: fallbackImg, format: 'original' });
    return fallbackImg;
  }

  private loadSingleImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private getOptimizedUrl(src: string, format: string, quality: number): string {
    if (src.includes('unsplash')) {
      return `${src}${src.includes('?') ? '&' : '?'}fm=${format}&q=${quality}&auto=format`;
    }
    
    if (src.includes('supabase') || src.includes('storage')) {
      return `${src}${src.includes('?') ? '&' : '?'}format=${format}&quality=${quality}`;
    }
    
    return src;
  }

  private emitProgressEvent(src: string, data: any) {
    const event = new CustomEvent('progressive-image-load', {
      detail: { src, ...data }
    });
    window.dispatchEvent(event);
  }

  preloadImages(urls: string[], options: Partial<ProgressiveImageOptions> = {}) {
    return Promise.allSettled(
      urls.map(url => this.loadImage({ src: url, ...options }))
    );
  }

  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }
}

export const progressiveImageLoader = new ProgressiveImageLoader();

import React from 'react';

export const useProgressiveImage = (src: string, options: Partial<ProgressiveImageOptions> = {}) => {
  const [loadingState, setLoadingState] = React.useState<'loading' | 'placeholder' | 'complete'>('loading');
  const [currentSrc, setCurrentSrc] = React.useState<string>('');
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const handleProgressEvent = (event: CustomEvent) => {
      if (event.detail.src === src && mounted) {
        setLoadingState(event.detail.stage);
        setCurrentSrc(event.detail.image.src);
      }
    };

    window.addEventListener('progressive-image-load', handleProgressEvent as EventListener);

    progressiveImageLoader.loadImage({ src, ...options })
      .then(img => {
        if (mounted) {
          setCurrentSrc(img.src);
          setLoadingState('complete');
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
        }
      });

    return () => {
      mounted = false;
      window.removeEventListener('progressive-image-load', handleProgressEvent as EventListener);
    };
  }, [src, options]);

  return { src: currentSrc, loadingState, error };
};
