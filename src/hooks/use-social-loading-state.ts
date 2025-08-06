import { useState, useCallback } from "react";

interface LoadingStates {
  main: boolean;
  search: boolean;
  posts: boolean;
  userProfile: boolean;
  creating: boolean;
}

export function useSocialLoadingState() {
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    main: true,
    search: false,
    posts: true,
    userProfile: true,
    creating: false
  });

  const setLoading = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const setMultipleLoading = useCallback((states: Partial<LoadingStates>) => {
    setLoadingStates(prev => ({
      ...prev,
      ...states
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isMainLoading = loadingStates.main || loadingStates.userProfile;

  return {
    loading: loadingStates,
    setLoading,
    setMultipleLoading,
    isAnyLoading,
    isMainLoading
  };
}