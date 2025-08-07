import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Textarea } from '@/components/shared/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Coins, Zap, Heart, AlertTriangle } from 'lucide-react';
import { CityEmergencyEvent, useContributeToEmergency, useUserEmergencyContributions } from '@/hooks/use-city-emergency';
import { useAuth } from '@/contexts/AuthContext';

interface EmergencyContributionDialogProps {
  emergency: CityEmergencyEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmergencyContributionDialog({
  emergency,
  open,
  onOpenChange,
}: EmergencyContributionDialogProps) {
  const [btzAmount, setBtzAmount] = useState(0);
  const [heroicAction, setHeroicAction] = useState('');
  const { user } = useAuth();
  
  const contributeMutation = useContributeToEmergency();
  const { data: userContributions } = useUserEmergencyContributions(emergency.id);

  const totalUserBtz = userContributions?.reduce((sum, c) => sum + c.btz_contributed, 0) || 0;
  const totalUserXp = userContributions?.reduce((sum, c) => sum + c.xp_contributed, 0) || 0;

  const handleContribute = async () => {
    if (btzAmount <= 0) return;

    await contributeMutation.mutateAsync({
      emergencyId: emergency.id,
      btzAmount,
      xpAmount: Math.floor(btzAmount * 0.1), // 10% do BTZ vira XP
      heroicAction: heroicAction.trim() || undefined,
    });

    setBtzAmount(0);
    setHeroicAction('');
    onOpenChange(false);
  };

  const getCrisisEmoji = (type: string) => {
    switch (type) {
      case 'financial_hack': return '🛡️';
      case 'market_crash': return '📈';
      case 'cyber_attack': return '⚡';
      default: return '🚨';
    }
  };

  const getActionSuggestions = (type: string) => {
    switch (type) {
      case 'financial_hack':
        return [
          'Fortaleci a segurança dos sistemas bancários',
          'Implementei protocolos de criptografia avançada',
          'Detectei e bloqueei tentativas de invasão',
          'Eduquei outros sobre segurança financeira'
        ];
      case 'market_crash':
        return [
          'Estabilizei o mercado com análises precisas',
          'Ofereci consultoria financeira emergencial',
          'Criei estratégias de recuperação econômica',
          'Ajudei investidores a proteger seus ativos'
        ];
      case 'cyber_attack':
        return [
          'Derrubei firewalls maliciosos',
          'Recuperei dados corrompidos',
          'Implementei contramedidas de segurança',
          'Rastreei e neutralizei ameaças'
        ];
      default:
        return [
          'Ajudei a comunidade em momento crítico',
          'Contribuí para a estabilidade da cidade',
          'Usei conhecimento financeiro para o bem comum'
        ];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getCrisisEmoji(emergency.crisis_type)}</span>
            Contribuir para a Emergência
          </DialogTitle>
          <DialogDescription>
            Ajude a cidade a superar esta crise. Suas contribuições são amplificadas em {emergency.reward_multiplier}x!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progresso atual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status da Crise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {emergency.current_btz_contributions.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    BTZ de {emergency.btz_goal.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((emergency.current_btz_contributions / emergency.btz_goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {emergency.current_xp_contributions.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    XP de {emergency.xp_goal.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((emergency.current_xp_contributions / emergency.xp_goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suas contribuições */}
          {(totalUserBtz > 0 || totalUserXp > 0) && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  Suas Contribuições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Badge variant="outline" className="border-blue-500 text-blue-700">
                    {totalUserBtz} BTZ contribuídos
                  </Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-700">
                    {totalUserXp} XP gerados
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário de contribuição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nova Contribuição</CardTitle>
              <CardDescription>
                Contribua com BTZ para ajudar a cidade. Cada BTZ contribuído gera 0.1 XP automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="btz-amount" className="block text-sm font-medium mb-2">
                  Quantidade de BTZ
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="btz-amount"
                    type="number"
                    min="1"
                    max="10000"
                    value={btzAmount || ''}
                    onChange={(e) => setBtzAmount(parseInt(e.target.value) || 0)}
                    placeholder="Digite a quantidade"
                    className="pl-10"
                  />
                </div>
                {btzAmount > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Será gerado {Math.floor(btzAmount * 0.1)} XP automaticamente
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="heroic-action" className="block text-sm font-medium mb-2">
                  Ação Heroica (opcional)
                </label>
                <Textarea
                  id="heroic-action"
                  placeholder="Descreva como você ajudou na crise..."
                  value={heroicAction}
                  onChange={(e) => setHeroicAction(e.target.value)}
                  rows={3}
                />
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Sugestões:</p>
                  <div className="flex flex-wrap gap-1">
                    {getActionSuggestions(emergency.crisis_type).map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1"
                        onClick={() => setHeroicAction(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recompensas */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Multiplicador de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Todas as recompensas durante a crise são multiplicadas por:</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {emergency.reward_multiplier}x
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleContribute}
              disabled={btzAmount <= 0 || contributeMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {contributeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Contribuindo...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Contribuir Agora
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
