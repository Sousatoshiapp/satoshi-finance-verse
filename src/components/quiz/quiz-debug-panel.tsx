import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface QuizDebugPanelProps {
  category?: string;
  currentQuestion?: {
    id: string;
    category: string;
    difficulty: string;
    question: string;
  };
  sessionStats?: {
    currentIndex: number;
    totalQuestions: number;
    currentDifficulty: string;
  };
  isVisible: boolean;
  onToggle: () => void;
}

export function QuizDebugPanel({
  category,
  currentQuestion,
  sessionStats,
  isVisible,
  onToggle
}: QuizDebugPanelProps) {
  if (!isVisible) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={onToggle}
          className="bg-black/50 border-orange-500/50 text-orange-300 hover:bg-orange-500/20"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-80">
      <Card className="bg-black/90 border-orange-500/50 text-orange-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-orange-300">🔍 Quiz Debug</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggle}
              className="h-6 w-6 p-0 text-orange-300 hover:bg-orange-500/20"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Categoria Selecionada */}
          <div>
            <div className="font-medium text-orange-300 mb-1">Categoria Selecionada:</div>
            <Badge variant="outline" className="border-orange-500/50 text-orange-200">
              {category || 'Nenhuma'}
            </Badge>
          </div>

          {/* Questão Atual */}
          {currentQuestion && (
            <div>
              <div className="font-medium text-orange-300 mb-1">Questão Atual:</div>
              <div className="bg-orange-950/50 p-2 rounded text-xs">
                <div>ID: <span className="text-orange-200">{currentQuestion.id}</span></div>
                <div>Categoria: <span className="text-orange-200">{currentQuestion.category}</span></div>
                <div>Dificuldade: <span className="text-orange-200">{currentQuestion.difficulty}</span></div>
                <div className="mt-1 text-orange-100">
                  {currentQuestion.question.substring(0, 80)}...
                </div>
              </div>
            </div>
          )}

          {/* Estatísticas da Sessão */}
          {sessionStats && (
            <div>
              <div className="font-medium text-orange-300 mb-1">Sessão:</div>
              <div className="bg-orange-950/50 p-2 rounded text-xs space-y-1">
                <div>Progresso: <span className="text-orange-200">{sessionStats.currentIndex + 1}/{sessionStats.totalQuestions}</span></div>
                <div>Dificuldade: <span className="text-orange-200">{sessionStats.currentDifficulty}</span></div>
              </div>
            </div>
          )}

          {/* Verificação de Compatibilidade */}
          <div>
            <div className="font-medium text-orange-300 mb-1">Verificação:</div>
            <div className="bg-orange-950/50 p-2 rounded text-xs">
              {category && currentQuestion ? (
                currentQuestion.category === category ? (
                  <div className="text-green-400">✅ Categoria correta</div>
                ) : (
                  <div className="text-red-400">
                    ❌ Categoria incorreta!
                    <div>Esperado: {category}</div>
                    <div>Recebido: {currentQuestion.category}</div>
                  </div>
                )
              ) : (
                <div className="text-yellow-400">⏳ Aguardando dados...</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}