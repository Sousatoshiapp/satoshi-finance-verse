import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Progress } from '@/components/shared/ui/progress';
import { Download, Upload, FileJson, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ParsedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

export function JSONQuestionImporter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        question: "O que é dinheiro?",
        options: ["Um jogo online", "Apenas papel", "Um aplicativo", "Um meio de troca"],
        correct_answer: "Um meio de troca",
        explanation: "Dinheiro é usado para trocar por bens e serviços.",
        category: "ABC das Finanças",
        difficulty: "easy"
      },
      {
        question: "Para que serve um banco?",
        options: ["Só para guardar moedas", "Para comprar doces", "Para guardar e emprestar dinheiro", "Para jogar videogame"],
        correct_answer: "Para guardar e emprestar dinheiro",
        explanation: "Bancos são instituições que guardam nosso dinheiro com segurança e fazem empréstimos.",
        category: "ABC das Finanças",
        difficulty: "easy"
      },
      {
        question: "O que significa economizar dinheiro?",
        options: ["Gastar tudo rapidamente", "Guardar parte do dinheiro para o futuro", "Dar todo dinheiro para outros", "Esconder o dinheiro embaixo da cama"],
        correct_answer: "Guardar parte do dinheiro para o futuro",
        explanation: "Economizar significa não gastar todo o dinheiro que recebemos, guardando uma parte para necessidades futuras ou emergências.",
        category: "ABC das Finanças",
        difficulty: "easy"
      }
    ];

    const jsonString = JSON.stringify(templateData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-perguntas.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Template JSON baixado com sucesso!');
  };

  const parseJSON = (text: string): ParsedQuestion[] => {
    try {
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('O arquivo JSON deve conter um array de questões');
      }

      return data.map((item, index) => {
        if (!item.question || !Array.isArray(item.options) || !item.correct_answer || !item.category) {
          throw new Error(`Questão ${index + 1}: Campos obrigatórios faltando (question, options, correct_answer, category)`);
        }

        if (item.options.length < 2) {
          throw new Error(`Questão ${index + 1}: Mínimo de 2 opções necessárias`);
        }

        if (!item.options.includes(item.correct_answer)) {
          throw new Error(`Questão ${index + 1}: A resposta correta deve estar na lista de opções`);
        }

        return {
          question: item.question.trim(),
          options: item.options.map((opt: string) => opt.trim()),
          correct_answer: item.correct_answer.trim(),
          explanation: item.explanation?.trim() || '',
          category: item.category.trim(),
          difficulty: item.difficulty?.trim() || 'medium'
        };
      });
    } catch (error) {
      throw new Error(`Erro ao processar JSON: ${error instanceof Error ? error.message : 'Formato inválido'}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.json')) {
        toast.error('Por favor, selecione um arquivo JSON (.json)');
        return;
      }
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo JSON');
      return;
    }

    setImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const fileContent = await selectedFile.text();
      setImportProgress(25);

      const questions = parseJSON(fileContent);
      setImportProgress(50);

      toast.info(`Processando ${questions.length} questões...`);

      // Process in batches of 10
      const batchSize = 10;
      let totalSuccess = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        
        const { data, error } = await supabase.functions.invoke('batch-import-questions', {
          body: { questions: batch }
        });

        if (error) {
          throw error;
        }

        if (data) {
          totalSuccess += data.success || 0;
          if (data.errors) {
            allErrors.push(...data.errors);
          }
        }

        const progress = 50 + ((i + batchSize) / questions.length) * 50;
        setImportProgress(Math.min(progress, 100));
      }

      const results: ImportResult = {
        success: totalSuccess,
        errors: allErrors,
        total: questions.length
      };

      setImportResults(results);

      if (results.success > 0) {
        toast.success(`${results.success} questões importadas com sucesso!`);
      }

      if (results.errors.length > 0) {
        toast.error(`${results.errors.length} questões falharam na importação`);
      }

    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error(`Erro na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          Importador de Perguntas JSON
        </CardTitle>
        <CardDescription>
          Importe perguntas em lote usando arquivo JSON. Formato mais confiável e fácil de usar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="space-y-3">
          <h3 className="font-medium">1. Baixar Template</h3>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Template JSON
          </Button>
          <p className="text-sm text-muted-foreground">
            Baixe o template com exemplos de questões já formatadas corretamente.
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <h3 className="font-medium">2. Selecionar Arquivo</h3>
          <Input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            disabled={importing}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Arquivo selecionado: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Importando...</span>
              <span className="text-sm text-muted-foreground">{importProgress}%</span>
            </div>
            <Progress value={importProgress} className="w-full" />
          </div>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={!selectedFile || importing}
          className="w-full flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {importing ? 'Importando...' : 'Importar Questões'}
        </Button>

        {/* Results */}
        {importResults && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium">Resultado da Importação</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{importResults.success}</span>
                <span className="text-xs text-muted-foreground">Sucesso</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">{importResults.errors.length}</span>
                <span className="text-xs text-muted-foreground">Erros</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">{importResults.total}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Erros Encontrados:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importResults.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground">Instruções:</h4>
          <ul className="space-y-1 ml-4">
            <li>• Baixe o template JSON com exemplos das suas questões</li>
            <li>• Edite o arquivo adicionando suas questões no mesmo formato</li>
            <li>• O campo "options" deve ser um array com as opções de resposta</li>
            <li>• Categorias permitidas: "ABC das Finanças", "Cripto", "Finanças do Dia a Dia"</li>
            <li>• A resposta correta deve estar exatamente na lista de opções</li>
            <li>• Dificuldades: "easy", "medium", "hard"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}