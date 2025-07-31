import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { createIPLanguageDetector } from '@/utils/ip-language-detector';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import hiIN from './locales/hi-IN.json';
import zhCN from './locales/zh-CN.json';
import arSA from './locales/ar-SA.json';

const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  },
  'es-ES': {
    translation: esES
  },
  'hi-IN': {
    translation: hiIN
  },
  'zh-CN': {
    translation: zhCN
  },
  'ar-SA': {
    translation: arSA
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(createIPLanguageDetector());

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'ipDetector', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;
