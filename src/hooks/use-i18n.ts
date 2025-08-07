export const useI18n = () => {
  return {
    t: (key: string) => key,
    changeLanguage: () => {},
    getCurrentLanguage: () => 'pt-BR',
    isLanguage: () => false,
    language: 'pt-BR',
    i18n: null
  };
};
