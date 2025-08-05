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

const topicsMap: Record<string, string> = {
  "financas": "Finanças Gerais",
  "investimentos": "Investimentos", 
  "criptomoedas": "Criptomoedas",
  "economia": "Economia"
};

const skillLevelOptions = [
  { value: 'similar', label: 'Nível Similar', description: 'Adversários próximos ao seu nível' },
  { value: 'any', label: 'Qualquer Nível', description: 'Qualquer adversário disponível' },
  { value: 'challenging', label: 'Desafiador', description: 'Adversários de nível superior' }
];

interface MatchmakingPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchmakingPreferencesModal({ isOpen, onClose }: MatchmakingPreferencesModalProps) {
  const { preferences, updatePreferences } = useMatchmakingPreferences();
  const [localPreferences, setLocalPreferences] = React.useState<MatchmakingPreferences>(preferences);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updatePreferences(localPreferences);
      
      if (success) {
        toast({
          title: "✅ Preferências Salvas",
          description: "Suas preferências de matchmaking foram atualizadas!",
        });
        onClose();
      } else {
        throw new Error('Falha ao salvar preferências');
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
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
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Preferências de Matchmaking
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure como você gostaria de encontrar adversários para duelos
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Tópicos Preferidos */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Target className="h-5 w-5" />
                  Tópicos Preferidos
                </Label>
                <p className="text-sm text-muted-foreground">
                  Selecione os tópicos que você mais gosta de duelar
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(topicsMap).map(([key, label]) => {
                    const isSelected = localPreferences.preferredTopics.includes(key);
                    return (
                      <Button
                        key={key}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTopic(key)}
                        className={`justify-start ${isSelected ? 'bg-primary' : ''}`}
                      >
                        {isSelected && <Check className="h-4 w-4 mr-2" />}
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Permitir Bots */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Bot className="h-5 w-5" />
                  Permitir Adversários Bot
                </Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Aceitar duelos contra adversários controlados por IA
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
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Shield className="h-5 w-5" />
                  Nível de Adversários
                </Label>
                <Select
                  value={localPreferences.skillLevelRange}
                  onValueChange={(value: any) => 
                    setLocalPreferences(prev => ({ ...prev, skillLevelRange: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-aceitar de Amigos */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Users className="h-5 w-5" />
                  Auto-aceitar de Amigos
                </Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Aceitar automaticamente convites de amigos
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
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Clock className="h-5 w-5" />
                  Convites Simultâneos: {localPreferences.maxConcurrentInvites}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Máximo de convites que você pode receber ao mesmo tempo
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
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Zap className="h-5 w-5" />
                  Status de Disponibilidade
                </Label>
                <Select
                  value={localPreferences.availabilityStatus}
                  onValueChange={(value: any) => 
                    setLocalPreferences(prev => ({ ...prev, availabilityStatus: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <div className="font-medium">Disponível</div>
                          <div className="text-xs text-muted-foreground">Aceitar todos os convites</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="busy">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div>
                          <div className="font-medium">Ocupado</div>
                          <div className="text-xs text-muted-foreground">Apenas convites prioritários</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="invisible">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <div>
                          <div className="font-medium">Invisível</div>
                          <div className="text-xs text-muted-foreground">Não receber convites</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Salvando..." : "Salvar Preferências"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}