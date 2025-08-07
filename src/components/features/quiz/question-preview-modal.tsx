import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Card, CardContent } from '@/components/shared/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: any;
  correct_answer: string;
  explanation: string;
  theme: string;
  difficulty: string;
  is_approved: boolean;
  created_at: string;
}

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  difficulty?: string;
}

export function QuestionPreviewModal({ isOpen, onClose, theme, difficulty }: QuestionPreviewModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen, theme, difficulty]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (theme) {
        query = query.eq('theme', theme);
      }
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQuestions(data || []);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar perguntas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveQuestion = async (questionId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .update({ is_approved: approved })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId 
            ? { ...q, is_approved: approved }
            : q
        )
      );

      toast({
        title: approved ? "✅ Pergunta aprovada" : "❌ Pergunta rejeitada",
        description: "Status atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar pergunta",
        variant: "destructive"
      });
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => q.id !== questionId));
      
      if (currentIndex >= questions.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }

      toast({
        title: "🗑️ Pergunta excluída",
        description: "Pergunta removida com sucesso",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir pergunta",
        variant: "destructive"
      });
    }
  };

  const currentQuestion = questions[currentIndex];

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando perguntas...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentQuestion) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center py-8">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <span className="ml-2">Nenhuma pergunta encontrada</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Validação de Perguntas
            <span className="text-sm text-muted-foreground">
              ({currentIndex + 1}/{questions.length})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              ← Anterior
            </Button>
            
            <div className="flex gap-2">
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant={currentQuestion.is_approved ? "default" : "secondary"}>
                {currentQuestion.is_approved ? "Aprovada" : "Pendente"}
              </Badge>
              <Badge variant="outline">
                {currentQuestion.theme}
              </Badge>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === questions.length - 1}
            >
              Próxima →
            </Button>
          </div>

          {/* Question Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {currentQuestion.question}
                </h3>

                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.correct_answer;
                    const showCorrect = showAnswer && isCorrect;
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg transition-colors ${
                          showCorrect 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-background hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {showCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                          <span className="font-medium">{String.fromCharCode(65 + index)})</span>
                          <span>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showAnswer && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Explicação:</h4>
                    <p className="text-blue-800">{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswer(!showAnswer)}
                  >
                    {showAnswer ? "Ocultar" : "Mostrar"} Resposta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => approveQuestion(currentQuestion.id, true)}
                disabled={currentQuestion.is_approved}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => approveQuestion(currentQuestion.id, false)}
                disabled={!currentQuestion.is_approved}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </div>

            <Button
              variant="destructive"
              onClick={() => deleteQuestion(currentQuestion.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            ID: {currentQuestion.id} | Criada em: {new Date(currentQuestion.created_at).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}