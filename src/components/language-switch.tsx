import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitch() {
  const { getCurrentLanguage, changeLanguage } = useI18n();
  const currentLang = getCurrentLanguage();
  
  const toggleLanguage = () => {
    const newLang = currentLang === 'pt-BR' ? 'en-US' : 'pt-BR';
    changeLanguage(newLang);
    // Force reload to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-xs p-1 h-7 w-7 rounded-full hover:bg-muted/80"
      title={currentLang === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
    >
      <Globe className="h-3 w-3" />
    </Button>
  );
}