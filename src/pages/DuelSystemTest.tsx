import { DuelTransitionTest } from '@/components/duels/duel-transition-test';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';

export default function DuelSystemTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              🔬 Sistema de Duelos - Teste de Transição
              <Badge variant="outline">BETA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              
              {/* Sistema Legacy */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🔄 Sistema Legacy
                  <Badge variant="secondary">Antigo</Badge>
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• formatQuizQuestion + convertToInterfaceQuestion</li>
                  <li>• Validação complexa na edge function</li>
                  <li>• Múltiplas comparações de strings</li>
                  <li>• EnhancedDuelInterface</li>
                  <li>• ❌ Problemas de reconhecimento</li>
                </ul>
              </div>

              {/* Sistema Unificado */}
              <div className="p-4 border rounded-lg border-primary/20 bg-primary/5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🆕 Sistema Unificado
                  <Badge variant="default">Novo</Badge>
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• useDuelAdaptiveEngine (baseado no Quiz Solo)</li>
                  <li>• Validação simples: selectedAnswer === correct_answer</li>
                  <li>• SEM formatações desnecessárias</li>
                  <li>• UnifiedDuelInterface</li>
                  <li>• ✅ Respostas reconhecidas corretamente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparação Técnica */}
        <Card>
          <CardHeader>
            <CardTitle>⚖️ Comparação Técnica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              
              <div className="space-y-2">
                <h4 className="font-medium">📊 Busca de Questões</h4>
                <div className="text-sm space-y-1">
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                    <strong>Legacy:</strong> Formatação complexa
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700">
                    <strong>Unificado:</strong> Mesma query do Quiz Solo
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">🔍 Validação</h4>
                <div className="text-sm space-y-1">
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                    <strong>Legacy:</strong> normalizeText + caseInsensitive
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700">
                    <strong>Unificado:</strong> Comparação direta ===
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">🎯 Consistência</h4>
                <div className="text-sm space-y-1">
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                    <strong>Legacy:</strong> Sistema separado
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-green-700">
                    <strong>Unificado:</strong> Baseado no Quiz Solo
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste */}
        <DuelTransitionTest />

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Como Testar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Digite o ID de um duelo existente no campo acima</p>
              <p><strong>2.</strong> Clique no botão para navegar para o sistema de teste</p>
              <p><strong>3.</strong> Teste as respostas e veja se são reconhecidas corretamente</p>
              <p><strong>4.</strong> Compare a experiência com o sistema antigo</p>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800">
              <strong>⚠️ Importante:</strong> Certifique-se de que o duelo existe no banco de dados antes de testar.
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}