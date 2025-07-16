import { useState, useEffect } from "react";
import { useCrisisData } from "./use-crisis-data";

const CRISIS_BANNER_KEY = "crisis_banner_dismissed";
const CRISIS_CONTRIBUTED_KEY = "crisis_contributed";

export const useCrisisState = () => {
  const { data: crisis, isLoading } = useCrisisData();
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);

  useEffect(() => {
    // If there's no active crisis, clear all crisis-related localStorage
    if (!crisis && !isLoading) {
      localStorage.removeItem(CRISIS_BANNER_KEY);
      localStorage.removeItem(CRISIS_CONTRIBUTED_KEY);
      setHasContributed(false);
      setIsBannerOpen(false);
      return;
    }

    // Check localStorage for contributed state only if there's an active crisis
    if (crisis) {
      const contributed = localStorage.getItem(CRISIS_CONTRIBUTED_KEY);
      if (contributed) {
        setHasContributed(true);
      }
    }
  }, [crisis, isLoading]);

  const dismissBanner = () => {
    setIsBannerOpen(false);
    localStorage.setItem(CRISIS_BANNER_KEY, "true");
  };

  const markAsContributed = () => {
    setHasContributed(true);
    setIsBannerOpen(false);
    localStorage.setItem(CRISIS_CONTRIBUTED_KEY, "true");
    localStorage.setItem(CRISIS_BANNER_KEY, "true");
  };

  const openBanner = () => {
    setIsBannerOpen(true);
    localStorage.removeItem(CRISIS_BANNER_KEY);
  };

  const shouldShowBanner = crisis && isBannerOpen && !isLoading;
  const shouldShowIcon = crisis && !isLoading; // Ícone sempre visível durante crise

  return {
    crisis,
    isLoading,
    shouldShowBanner,
    shouldShowIcon,
    hasContributed,
    dismissBanner,
    markAsContributed,
    openBanner
  };
};