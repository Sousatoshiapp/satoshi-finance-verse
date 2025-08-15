import { useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useDuelTransition } from '@/hooks/use-duel-transition';

interface DuelTransitionTestProps {
  duelId?: string;
}

export function DuelTransitionTest({ duelId = 'test-123' }: DuelTransitionTestProps) {
  const navigate = useNavigate();
  const { shouldUseUnifiedSystem, getDuelRoute, getSystemName } = useDuelTransition();
  const [testDuelId, setTestDuelId] = useState(duelId);

  const handleTestDuel = () => {
    const route = getDuelRoute(testDuelId);
    console.log('🚀 [TRANSITION TEST] Navegando para:', route);
    navigate(route);
  };

  const isUnified = shouldUseUnifiedSystem(testDuelId);
  const systemName = getSystemName(testDuelId);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔄 Teste de Transição
          <Badge variant={isUnified ? 'default' : 'secondary'}>
            {systemName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">ID do Duelo:</label>
          <input
            type="text"
            value={testDuelId}
            onChange={(e) => setTestDuelId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Digite um ID de duelo"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <strong>Sistema Detectado:</strong> {systemName}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Rota:</strong> {getDuelRoute(testDuelId)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">
              {isUnified ? '🆕 Sistema Unificado' : '🔄 Sistema Legacy'}
            </div>
            <div className="text-xs text-muted-foreground">
              {isUnified 
                ? 'Usa useAdaptiveQuizEngine + validação simples'
                : 'Sistema antigo com formatações complexas'
              }
            </div>
          </div>
        </div>

        <Button 
          onClick={handleTestDuel}
          className="w-full"
          variant={isUnified ? 'default' : 'secondary'}
        >
          🎮 Testar {systemName} System
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          ⚠️ Certifique-se de que existe um duelo com este ID
        </div>
      </CardContent>
    </Card>
  );
}