import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileSpreadsheet, Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { optimizedCSVGeneration, generateQuestionCSV } from "@/utils/csv-optimizer";

interface QuizQuestion {
  id: string;
  question: string;
  options: any; // JSON field that can be string[] or object
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
  difficulty_level?: number;
  district_id?: string;
  learning_module_id?: string;
  tags?: string[];
  learning_objectives?: string[];
  estimated_time_seconds?: number;
  question_type?: string;
  cognitive_level?: string;
  concepts?: string[];
  source_material?: string;
  author_notes?: string;
  is_approved?: boolean;
  usage_count?: number;
  success_rate?: number;
  avg_response_time?: number;
  approved_by?: string;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

const CATEGORIES = [
  'financas', 'crypto', 'investimentos', 'economia', 
  'mercado', 'educacao', 'tecnologia', 'geral'
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COGNITIVE_LEVELS = ['knowledge', 'comprehension', 'application', 'analysis', 'synthesis', 'evaluation'];

export function UnifiedQuestionManager() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const { toast } = useToast();

  // Novo questionário em branco
  const emptyQuestion: Partial<QuizQuestion> = {
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    category: "geral",
    difficulty: "easy",
    difficulty_level: 1,
    tags: [],
    concepts: [],
    estimated_time_seconds: 30,
    question_type: "multiple_choice",
    cognitive_level: "knowledge"
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to ensure proper types
      const transformedData = (data || []).map(item => ({
        ...item,
        options: Array.isArray(item.options) ? item.options : 
                 typeof item.options === 'object' ? Object.values(item.options) : 
                 typeof item.options === 'string' ? JSON.parse(item.options || '[]') : []
      }));
      
      setQuestions(transformedData);
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

  const downloadTemplate = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_question_template');
      
      if (error) throw error;
      
      const csvContent = optimizedCSVGeneration(data);
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_perguntas_quiz.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Template baixado!",
        description: "Use este arquivo como modelo para criar novas perguntas"
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Erro",
        description: "Falha ao baixar template",
        variant: "destructive"
      });
    }
  };

  const exportQuestions = () => {
    const csvContent = generateQuestionCSV(questions);
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perguntas_quiz_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Perguntas exportadas!",
      description: `${questions.length} perguntas exportadas para CSV`
    });
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;
    
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({
        title: "Pergunta excluída",
        description: "A pergunta foi removida com sucesso"
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

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (q.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciador de Perguntas</h1>
          <p className="text-muted-foreground">Sistema unificado para criar e gerenciar perguntas de quiz</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button onClick={exportQuestions} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowNewQuestion(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Pergunta
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Perguntas</TabsTrigger>
          <TabsTrigger value="import">Importar Planilha</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar perguntas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Dificuldade</Label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {DIFFICULTIES.map(diff => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Badge variant="secondary">
                    {filteredQuestions.length} de {questions.length} perguntas
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Perguntas */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">Carregando perguntas...</div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma pergunta encontrada
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 line-clamp-2">{question.question}</h3>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline">{question.category}</Badge>
                          <Badge variant="outline">{question.difficulty}</Badge>
                          {question.is_approved && <Badge className="bg-green-100 text-green-800">Aprovada</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Usada {question.usage_count || 0} vezes • 
                          Taxa de acerto: {question.success_rate || 0}% •
                          Tempo médio: {question.avg_response_time || 30}s
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {question.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Importar Perguntas via Planilha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">Arraste seu arquivo CSV aqui</p>
                <p className="text-sm text-gray-500 mb-4">ou clique para selecionar</p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Selecionar Arquivo
                  </Button>
                </label>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">⚠️ Formato da Planilha</h4>
                <p className="text-sm">
                  Baixe o template para ver o formato correto. As colunas obrigatórias são:
                  question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Total de Perguntas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {questions.filter(q => q.is_approved).length}
                </div>
                <div className="text-sm text-muted-foreground">Perguntas Aprovadas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {CATEGORIES.length}
                </div>
                <div className="text-sm text-muted-foreground">Categorias Ativas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {questions.reduce((sum, q) => sum + (q.usage_count || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total de Usos</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
