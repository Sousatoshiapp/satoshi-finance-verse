import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Badge } from "@/components/shared/ui/badge";
import { Textarea } from "@/components/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shared/ui/dialog";
import { HelpCircle, Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
}

export default function AdminQuizQuestions() {
  const { t } = useI18n();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "",
    difficulty: "medium",
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false }
    ],
    explanation: ""
  });
  const { toast } = useToast();

  // Mock data para demonstração
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      // Simulando dados de questões
      const mockQuestions: Question[] = [
        {
          id: '1',
          question: 'O que é inflação?',
          category: 'Economia',
          difficulty: 'easy',
          options: [
            { id: '1a', text: 'Aumento geral dos preços', isCorrect: true },
            { id: '1b', text: 'Diminuição dos preços', isCorrect: false },
            { id: '1c', text: 'Aumento da produção', isCorrect: false },
            { id: '1d', text: 'Redução do desemprego', isCorrect: false }
          ],
          explanation: 'Inflação é o aumento contínuo e generalizado dos preços de bens e serviços.'
        },
        {
          id: '2',
          question: 'Qual é a taxa Selic?',
          category: 'Investimentos',
          difficulty: 'medium',
          options: [
            { id: '2a', text: 'Taxa de câmbio', isCorrect: false },
            { id: '2b', text: 'Taxa básica de juros', isCorrect: true },
            { id: '2c', text: 'Taxa de inflação', isCorrect: false },
            { id: '2d', text: 'Taxa de desemprego', isCorrect: false }
          ],
          explanation: 'A taxa Selic é a taxa básica de juros da economia brasileira.'
        }
      ];
      
      setQuestions(mockQuestions);
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao carregar questões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const questionData = {
        ...newQuestion,
        id: editingQuestion?.id || Date.now().toString()
      };

      if (editingQuestion) {
        setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? questionData as Question : q));
        toast({
          title: "Questão atualizada!",
          description: "A questão foi atualizada com sucesso",
        });
      } else {
        setQuestions(prev => [...prev, questionData as Question]);
        toast({
          title: "Questão criada!",
          description: "Nova questão foi adicionada ao banco",
        });
      }

      resetForm();
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao salvar questão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({
        title: "Questão removida!",
        description: "A questão foi removida do banco",
      });
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao remover questão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewQuestion({
      question: "",
      category: "",
      difficulty: "medium",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ],
      explanation: ""
    });
    setEditingQuestion(null);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(questions.map(q => q.category))];

  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length
  };

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Banco de Questões</h1>
                  <p className="text-muted-foreground">Gerencie as questões dos quizzes</p>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Questão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuestion ? 'Editar Questão' : 'Nova Questão'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Categoria</label>
                          <Input
                            value={newQuestion.category}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="Ex: Economia, Investimentos..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dificuldade</label>
                          <Select 
                            value={newQuestion.difficulty} 
                            onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Fácil</SelectItem>
                              <SelectItem value="medium">Médio</SelectItem>
                              <SelectItem value="hard">Difícil</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Pergunta</label>
                        <Textarea
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="Digite a pergunta..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-sm font-medium">Opções de Resposta</label>
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={option.isCorrect}
                              onChange={() => {
                                const newOptions = newQuestion.options.map((opt, i) => ({
                                  ...opt,
                                  isCorrect: i === index
                                }));
                                setNewQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                            />
                            <Input
                              value={option.text}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options];
                                newOptions[index].text = e.target.value;
                                setNewQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                              placeholder={`Opção ${index + 1}`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Explicação (opcional)</label>
                        <Textarea
                          value={newQuestion.explanation}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                          placeholder="Explique por que esta é a resposta correta..."
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={resetForm}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveQuestion}>
                          {editingQuestion ? 'Atualizar' : 'Criar'} Questão
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <HelpCircle className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-500 font-bold">F</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fácil</p>
                        <p className="text-2xl font-bold">{stats.easy}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <span className="text-yellow-500 font-bold">M</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Médio</p>
                        <p className="text-2xl font-bold">{stats.medium}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-red-500 font-bold">D</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Difícil</p>
                        <p className="text-2xl font-bold">{stats.hard}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar questões..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Questões ({filteredQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">{t('common.loading')}...</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuestions.map((question) => (
                        <div key={question.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{question.category}</Badge>
                                <Badge variant={
                                  question.difficulty === 'easy' ? 'default' :
                                  question.difficulty === 'medium' ? 'secondary' : 'destructive'
                                }>
                                  {question.difficulty === 'easy' ? 'Fácil' :
                                   question.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                                </Badge>
                              </div>
                              
                              <h3 className="font-semibold mb-2">{question.question}</h3>
                              
                              <div className="space-y-1">
                                {question.options.map((option, index) => (
                                  <div key={option.id} className={`text-sm p-2 rounded ${
                                    option.isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50'
                                  }`}>
                                    {String.fromCharCode(65 + index)}) {option.text}
                                    {option.isCorrect && <span className="ml-2 font-semibold">✓</span>}
                                  </div>
                                ))}
                              </div>
                              
                              {question.explanation && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  <strong>Explicação:</strong> {question.explanation}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingQuestion(question);
                                  setNewQuestion({
                                    question: question.question,
                                    category: question.category,
                                    difficulty: question.difficulty,
                                    options: question.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect })),
                                    explanation: question.explanation || ""
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}
