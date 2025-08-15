import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Eye, Loader2, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: any; // JSON field from Supabase
  correct_answer?: string;
  explanation?: string;
  category?: string;
  difficulty: string;
  topic?: string;
  approval_status: string;
  is_approved?: boolean;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

export function QuestionApprovalInterface() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [massProcessing, setMassProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingQuestions();
  }, []);

  const loadPendingQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
      setSelectedQuestions(new Set());
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
      // Get the question to convert options if needed
      const question = questions.find(q => q.id === questionId);
      if (!question) throw new Error('Questão não encontrada');

      // Convert options from object to array if needed
      let optionsArray: string[] = [];
      if (Array.isArray(question.options)) {
        optionsArray = question.options;
      } else if (typeof question.options === 'object' && question.options !== null) {
        optionsArray = Object.values(question.options);
      }

      const { error } = await supabase
        .from('quiz_questions')
        .update({ 
          approval_status: 'approved',
          is_approved: true,
          options: optionsArray,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setSelectedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
      
      toast({
        title: "Sucesso",
        description: "Questão aprovada com sucesso!",
      });
    } catch (error) {
      console.error('Error approving question:', error);
      toast({
        title: "Erro",
        description: `Falha ao aprovar questão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
        .from('quiz_questions')
        .update({ approval_status: 'rejected' })
        .eq('id', questionId);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setSelectedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
      
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

  const handleMassApprove = async () => {
    if (selectedQuestions.size === 0) return;
    
    setMassProcessing(true);
    const successfulApprovals: string[] = [];
    const failedApprovals: string[] = [];
    
    try {
      const questionIds = Array.from(selectedQuestions);
      
      // Process each question individually to handle options conversion
      const updatePromises = questionIds.map(async (questionId) => {
        try {
          const question = questions.find(q => q.id === questionId);
          if (!question) {
            failedApprovals.push(questionId);
            return { error: new Error('Questão não encontrada') };
          }

          // Convert options from object to array if needed
          let optionsArray: string[] = [];
          if (Array.isArray(question.options)) {
            optionsArray = question.options;
          } else if (typeof question.options === 'object' && question.options !== null) {
            optionsArray = Object.values(question.options);
          }

          const result = await supabase
            .from('quiz_questions')
            .update({ 
              approval_status: 'approved',
              is_approved: true,
              options: optionsArray,
              approved_at: new Date().toISOString(),
              approved_by: (await supabase.auth.getUser()).data.user?.id
            })
            .eq('id', questionId);

          if (result.error) {
            failedApprovals.push(questionId);
            console.error(`Error approving question ${questionId}:`, result.error);
          } else {
            successfulApprovals.push(questionId);
          }
          
          return result;
        } catch (error) {
          failedApprovals.push(questionId);
          console.error(`Error processing question ${questionId}:`, error);
          return { error };
        }
      });

      await Promise.all(updatePromises);
      
      // Remove only successfully approved questions from the interface
      if (successfulApprovals.length > 0) {
        setQuestions(prev => prev.filter(q => !successfulApprovals.includes(q.id)));
        setSelectedQuestions(prev => {
          const newSet = new Set(prev);
          successfulApprovals.forEach(id => newSet.delete(id));
          return newSet;
        });
      }
      
      // Show appropriate toast message
      if (successfulApprovals.length === questionIds.length) {
        toast({
          title: "Sucesso",
          description: `${successfulApprovals.length} questão${successfulApprovals.length !== 1 ? 'ões' : ''} aprovada${successfulApprovals.length !== 1 ? 's' : ''} com sucesso!`,
        });
      } else if (successfulApprovals.length > 0) {
        toast({
          title: "Aprovação Parcial",
          description: `${successfulApprovals.length} de ${questionIds.length} questões aprovadas. ${failedApprovals.length} falharam.`,
          variant: "default"
        });
      } else {
        throw new Error('Nenhuma questão foi aprovada');
      }
      
    } catch (error) {
      console.error('Error mass approving questions:', error);
      toast({
        title: "Erro",
        description: `Falha ao aprovar questões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      
      // Reload questions to ensure sync with database
      loadPendingQuestions();
    } finally {
      setMassProcessing(false);
    }
  };

  const handleMassReject = async () => {
    if (selectedQuestions.size === 0) return;
    
    setMassProcessing(true);
    try {
      const questionIds = Array.from(selectedQuestions);
      const { error } = await supabase
        .from('quiz_questions')
        .update({ approval_status: 'rejected' })
        .in('id', questionIds);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => !selectedQuestions.has(q.id)));
      setSelectedQuestions(new Set());
      
      toast({
        title: "Sucesso",
        description: `${questionIds.length} questão${questionIds.length !== 1 ? 'ões' : ''} rejeitada${questionIds.length !== 1 ? 's' : ''} com sucesso!`,
      });
    } catch (error) {
      console.error('Error mass rejecting questions:', error);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar questões em massa",
        variant: "destructive"
      });
    } finally {
      setMassProcessing(false);
    }
  };

  const handleApproveAll = async () => {
    if (questions.length === 0) return;
    
    setMassProcessing(true);
    const successfulApprovals: string[] = [];
    const failedApprovals: string[] = [];
    
    try {
      // Process each question individually to handle options conversion
      const updatePromises = questions.map(async (question) => {
        try {
          // Convert options from object to array if needed
          let optionsArray: string[] = [];
          if (Array.isArray(question.options)) {
            optionsArray = question.options;
          } else if (typeof question.options === 'object' && question.options !== null) {
            optionsArray = Object.values(question.options);
          }

          const result = await supabase
            .from('quiz_questions')
            .update({ 
              approval_status: 'approved',
              is_approved: true,
              options: optionsArray,
              approved_at: new Date().toISOString(),
              approved_by: (await supabase.auth.getUser()).data.user?.id
            })
            .eq('id', question.id);

          if (result.error) {
            failedApprovals.push(question.id);
            console.error(`Error approving question ${question.id}:`, result.error);
          } else {
            successfulApprovals.push(question.id);
          }
          
          return result;
        } catch (error) {
          failedApprovals.push(question.id);
          console.error(`Error processing question ${question.id}:`, error);
          return { error };
        }
      });

      await Promise.all(updatePromises);
      
      // Remove only successfully approved questions from the interface
      if (successfulApprovals.length > 0) {
        setQuestions(prev => prev.filter(q => !successfulApprovals.includes(q.id)));
        setSelectedQuestions(new Set());
      }
      
      // Show appropriate toast message
      if (successfulApprovals.length === questions.length) {
        toast({
          title: "Sucesso",
          description: `Todas as ${successfulApprovals.length} questões aprovadas com sucesso!`,
        });
      } else if (successfulApprovals.length > 0) {
        toast({
          title: "Aprovação Parcial",
          description: `${successfulApprovals.length} de ${questions.length} questões aprovadas. ${failedApprovals.length} falharam.`,
          variant: "default"
        });
      } else {
        throw new Error('Nenhuma questão foi aprovada');
      }
      
    } catch (error) {
      console.error('Error approving all questions:', error);
      toast({
        title: "Erro",
        description: `Falha ao aprovar questões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      
      // Reload questions to ensure sync with database
      loadPendingQuestions();
    } finally {
      setMassProcessing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id)));
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
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
          {selectedQuestions.size > 0 && (
            <p className="text-sm text-primary">
              {selectedQuestions.size} questão{selectedQuestions.size !== 1 ? 'ões' : ''} selecionada{selectedQuestions.size !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPendingQuestions} variant="outline">
            Atualizar
          </Button>
        </div>
      </div>

      {questions.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedQuestions.size === questions.length && questions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Selecionar todas ({questions.length})
                </label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleMassApprove}
                disabled={selectedQuestions.size === 0 || massProcessing}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                {massProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Aprovar Selecionadas ({selectedQuestions.size})
              </Button>
              
              <Button
                onClick={handleMassReject}
                disabled={selectedQuestions.size === 0 || massProcessing}
                variant="destructive"
                size="sm"
              >
                {massProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Rejeitar Selecionadas ({selectedQuestions.size})
              </Button>
              
              <Button
                onClick={handleApproveAll}
                disabled={questions.length === 0 || massProcessing}
                variant="secondary"
                size="sm"
              >
                {massProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Aprovar Todas
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className={selectedQuestions.has(question.id) ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleSelectQuestion(question.id)}
                    className="mt-1"
                  />
                  <div className="space-y-2 flex-1">
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
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveQuestion(question.id)}
                    disabled={processingIds.has(question.id) || massProcessing}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {processingIds.has(question.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRejectQuestion(question.id)}
                    disabled={processingIds.has(question.id) || massProcessing}
                    variant="destructive"
                    size="sm"
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
                      {(() => {
                        // Handle both array and object formats for options
                        let optionsToRender: string[] = [];
                        
                        if (Array.isArray(question.options)) {
                          optionsToRender = question.options;
                        } else if (typeof question.options === 'object' && question.options !== null) {
                          optionsToRender = Object.values(question.options);
                        }
                        
                        return optionsToRender.length > 0 ? optionsToRender.map((option: string, index: number) => (
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
                        )) : <p className="text-muted-foreground">Opções não disponíveis</p>;
                      })()}
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