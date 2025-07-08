import { useTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguage = () => i18n.language;

  const isLanguage = (lng: string) => i18n.language === lng;

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isLanguage,
    i18n
  };
};