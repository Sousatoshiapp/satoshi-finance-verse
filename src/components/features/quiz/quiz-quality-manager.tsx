import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Textarea } from "@/components/shared/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  FileText,
  Wrench,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  theme: string;
  difficulty: string;
  is_approved: boolean | null;
  created_at: string;
}

interface QuizQualityManagerProps {
  onUpdate?: () => void;
}

export function QuizQualityManager({ onUpdate }: QuizQualityManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'problematic'>('pending');
  const [feedback, setFeedback] = useState('');
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('quiz_questions')
        .select('*')
        .not('theme', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'problematic') {
        query = query.or('correct_answer.like.Opção %,correct_answer.like.Option %');
      } else {
        const approvalFilter = filter === 'pending' ? null : filter === 'approved';
        query = query.eq('is_approved', approvalFilter);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      const formattedQuestions = data?.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      })) || [];

      setQuestions(formattedQuestions);
      setCurrentIndex(0);
      setShowAnswer(false);
      setFeedback('');
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  const currentQuestion = questions[currentIndex];

  const handleApproval = async (isApproved: boolean) => {
    if (!currentQuestion) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .update({ 
          is_approved: isApproved,
          review_feedback: feedback || null
        })
        .eq('id', currentQuestion.id);

      if (error) throw error;

      toast({
        title: isApproved ? "Pergunta Aprovada" : "Pergunta Rejeitada",
        description: `A pergunta foi ${isApproved ? 'aprovada' : 'rejeitada'} com sucesso`,
        variant: "default"
      });

      // Move to next question or reload
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await loadQuestions();
      }

      setShowAnswer(false);
      setFeedback('');
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a aprovação",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!currentQuestion) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', currentQuestion.id);

      if (error) throw error;

      toast({
        title: "Pergunta Deletada",
        description: "A pergunta foi removida permanentemente",
        variant: "default"
      });

      // Reload questions
      await loadQuestions();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a pergunta",
        variant: "destructive"
      });
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setFeedback('');
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setFeedback('');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isApproved: boolean | null) => {
    if (isApproved === null) return 'bg-gray-100 text-gray-800';
    return isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const isProblematicQuestion = (question: Question) => {
    return question.correct_answer.includes('Opção ') || question.correct_answer.includes('Option ');
  };

  const fixSingleQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || !isProblematicQuestion(question)) return;

    try {
      const optionMatch = question.correct_answer.match(/Opção ([A-D])|Option ([A-D])/i);
      if (!optionMatch) return;

      const optionLetter = optionMatch[1] || optionMatch[2];
      const optionIndex = optionLetter.charCodeAt(0) - 65;
      
      if (optionIndex < 0 || optionIndex >= question.options.length) return;

      const correctAnswerText = question.options[optionIndex];

      const { error } = await supabase
        .from('quiz_questions')
        .update({ correct_answer: correctAnswerText })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Questão Corrigida",
        description: `Resposta atualizada para: "${correctAnswerText}"`,
        variant: "default"
      });

      await loadQuestions();
    } catch (error) {
      console.error('Erro ao corrigir questão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível corrigir a questão",
        variant: "destructive"
      });
    }
  };

  const fixAllProblematicQuestions = async () => {
    try {
      setIsFixing(true);
      
      const { data, error } = await supabase.functions.invoke('fix-quiz-answers');
      
      if (error) throw error;

      toast({
        title: "Correção Concluída",
        description: `${data.fixed} questões foram corrigidas automaticamente`,
        variant: "default"
      });

      await loadQuestions();
    } catch (error) {
      console.error('Erro ao corrigir questões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível executar a correção automática",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-medium">Nenhuma pergunta encontrada</h3>
            <p className="text-sm text-muted-foreground">
               {filter === 'pending' && 'Não há perguntas pendentes para revisar'}
              {filter === 'approved' && 'Não há perguntas aprovadas'}
              {filter === 'rejected' && 'Não há perguntas rejeitadas'}
              {filter === 'problematic' && 'Não há perguntas problemáticas! 🎉'}
            </p>
          </div>
          <Button onClick={loadQuestions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Controle de Qualidade</h2>
          <p className="text-muted-foreground">Revise e aprove perguntas geradas</p>
        </div>
        <Button onClick={loadQuestions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Recarregar
        </Button>
      </div>

          {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          <TabsTrigger value="problematic" className="text-orange-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Problemáticas
          </TabsTrigger>
        </TabsList>
        
        {filter === 'problematic' && (
          <Button
            onClick={fixAllProblematicQuestions}
            disabled={isFixing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isFixing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isFixing ? 'Corrigindo...' : 'Corrigir Todas'}
          </Button>
        )}
      </div>

        <TabsContent value={filter} className="space-y-4">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentIndex + 1} de {questions.length}
              </span>
              <Button
                onClick={nextQuestion}
                disabled={currentIndex >= questions.length - 1}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge className={getStatusColor(currentQuestion.is_approved)}>
                {currentQuestion.is_approved === null ? 'Pendente' : 
                 currentQuestion.is_approved ? 'Aprovada' : 'Rejeitada'}
              </Badge>
              {isProblematicQuestion(currentQuestion) && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Problema
                </Badge>
              )}
            </div>
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {currentQuestion.theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </CardTitle>
                  <CardDescription>
                    ID: {currentQuestion.id} • {new Date(currentQuestion.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  size="sm"
                >
                  {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAnswer ? 'Ocultar' : 'Mostrar'} Resposta
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question */}
              <div>
                <h3 className="font-medium mb-2">Pergunta:</h3>
                <p className="text-sm bg-muted p-3 rounded">{currentQuestion.question}</p>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Opções:</h3>
                  {isProblematicQuestion(currentQuestion) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-orange-600 font-medium">
                        Resposta problemática: "{currentQuestion.correct_answer}"
                      </span>
                      <Button
                        onClick={() => fixSingleQuestion(currentQuestion.id)}
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        Corrigir
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`text-sm p-3 rounded border ${
                        showAnswer && option === currentQuestion.correct_answer
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-background'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}) {option}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {showAnswer && currentQuestion.explanation && (
                <div>
                  <h3 className="font-medium mb-2">Explicação:</h3>
                  <p className="text-sm bg-blue-50 p-3 rounded text-blue-800">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Feedback for Pending Questions */}
              {filter === 'pending' && (
                <div>
                  <h3 className="font-medium mb-2">Feedback (Opcional):</h3>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Adicione comentários sobre a qualidade da pergunta..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Action Buttons for Pending Questions */}
              {filter === 'pending' && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleApproval(false)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      onClick={() => handleApproval(true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}