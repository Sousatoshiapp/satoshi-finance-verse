import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  useEffect(() => {
    const handleLanguageChanged = () => {
      setIsReady(true);
    };

    if (i18n.isInitialized) {
      setIsReady(true);
    } else {
      i18n.on('initialized', handleLanguageChanged);
    }

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('initialized', handleLanguageChanged);
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  return (
    <I18nContext.Provider value={{ isReady, language: i18n.language }}>
      {children}
    </I18nContext.Provider>
  );
}