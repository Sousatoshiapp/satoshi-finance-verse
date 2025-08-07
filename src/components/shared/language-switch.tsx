import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/shared/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitch() {
  const { getCurrentLanguage, changeLanguage, t } = useI18n();
  const currentLang = getCurrentLanguage();
  
  const languages = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' }
  ];

  const currentLanguageIndex = languages.findIndex(lang => lang.code === currentLang);
  
  const toggleLanguage = () => {
    const nextIndex = (currentLanguageIndex + 1) % languages.length;
    const newLang = languages[nextIndex].code;
    changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-xs p-1 h-7 w-7 rounded-full hover:bg-muted/80"
      title={`${t('common.switchTo')} ${languages[(currentLanguageIndex + 1) % languages.length].name}`}
    >
      <Globe className="h-3 w-3" />
    </Button>
  );
}
