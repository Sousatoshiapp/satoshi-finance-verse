import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Switch } from '@/components/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui/select';
import { Slider } from '@/components/shared/ui/slider';
import { Label } from '@/components/shared/ui/label';
import { 
  Settings, 
  Target, 
  Users, 
  Bot, 
  Shield,
  Clock,
  Zap,
  Check
} from 'lucide-react';
import { useMatchmakingPreferences, MatchmakingPreferences } from '@/hooks/useMatchmakingPreferences';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';

const topicsMap: Record<string, string> = {
  "financas": "financas",
  "investimentos": "investimentos", 
  "criptomoedas": "criptomoedas",
  "economia": "economia"
};

interface MatchmakingPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchmakingPreferencesModal({ isOpen, onClose }: MatchmakingPreferencesModalProps) {
  const { preferences, updatePreferences } = useMatchmakingPreferences();
  const [localPreferences, setLocalPreferences] = React.useState<MatchmakingPreferences>(preferences);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  React.useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updatePreferences(localPreferences);
      
      if (success) {
        toast({
          title: `✅ ${t('matchmaking.preferences.actions.saveSuccess')}`,
          description: t('matchmaking.preferences.actions.saveSuccessDesc'),
        });
        onClose();
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      toast({
        title: `❌ ${t('matchmaking.preferences.actions.saveError')}`,
        description: t('matchmaking.preferences.actions.saveErrorDesc'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleTopic = (topic: string) => {
    const currentTopics = localPreferences.preferredTopics;
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter(t => t !== topic)
      : [...currentTopics, topic];
    
    setLocalPreferences(prev => ({
      ...prev,
      preferredTopics: newTopics
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="w-full max-w-lg sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
        >
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                {t('matchmaking.preferences.title')}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('matchmaking.preferences.subtitle')}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Tópicos Preferidos */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('matchmaking.preferences.topics.title')}
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('matchmaking.preferences.topics.subtitle')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(topicsMap).map(([key, translationKey]) => {
                    const isSelected = localPreferences.preferredTopics.includes(key);
                    return (
                      <Button
                        key={key}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTopic(key)}
                        className={`justify-start text-xs sm:text-sm h-9 sm:h-10 ${isSelected ? 'bg-primary' : ''}`}
                      >
                        {isSelected && <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />}
                        {t(`matchmaking.preferences.topics.${translationKey}`)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Permitir Bots */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('matchmaking.preferences.allowBots.title')}
                </Label>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-muted-foreground flex-1">
                    {t('matchmaking.preferences.allowBots.subtitle')}
                  </p>
                  <Switch
                    checked={localPreferences.allowBots}
                    onCheckedChange={(checked) => 
                      setLocalPreferences(prev => ({ ...prev, allowBots: checked }))
                    }
                  />
                </div>
              </div>

              {/* Nível de Habilidade */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('matchmaking.preferences.skillLevel.title')}
                </Label>
                <Select
                  value={localPreferences.skillLevelRange}
                  onValueChange={(value: any) => 
                    setLocalPreferences(prev => ({ ...prev, skillLevelRange: value }))
                  }
                >
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="similar">
                      <div>
                        <div className="font-medium text-xs sm:text-sm">{t('matchmaking.preferences.skillLevel.similar')}</div>
                        <div className="text-xs text-muted-foreground">{t('matchmaking.preferences.skillLevel.similarDesc')}</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="any">
                      <div>
                        <div className="font-medium text-xs sm:text-sm">{t('matchmaking.preferences.skillLevel.any')}</div>
                        <div className="text-xs text-muted-foreground">{t('matchmaking.preferences.skillLevel.anyDesc')}</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="challenging">
                      <div>
                        <div className="font-medium text-xs sm:text-sm">{t('matchmaking.preferences.skillLevel.challenging')}</div>
                        <div className="text-xs text-muted-foreground">{t('matchmaking.preferences.skillLevel.challengingDesc')}</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-aceitar de Amigos */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('matchmaking.preferences.autoAccept.title')}
                </Label>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-muted-foreground flex-1">
                    {t('matchmaking.preferences.autoAccept.subtitle')}
                  </p>
                  <Switch
                    checked={localPreferences.autoAcceptFromFriends}
                    onCheckedChange={(checked) => 
                      setLocalPreferences(prev => ({ ...prev, autoAcceptFromFriends: checked }))
                    }
                  />
                </div>
              </div>

              {/* Máximo de Convites */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('matchmaking.preferences.maxInvites.title')}: {localPreferences.maxConcurrentInvites}
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('matchmaking.preferences.maxInvites.subtitle')}
                </p>
                <Slider
                  value={[localPreferences.maxConcurrentInvites]}
                  onValueChange={(value) => 
                    setLocalPreferences(prev => ({ ...prev, maxConcurrentInvites: value[0] }))
                  }
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Status de Disponibilidade */}
              <div className="space-y-2 sm:space-y-3">
                <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t('matchmaking.preferences.availability.title')}
                </Label>
                <Select
                  value={localPreferences.availabilityStatus}
                  onValueChange={(value: any) => 
                    setLocalPreferences(prev => ({ ...prev, availabilityStatus: value }))
                  }
                >
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{t('matchmaking.preferences.availability.available')}</div>
                          <div className="text-xs text-muted-foreground">{t('matchmaking.preferences.availability.availableDesc')}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="busy">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{t('matchmaking.preferences.availability.busy')}</div>
                          <div className="text-xs text-muted-foreground">{t('matchmaking.preferences.availability.busyDesc')}</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="invisible">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{t('matchmaking.preferences.availability.invisible')}</div>
                          <div className="text-xs text-muted-foreground">{t('matchmaking.preferences.availability.invisibleDesc')}</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-10 sm:h-11 text-xs sm:text-sm"
                >
                  {t('matchmaking.preferences.actions.cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-10 sm:h-11 text-xs sm:text-sm"
                >
                  {saving ? t('matchmaking.preferences.actions.saving') : t('matchmaking.preferences.actions.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}