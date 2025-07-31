import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (United States)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'hi-IN', name: 'हिन्दी (भारत)', flag: '🇮🇳' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'العربية (السعودية)', flag: '🇸🇦' }
];

export function LanguageSelector() {
  const { t, changeLanguage, getCurrentLanguage } = useI18n();
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    // Force a full page reload to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('admin.language')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {t('admin.changeLanguage')}
        </div>
        
        <Select value={currentLang} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('admin.changeLanguage')} />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                  {currentLang === language.code && (
                    <Check className="h-4 w-4 text-green-500 ml-auto" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-1 gap-2">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={currentLang === language.code ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center gap-2 justify-start"
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {currentLang === language.code && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
