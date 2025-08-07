import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback((lng: string) => {
    i18n.emit('languageChanging', lng);
    i18n.changeLanguage(lng);
  }, [i18n]);

  const getCurrentLanguage = () => i18n.language;

  const isLanguage = (lng: string) => i18n.language === lng;

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isLanguage,
    language: i18n.language,
    i18n
  };
};
