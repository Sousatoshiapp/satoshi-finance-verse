import { useEffect, useRef, useCallback, useState } from 'react';
import { useSensoryFeedback } from './use-sensory-feedback';

interface MobileGesturesConfig {
  onPullToRefresh?: () => Promise<void>;
  onInfiniteScroll?: () => Promise<void>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: (element: HTMLElement) => void;
  pullThreshold?: number;
  swipeThreshold?: number;
  scrollThreshold?: number;
}

export function useMobileGestures(config: MobileGesturesConfig) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sensoryFeedback = useSensoryFeedback();
  const createSuccess = () => sensoryFeedback.triggerSuccess({ x: 0, y: 0 });
  const createError = () => sensoryFeedback.triggerError();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const {
    onPullToRefresh,
    onInfiniteScroll,
    onSwipeLeft,
    onSwipeRight,
    onDoubleTap,
  pullThreshold = 120,
  swipeThreshold = 100,
  scrollThreshold = 200
  } = config;

  // Pull-to-refresh
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!containerRef.current) return;
    
    const touch = e.touches[0];
    containerRef.current.dataset.startY = touch.clientY.toString();
    containerRef.current.dataset.startX = touch.clientX.toString();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!containerRef.current || isRefreshing) return;
    
    const container = containerRef.current;
    const startY = parseFloat(container.dataset.startY || '0');
    const startX = parseFloat(container.dataset.startX || '0');
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const currentX = touch.clientX;
    
    const deltaY = currentY - startY;
    const deltaX = currentX - startX;
    
    // Pull-to-refresh (only when at top with more restrictive conditions)
    if (container.scrollTop === 0 && deltaY > 15 && Math.abs(deltaX) < 30) {
      e.preventDefault();
      const distance = Math.min(deltaY * 0.4, pullThreshold * 1.2);
      setPullDistance(distance);
      
      if (distance > pullThreshold) {
        createSuccess();
      }
    }
  }, [isRefreshing, pullThreshold, createSuccess]);

  const handleTouchEnd = useCallback(async (e: TouchEvent) => {
    if (!containerRef.current || isRefreshing) return;
    
    const container = containerRef.current;
    const startY = parseFloat(container.dataset.startY || '0');
    const startX = parseFloat(container.dataset.startX || '0');
    const touch = e.changedTouches[0];
    const endY = touch.clientY;
    const endX = touch.clientX;
    
    const deltaY = endY - startY;
    const deltaX = endX - startX;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    
    // Pull-to-refresh
    if (container.scrollTop === 0 && pullDistance > pullThreshold && onPullToRefresh) {
      setIsRefreshing(true);
      try {
        await onPullToRefresh();
        createSuccess();
      } catch (error) {
        createError();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Swipe gestures
    if (distance > swipeThreshold && Math.abs(deltaY) < 100) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
        createSuccess();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
        createSuccess();
      }
    }
    
    setPullDistance(0);
    delete container.dataset.startY;
    delete container.dataset.startX;
  }, [pullDistance, pullThreshold, swipeThreshold, onPullToRefresh, onSwipeLeft, onSwipeRight, createSuccess, createError, isRefreshing]);

  // Infinite scroll
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || isLoadingMore || !onInfiniteScroll) return;
    
    const container = containerRef.current;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    
    if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
      setIsLoadingMore(true);
      try {
        await onInfiniteScroll();
      } catch (error) {
        createError();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, onInfiniteScroll, scrollThreshold, createError]);

  // Double tap
  const handleDoubleClick = useCallback((e: Event) => {
    if (!onDoubleTap) return;
    
    const target = e.target as HTMLElement;
    const post = target.closest('[data-post-id]') as HTMLElement;
    
    if (post) {
      onDoubleTap(post);
      createSuccess();
    }
  }, [onDoubleTap, createSuccess]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('dblclick', handleDoubleClick);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleScroll, handleDoubleClick]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    isLoadingMore,
    indicators: {
      pullToRefresh: pullDistance > 0,
      canRefresh: pullDistance > pullThreshold,
      isRefreshing,
      isLoadingMore
    }
  };
}