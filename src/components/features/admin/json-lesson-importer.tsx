import React, { useState } from 'react';
import { Upload, Download, FileJson, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/shared/ui/progress';

interface ParsedLesson {
  title: string;
  content: string;
  category: string;
  quiz_question: string;
  quiz_options: string[];
  correct_answer: number;
  lesson_date: string;
  is_main_lesson: boolean;
  xp_reward: number;
  btz_reward: number;
}

interface ImportResult {
  successful: number;
  failed: number;
  errors: string[];
}

export function JSONLessonImporter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      {
        title: "Introdução aos Investimentos",
        content: "Os investimentos são uma forma de fazer seu dinheiro trabalhar para você. Nesta lição, você aprenderá os conceitos básicos sobre como começar a investir de forma segura e inteligente.",
        category: "dicas",
        quiz_question: "Qual é o principal objetivo dos investimentos?",
        quiz_options: [
          "Gastar dinheiro rapidamente",
          "Fazer o dinheiro crescer ao longo do tempo",
          "Guardar dinheiro embaixo do colchão",
          "Comprar produtos caros"
        ],
        correct_answer: 1,
        lesson_date: "2025-08-17",
        is_main_lesson: true,
        xp_reward: 100,
        btz_reward: 150
      },
      {
        title: "Diversificação de Carteira",
        content: "A diversificação é uma estratégia que consiste em distribuir seus investimentos entre diferentes tipos de ativos para reduzir riscos e maximizar retornos.",
        category: "curiosidades",
        quiz_question: "Por que a diversificação é importante?",
        quiz_options: [
          "Para aumentar os riscos",
          "Para reduzir os riscos da carteira",
          "Para investir apenas em um ativo",
          "Para gastar mais dinheiro"
        ],
        correct_answer: 1,
        lesson_date: "2025-08-17",
        is_main_lesson: false,
        xp_reward: 75,
        btz_reward: 100
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-licoes-diarias.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template baixado!",
      description: "Arquivo template-licoes-diarias.json foi baixado com sucesso.",
    });
  };

  const parseJSON = (jsonString: string): ParsedLesson[] => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data)) {
        throw new Error('O arquivo JSON deve conter um array de lições.');
      }

      return data.map((lesson, index) => {
        if (!lesson.title || !lesson.content || !lesson.quiz_question) {
          throw new Error(`Lição ${index + 1}: Campos obrigatórios faltando (title, content, quiz_question).`);
        }

        if (!Array.isArray(lesson.quiz_options) || lesson.quiz_options.length !== 4) {
          throw new Error(`Lição ${index + 1}: quiz_options deve ser um array com exatamente 4 opções.`);
        }

        if (typeof lesson.correct_answer !== 'number' || lesson.correct_answer < 0 || lesson.correct_answer > 3) {
          throw new Error(`Lição ${index + 1}: correct_answer deve ser um número entre 0 e 3.`);
        }

        if (!lesson.lesson_date || !lesson.lesson_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          throw new Error(`Lição ${index + 1}: lesson_date deve estar no formato YYYY-MM-DD.`);
        }

        return {
          title: lesson.title,
          content: lesson.content,
          category: lesson.category || 'dicas',
          quiz_question: lesson.quiz_question,
          quiz_options: lesson.quiz_options,
          correct_answer: lesson.correct_answer,
          lesson_date: lesson.lesson_date,
          is_main_lesson: lesson.is_main_lesson || false,
          xp_reward: lesson.xp_reward || 50,
          btz_reward: lesson.btz_reward || 100
        };
      });
    } catch (error) {
      throw new Error(`Erro ao parsear JSON: ${error.message}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast({
          title: "Erro no arquivo",
          description: "Por favor, selecione um arquivo JSON válido.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo JSON antes de importar.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      const fileContent = await selectedFile.text();
      const lessons = parseJSON(fileContent);

      toast({
        title: "Arquivo validado!",
        description: `${lessons.length} lições encontradas. Iniciando importação...`,
      });

      setProgress(25);

      // Dividir em lotes de 10 lições para melhor performance
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < lessons.length; i += batchSize) {
        batches.push(lessons.slice(i, i + batchSize));
      }

      let totalSuccessful = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        const { data, error } = await supabase.functions.invoke('batch-import-lessons', {
          body: { lessons: batch }
        });

        if (error) {
          console.error(`Erro no lote ${i + 1}:`, error);
          allErrors.push(`Lote ${i + 1}: ${error.message}`);
          totalFailed += batch.length;
        } else if (data?.results) {
          totalSuccessful += data.results.successful;
          totalFailed += data.results.failed;
          allErrors.push(...data.results.errors);
        }

        // Atualizar progresso
        const progressPercentage = 25 + ((i + 1) / batches.length) * 75;
        setProgress(progressPercentage);
      }

      const finalResult: ImportResult = {
        successful: totalSuccessful,
        failed: totalFailed,
        errors: allErrors
      };

      setImportResult(finalResult);

      if (finalResult.successful > 0) {
        toast({
          title: "Importação concluída!",
          description: `${finalResult.successful} lições importadas com sucesso.`,
        });
      } else {
        toast({
          title: "Falha na importação",
          description: "Nenhuma lição foi importada. Verifique os erros abaixo.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erro durante importação:', error);
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Importador JSON de Lições Diárias
        </CardTitle>
        <CardDescription>
          Importe múltiplas lições diárias através de um arquivo JSON. Use o template para o formato correto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de Download do Template */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Download className="h-4 w-4" />
            1. Baixar Template
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Baixe o arquivo template para ver o formato correto das lições.
          </p>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Baixar Template JSON
          </Button>
        </div>

        {/* Seção de Upload */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            2. Selecionar Arquivo JSON
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Selecione o arquivo JSON com as lições que deseja importar.
          </p>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Progresso da Importação */}
        {importing && (
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Importando Lições...
            </h3>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Processando lições... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Botão de Importação */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">3. Importar Lições</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Clique para iniciar a importação das lições para o banco de dados.
          </p>
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar Lições
              </>
            )}
          </Button>
        </div>

        {/* Resultado da Importação */}
        {importResult && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {importResult.successful > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              Resultado da Importação
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                <div className="text-sm text-green-700 dark:text-green-400">Importadas com Sucesso</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                <div className="text-sm text-red-700 dark:text-red-400">Falharam</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Erros Encontrados:</h4>
                <div className="max-h-32 overflow-y-auto bg-red-50 dark:bg-red-950/30 rounded p-3">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-400 mb-1">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instruções */}
        <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/30">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Instruções Importantes
          </h3>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <li>• O arquivo deve ser um JSON válido contendo um array de lições</li>
            <li>• Cada lição deve ter: title, content, quiz_question, quiz_options (4 opções), correct_answer (0-3)</li>
            <li>• lesson_date deve estar no formato YYYY-MM-DD</li>
            <li>• Categorias válidas: curiosidades, dicas, historias, glossario</li>
            <li>• Apenas uma lição principal (is_main_lesson: true) por data é permitida</li>
            <li>• Lições duplicadas (mesmo título e data) serão rejeitadas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}