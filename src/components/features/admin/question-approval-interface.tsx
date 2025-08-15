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
  option_a: string;
  option_b: string;
  option_c: string;
  option_d?: string;
  correct_answer?: string;
  explanation?: string;
  category?: string;
  difficulty: string;
  is_active: boolean;
  is_approved?: boolean;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  topic?: string;
  lang?: string;
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
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .eq('is_approved', false)
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
      const { error } = await supabase
        .from('questions')
        .update({ 
          is_approved: true, 
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
    try {
      const questionIds = Array.from(selectedQuestions);
      const { error } = await supabase
        .from('questions')
        .update({ 
          is_approved: true, 
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .in('id', questionIds);

      if (error) throw error;

      setQuestions(prev => prev.filter(q => !selectedQuestions.has(q.id)));
      setSelectedQuestions(new Set());
      
      toast({
        title: "Sucesso",
        description: `${questionIds.length} questão${questionIds.length !== 1 ? 'ões' : ''} aprovada${questionIds.length !== 1 ? 's' : ''} com sucesso!`,
      });
    } catch (error) {
      console.error('Error mass approving questions:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar questões em massa",
        variant: "destructive"
      });
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
        .from('questions')
        .update({ is_active: false })
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
    try {
      const questionIds = questions.map(q => q.id);
      const { error } = await supabase
        .from('questions')
        .update({ 
          is_approved: true, 
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .in('id', questionIds);

      if (error) throw error;

      setQuestions([]);
      setSelectedQuestions(new Set());
      
      toast({
        title: "Sucesso",
        description: `Todas as ${questionIds.length} questões aprovadas com sucesso!`,
      });
    } catch (error) {
      console.error('Error approving all questions:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar todas as questões",
        variant: "destructive"
      });
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