import { useState, useEffect } from 'react';

const TUTORIAL_KEY = 'btc-duel-tutorial-shown';

export function useBtcTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if tutorial has been shown before
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_KEY);
    
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    
    setIsLoading(false);
  }, []);

  const markTutorialAsSeen = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_KEY);
    setShowTutorial(true);
  };

  return {
    showTutorial,
    isLoading,
    markTutorialAsSeen,
    resetTutorial
  };
}