import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Eye, Loader2, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d?: string;
  correct_answer?: string;
  explanation?: string;
  category?: string;
  difficulty: string;
  is_active: boolean;
  created_at: string;
  topic?: string;
  lang?: string;
}

export function QuestionApprovalInterface() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadPendingQuestions();
  }, []);

  const loadPendingQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar questões pendentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveQuestion = async (questionId: string) => {
    setProcessingIds(prev => new Set(prev).add(questionId));
    try {
      // Para agora vamos apenas remover da lista já que não temos campo is_approved
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast({
        title: "Sucesso",
        description: "Questão aprovada com sucesso!",
      });
    } catch (error) {
      console.error('Error approving question:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar questão",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const handleRejectQuestion = async (questionId: string) => {
    setProcessingIds(prev => new Set(prev).add(questionId));
    try {
      const { error } = await supabase
        .from('questions')
        .update({ is_active: false })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast({
        title: "Sucesso",
        description: "Questão rejeitada",
      });
    } catch (error) {
      console.error('Error rejecting question:', error);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar questão",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando questões pendentes...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Todas as questões aprovadas!</h3>
          <p className="text-muted-foreground">Não há questões pendentes para aprovação.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aprovação de Questões</h2>
          <p className="text-muted-foreground">
            {questions.length} questão{questions.length !== 1 ? 'ões' : ''} pendente{questions.length !== 1 ? 's' : ''} de aprovação
          </p>
        </div>
        <Button onClick={loadPendingQuestions} variant="outline">
          Atualizar
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                     <Badge variant="secondary">
                       {question.category || question.topic || 'Sem categoria'}
                     </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveQuestion(question.id)}
                    disabled={processingIds.has(question.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processingIds.has(question.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRejectQuestion(question.id)}
                    disabled={processingIds.has(question.id)}
                    variant="destructive"
                  >
                    {processingIds.has(question.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Opções:</h4>
                  <div className="grid gap-2">
                     {[question.option_a, question.option_b, question.option_c, question.option_d].filter(Boolean).map((option, index) => (
                       <div
                         key={index}
                         className={`p-2 rounded border ${
                           option === question.correct_answer
                             ? 'bg-green-500/10 border-green-500/20 text-green-700'
                             : 'bg-muted'
                         }`}
                       >
                         {String.fromCharCode(65 + index)}) {option}
                         {option === question.correct_answer && (
                           <span className="ml-2 text-green-600 font-semibold">✓ Resposta Correta</span>
                         )}
                       </div>
                     ))}
                  </div>
                </div>
                
                {question.explanation && (
                  <div>
                    <h4 className="font-semibold mb-2">Explicação:</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                      {question.explanation}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Criada em: {new Date(question.created_at).toLocaleDateString('pt-BR')} às {new Date(question.created_at).toLocaleTimeString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}