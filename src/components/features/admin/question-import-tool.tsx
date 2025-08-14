import { useState, useRef } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select";
import { Progress } from "@/components/shared/ui/progress";
import { Alert, AlertDescription } from "@/components/shared/ui/alert";
import { Badge } from "@/components/shared/ui/badge";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLearningModules } from "@/hooks/use-learning-modules";

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

interface QuestionRow {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
  feedback_a?: string;
  feedback_b?: string;
  feedback_c?: string;
  feedback_d?: string;
  learning_objectives?: string;
  estimated_time?: number;
  question_type?: string;
  cognitive_level?: string;
  concepts?: string; // comma-separated concept names
}

export function QuestionImportTool() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<QuestionRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { modules } = useLearningModules();

  const downloadTemplate = () => {
    const template = `question,option_a,option_b,option_c,option_d,correct_answer,explanation,category,difficulty
"O que é taxa Selic?","Taxa de câmbio do real","Taxa básica de juros da economia","Taxa de inflação anual","Taxa de desemprego","Taxa básica de juros da economia","A Selic é a taxa básica de juros que influencia toda a economia brasileira.","ABC das Finanças","easy"
"Qual a principal característica do Bitcoin?","É controlado pelo governo","É uma moeda descentralizada","Não tem valor de mercado","Só funciona no Brasil","É uma moeda descentralizada","Bitcoin é uma criptomoeda descentralizada, sem controle governamental.","Cripto","medium"
"Como funciona o cartão de crédito?","Desconta direto da conta","Empresta dinheiro para pagamento posterior","É igual ao cartão de débito","Só funciona com dinheiro","Empresta dinheiro para pagamento posterior","O cartão de crédito é um empréstimo que você paga depois na fatura.","Finanças do Dia a Dia","easy"`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_questoes.csv';
    link.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const data: QuestionRow[] = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) { // Preview first 5 rows
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        if (values.length >= headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row as QuestionRow);
        }
      }
      
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Erro na prévia",
        description: "Não foi possível ler o arquivo CSV",
        variant: "destructive",
      });
    }
  };

  const validateRow = (row: QuestionRow, rowIndex: number): string[] => {
    const errors: string[] = [];
    
    if (!row.question?.trim()) {
      errors.push(`Linha ${rowIndex}: Pergunta é obrigatória`);
    }
    
    if (!row.option_a?.trim() || !row.option_b?.trim()) {
      errors.push(`Linha ${rowIndex}: Pelo menos 2 opções são obrigatórias`);
    }
    
    if (!row.correct_answer?.trim()) {
      errors.push(`Linha ${rowIndex}: Resposta correta é obrigatória`);
    } else {
      const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
      if (!options.includes(row.correct_answer)) {
        errors.push(`Linha ${rowIndex}: Resposta correta deve corresponder a uma das opções`);
      }
    }
    
    if (!['easy', 'medium', 'hard'].includes(row.difficulty)) {
      errors.push(`Linha ${rowIndex}: Dificuldade deve ser 'easy', 'medium' ou 'hard'`);
    }
    
    return errors;
  };

  const importQuestions = async () => {
    if (!file) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione um arquivo CSV",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");

      // Create import record
      const { data: importRecord } = await supabase
        .from('question_imports')
        .insert({
          uploaded_by: profile.id,
          file_name: file.name,
          learning_module_id: selectedModule || null,
          status: 'processing'
        })
        .select()
        .single();

      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const totalRows = lines.length - 1;
      let importedCount = 0;
      const allErrors: Array<{row: number, field: string, message: string}> = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length < headers.length) continue;

          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });

          const rowErrors = validateRow(row as QuestionRow, i);
          if (rowErrors.length > 0) {
            rowErrors.forEach(error => {
              allErrors.push({
                row: i,
                field: 'validation',
                message: error
              });
            });
            continue;
          }

          // Prepare question data
          const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
          const feedbackMap: Record<string, string> = {};
          
          if (row.feedback_a) feedbackMap[row.option_a] = row.feedback_a;
          if (row.feedback_b) feedbackMap[row.option_b] = row.feedback_b;
          if (row.feedback_c) feedbackMap[row.option_c] = row.feedback_c;
          if (row.feedback_d) feedbackMap[row.option_d] = row.feedback_d;

          const learningObjectives = row.learning_objectives 
            ? row.learning_objectives.split(';').map(obj => obj.trim())
            : [];

          // Insert question
          const { data: questionData, error: questionError } = await supabase
            .from('quiz_questions')
            .insert({
              question: row.question,
              options: JSON.stringify(options),
              correct_answer: row.correct_answer,
              explanation: row.explanation || '',
              difficulty: row.difficulty,
              category: row.category || 'Geral',
              learning_module_id: selectedModule || null,
              feedback_wrong_answers: feedbackMap,
              difficulty_level: row.difficulty === 'easy' ? 1 : row.difficulty === 'medium' ? 5 : 10,
              learning_objectives: learningObjectives,
              estimated_time_seconds: parseInt(row.estimated_time) || 30,
              question_type: row.question_type || 'multiple_choice',
              cognitive_level: row.cognitive_level || 'knowledge'
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Associate with concepts if provided
          if (row.concepts && questionData) {
            const conceptNames = row.concepts.split(',').map(name => name.trim());
            
            for (const conceptName of conceptNames) {
              const { data: concept } = await supabase
                .from('educational_concepts')
                .select('id')
                .eq('name', conceptName)
                .single();

              if (concept) {
                await supabase
                  .from('question_concepts')
                  .insert({
                    question_id: questionData.id,
                    concept_id: concept.id,
                    relevance_weight: 1.0
                  });
              }
            }
          }

          importedCount++;
          setProgress((i / totalRows) * 100);
          
        } catch (error: any) {
          allErrors.push({
            row: i,
            field: 'import',
            message: error.message || 'Erro desconhecido'
          });
        }
      }

      // Update import record
      await supabase
        .from('question_imports')
        .update({
          total_questions: totalRows,
          successful_imports: importedCount,
          failed_imports: totalRows - importedCount,
          status: allErrors.length === 0 ? 'completed' : 'completed',
          validation_errors: allErrors,
          processed_at: new Date().toISOString()
        })
        .eq('id', importRecord?.id);

      setResult({
        success: allErrors.length === 0,
        total: totalRows,
        imported: importedCount,
        errors: allErrors
      });

      toast({
        title: "Importação concluída!",
        description: `${importedCount} questões importadas com sucesso`,
      });

    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Template de Importação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Baixe o template CSV com o formato correto e exemplos de questões.
            </p>
            <Button onClick={downloadTemplate} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Baixar Template CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Questões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="module">Módulo de Aprendizado (Opcional)</Label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um módulo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {modules.map(module => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.icon} {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo CSV</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prévia dos Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Pergunta</th>
                    <th className="border border-border p-2 text-left">Categoria</th>
                    <th className="border border-border p-2 text-left">Dificuldade</th>
                    <th className="border border-border p-2 text-left">Opções</th>
                    <th className="border border-border p-2 text-left">Resposta</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="border border-border p-2 max-w-xs truncate">
                        {row.question}
                      </td>
                      <td className="border border-border p-2">{row.category}</td>
                      <td className="border border-border p-2">
                        <Badge variant={
                          row.difficulty === 'easy' ? 'default' :
                          row.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {row.difficulty}
                        </Badge>
                      </td>
                      <td className="border border-border p-2 text-xs">
                        A) {row.option_a}<br/>
                        B) {row.option_b}<br/>
                        {row.option_c && <>C) {row.option_c}<br/></>}
                        {row.option_d && <>D) {row.option_d}</>}
                      </td>
                      <td className="border border-border p-2">{row.correct_answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {importing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Importando questões...</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{result.imported}</div>
                <div className="text-sm text-muted-foreground">Importadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{result.errors.length}</div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Erros encontrados:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.slice(0, 10).map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription className="text-xs">
                        {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                      E mais {result.errors.length - 10} erros...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      <div className="flex justify-end">
        <Button 
          onClick={importQuestions} 
          disabled={!file || importing}
          size="lg"
        >
          {importing ? "Importando..." : "Importar Questões"}
        </Button>
      </div>
    </div>
  );
}
