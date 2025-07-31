import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import '../i18n';

interface I18nContextType {
  isReady: boolean;
  language: string;
}

const I18nContext = createContext<I18nContextType>({
  isReady: false,
  language: 'pt-BR'
});

export const useI18nContext = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = (lng?: string) => {
      const currentLang = lng || i18n.language;
      
      const isRTL = currentLang === 'ar-SA';
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', currentLang);
      document.body.setAttribute('data-lang', currentLang);
      
      setIsTransitioning(false);
      setIsReady(true);
    };

    const handleLanguageChanging = () => {
      setIsTransitioning(true);
    };

    if (i18n.isInitialized) {
      handleLanguageChanged();
    } else {
      i18n.on('initialized', handleLanguageChanged);
    }

    i18n.on('languageChanged', handleLanguageChanged);
    i18n.on('languageChanging', handleLanguageChanging);

    return () => {
      i18n.off('initialized', handleLanguageChanged);
      i18n.off('languageChanged', handleLanguageChanged);
      i18n.off('languageChanging', handleLanguageChanging);
    };
  }, [i18n]);

  return (
    <I18nContext.Provider value={{ isReady, language: i18n.language }}>
      <div className={isTransitioning ? 'opacity-90 transition-opacity duration-200' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}
