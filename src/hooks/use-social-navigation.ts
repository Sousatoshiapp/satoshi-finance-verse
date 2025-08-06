import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

type SocialTab = 'feed' | 'search' | 'challenges' | 'rankings' | 'messages';

export function useSocialNavigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SocialTab>('feed');

  // Sync with URL params on mount and when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SocialTab;
    if (tabParam && ['feed', 'search', 'challenges', 'rankings', 'messages'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('feed');
    }
  }, [searchParams]);

  const navigateToTab = (tab: SocialTab) => {
    setActiveTab(tab);
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === 'feed') {
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', tab);
    }
    
    const newUrl = newSearchParams.toString() 
      ? `/social?${newSearchParams.toString()}` 
      : '/social';
    
    navigate(newUrl, { replace: true });
  };

  const navigateToTabWithParams = (tab: SocialTab, params?: Record<string, string>) => {
    setActiveTab(tab);
    
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Set tab
    if (tab === 'feed') {
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', tab);
    }
    
    // Add additional params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        newSearchParams.set(key, value);
      });
    }
    
    const newUrl = newSearchParams.toString() 
      ? `/social?${newSearchParams.toString()}` 
      : '/social';
    
    navigate(newUrl, { replace: true });
  };

  return {
    activeTab,
    navigateToTab,
    navigateToTabWithParams,
    setActiveTab // For direct state management if needed
  };
}