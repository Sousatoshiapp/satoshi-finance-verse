import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Textarea } from "@/components/shared/ui/textarea";
import { Badge } from "@/components/shared/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { 
  HelpCircle, Plus, Search, MoreHorizontal, 
  Trash2, Edit, Eye, FileUp, Download
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  correct_answer: string;
  options: any;
  explanation: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "",
    difficulty: "easy",
    correct_answer: "",
    options: ["", "", "", ""],
    explanation: "",
    tags: ""
  });
  const { toast } = useToast();
  const { t } = useI18n();

  const categories = [
    "Análise Técnica",
    "Fundamentos",
    "Criptomoedas", 
    "Investimentos",
    "Economia",
    "Mercado de Ações"
  ];

  const difficulties = ["easy", "medium", "hard"];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast({
        title: t('errors.error') + " ao carregar perguntas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', selectedQuestion.id);

      if (error) throw error;

      toast({
        title: "Pergunta deletada",
        description: "A pergunta foi removida do banco de dados.",
      });

      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
      loadQuestions();
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast({
        title: t('errors.error') + " ao deletar pergunta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddQuestion = async () => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .insert({
          question: newQuestion.question,
          category: newQuestion.category,
          difficulty: newQuestion.difficulty,
          correct_answer: newQuestion.correct_answer,
          options: newQuestion.options,
          explanation: newQuestion.explanation || null,
          tags: newQuestion.tags ? newQuestion.tags.split(',').map(t => t.trim()) : null
        });

      if (error) throw error;

      toast({
        title: "Pergunta adicionada",
        description: "Nova pergunta foi criada com sucesso.",
      });

      setAddDialogOpen(false);
      setNewQuestion({
        question: "",
        category: "",
        difficulty: "easy",
        correct_answer: "",
        options: ["", "", "", ""],
        explanation: "",
        tags: ""
      });
      loadQuestions();
    } catch (error: any) {
      console.error('Error adding question:', error);
      toast({
        title: t('errors.error') + " ao adicionar pergunta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || question.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return <Badge variant="destructive">Difícil</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Médio</Badge>;
      default:
        return <Badge className="bg-success text-success-foreground">Fácil</Badge>;
    }
  };

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                  Banco de Questões
                </h1>
                <p className="text-muted-foreground">
                  Gerenciar perguntas do quiz
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileUp className="h-4 w-4 mr-2" />
                  Importar CSV
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Pergunta
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{questions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fácil</p>
                    <p className="text-2xl font-bold text-success">
                      {questions.filter(q => q.difficulty === 'easy').length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Médio</p>
                    <p className="text-2xl font-bold text-warning">
                      {questions.filter(q => q.difficulty === 'medium').length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Difícil</p>
                    <p className="text-2xl font-bold text-destructive">
                      {questions.filter(q => q.difficulty === 'hard').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar perguntas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Dificuldade</TableHead>
                      <TableHead>Resposta Correta</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{question.question}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{question.category}</Badge>
                        </TableCell>
                        <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{question.correct_answer}</div>
                        </TableCell>
                        <TableCell>
                          {new Date(question.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedQuestion(question);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Nova Pergunta</DialogTitle>
            <DialogDescription>
              Adicionar nova pergunta ao banco de questões
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Pergunta</label>
              <Textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                placeholder="Digite a pergunta..."
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select 
                  value={newQuestion.category} 
                  onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Dificuldade</label>
                <Select 
                  value={newQuestion.difficulty} 
                  onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value})}
                >
                  <SelectTrigger className="mt-1">
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

            <div>
              <label className="text-sm font-medium">Opções de Resposta</label>
              {newQuestion.options.map((option, index) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = e.target.value;
                    setNewQuestion({...newQuestion, options: newOptions});
                  }}
                  placeholder={`Opção ${index + 1}`}
                  className="mt-1"
                />
              ))}
            </div>

            <div>
              <label className="text-sm font-medium">Resposta Correta</label>
              <Input
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                placeholder="Digite a resposta correta..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Explicação (opcional)</label>
              <Textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                placeholder="Explicação da resposta..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
              <Input
                value={newQuestion.tags}
                onChange={(e) => setNewQuestion({...newQuestion, tags: e.target.value})}
                placeholder="tag1, tag2, tag3"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddQuestion}>
              Adicionar Pergunta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar esta pergunta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminAuthProtection>
  );
}
