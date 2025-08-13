import React, { useState, useCallback } from 'react';
import { TwitterSocialFeed } from './twitter-social-feed';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { MobilePullIndicator } from '@/components/shared/ui/mobile-pull-indicator';
import { MobileLoadingIndicator } from '@/components/shared/ui/mobile-loading-indicator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MobileEnhancedFeedProps {
  onPostLike?: (postId: string, isLiked: boolean) => void;
}

export function MobileEnhancedFeed({ onPostLike }: MobileEnhancedFeedProps) {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePullToRefresh = useCallback(async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleInfiniteScroll = useCallback(async () => {
    // Simulate loading more
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: "Mais posts carregados",
      description: "Continue explorando",
    });
  }, [toast]);

  const handleDoubleTap = useCallback(async (element: HTMLElement) => {
    const postId = element.dataset.postId;
    if (!postId || !onPostLike) return;

    // Add visual feedback
    element.style.animation = 'scale-in 0.2s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 200);

    // Trigger like
    onPostLike(postId, false);
  }, [onPostLike]);

  const {
    containerRef,
    isRefreshing,
    pullDistance,
    isLoadingMore,
    indicators
  } = useMobileGestures({
    onPullToRefresh: handlePullToRefresh,
    onInfiniteScroll: handleInfiniteScroll,
    onDoubleTap: handleDoubleTap,
    pullThreshold: 120,
    scrollThreshold: 200
  });

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <MobilePullIndicator
          pullDistance={pullDistance}
          pullThreshold={120}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Feed container with gesture handling */}
      <div
        ref={containerRef}
        className="lg:static relative overflow-auto"
        style={{ 
          paddingTop: indicators.pullToRefresh ? `${Math.min(pullDistance, 60)}px` : 0,
          transition: 'padding-top 0.1s ease-out'
        }}
      >
        <TwitterSocialFeed key={refreshKey} />
        
        {/* Infinite scroll loading indicator */}
        <MobileLoadingIndicator 
          isLoading={isLoadingMore}
          type="posts"
        />
      </div>

    </div>
  );
}