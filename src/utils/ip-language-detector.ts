import axios from 'axios';

interface IPLocationResponse {
  country_code: string;
  country_name: string;
}

const COUNTRY_TO_LANGUAGE_MAP: Record<string, string> = {
  'BR': 'pt-BR',
  'PT': 'pt-BR',
  
  'US': 'en-US',
  'GB': 'en-US',
  'CA': 'en-US',
  'AU': 'en-US',
  'NZ': 'en-US',
  'IE': 'en-US',
  'ZA': 'en-US',
  
  'ES': 'es-ES',
  'MX': 'es-ES',
  'AR': 'es-ES',
  'CO': 'es-ES',
  'PE': 'es-ES',
  'VE': 'es-ES',
  'CL': 'es-ES',
  'EC': 'es-ES',
  'GT': 'es-ES',
  'CU': 'es-ES',
  'BO': 'es-ES',
  'DO': 'es-ES',
  'HN': 'es-ES',
  'PY': 'es-ES',
  'SV': 'es-ES',
  'NI': 'es-ES',
  'CR': 'es-ES',
  'PA': 'es-ES',
  'UY': 'es-ES',
  
  'IN': 'hi-IN',
  
  'CN': 'zh-CN',
  'TW': 'zh-CN',
  'HK': 'zh-CN',
  'SG': 'zh-CN',
  
  'SA': 'ar-SA',
  'AE': 'ar-SA',
  'QA': 'ar-SA',
  'KW': 'ar-SA',
  'BH': 'ar-SA',
  'OM': 'ar-SA',
  'JO': 'ar-SA',
  'LB': 'ar-SA',
  'SY': 'ar-SA',
  'IQ': 'ar-SA',
  'EG': 'ar-SA',
  'LY': 'ar-SA',
  'TN': 'ar-SA',
  'DZ': 'ar-SA',
  'MA': 'ar-SA',
  'YE': 'ar-SA',
};

export const detectLanguageByIP = async (): Promise<string | null> => {
  try {
    const response = await axios.get<IPLocationResponse>('https://ipapi.co/json/', {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
      }
    });

    const countryCode = response.data.country_code;
    const detectedLanguage = COUNTRY_TO_LANGUAGE_MAP[countryCode];
    
    
    return detectedLanguage || null;
  } catch (error) {
    console.warn('IP language detection failed:', error);
    return null;
  }
};

export const createIPLanguageDetector = () => {
  return {
    name: 'ipDetector',
    lookup: (options?: { caches?: string[] }): string | undefined => {
      detectLanguageByIP().then(language => {
        if (language && options?.caches) {
          localStorage.setItem('i18nextLng', language);
        }
      });
      
      const cachedIPLanguage = localStorage.getItem('i18nextLng');
      return cachedIPLanguage || undefined;
    },
    cacheUserLanguage: (lng: string) => {
      localStorage.setItem('i18nextLng', lng);
    }
  };
};
