import { useState, useEffect } from "react";
import { useCrisisData } from "./use-crisis-data";

const CRISIS_BANNER_KEY = "crisis_banner_dismissed";
const CRISIS_CONTRIBUTED_KEY = "crisis_contributed";

export const useCrisisState = () => {
  const { data: crisis, isLoading } = useCrisisData();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem(CRISIS_BANNER_KEY);
    const contributed = localStorage.getItem(CRISIS_CONTRIBUTED_KEY);
    
    if (dismissed) {
      setIsDismissed(true);
    }
    
    if (contributed) {
      setHasContributed(true);
    }
  }, []);

  const dismissBanner = () => {
    setIsDismissed(true);
    localStorage.setItem(CRISIS_BANNER_KEY, "true");
  };

  const markAsContributed = () => {
    setHasContributed(true);
    setIsDismissed(true);
    localStorage.setItem(CRISIS_CONTRIBUTED_KEY, "true");
    localStorage.setItem(CRISIS_BANNER_KEY, "true");
  };

  const reopenBanner = () => {
    setIsDismissed(false);
    localStorage.removeItem(CRISIS_BANNER_KEY);
  };

  const shouldShowBanner = crisis && !isDismissed && !isLoading;
  const shouldShowIcon = crisis && isDismissed && !isLoading;

  return {
    crisis,
    isLoading,
    shouldShowBanner,
    shouldShowIcon,
    hasContributed,
    dismissBanner,
    markAsContributed,
    reopenBanner
  };
};