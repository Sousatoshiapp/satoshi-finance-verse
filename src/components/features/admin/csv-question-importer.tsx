import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Progress } from '@/components/shared/ui/progress';
import { Alert, AlertDescription } from '@/components/shared/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

interface ParsedQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

export function CSVQuestionImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
      'question',
      'option_a',
      'option_b', 
      'option_c',
      'option_d',
      'correct_answer',
      'explanation',
      'category',
      'difficulty'
    ];

    const sampleData = [
      [
        'O que é taxa Selic?',
        'Taxa de câmbio do real',
        'Taxa básica de juros da economia',
        'Taxa de inflação anual',
        'Taxa de desemprego',
        'Taxa básica de juros da economia',
        'A Selic é a taxa básica de juros que influencia toda a economia brasileira.',
        'ABC das Finanças',
        'easy'
      ],
      [
        'Qual a principal característica do Bitcoin?',
        'É controlado pelo governo',
        'É uma moeda descentralizada',
        'Não tem valor de mercado',
        'Só funciona no Brasil',
        'É uma moeda descentralizada',
        'Bitcoin é uma criptomoeda descentralizada, sem controle governamental.',
        'Cripto',
        'medium'
      ],
      [
        'Como funciona o cartão de crédito?',
        'Desconta direto da conta',
        'Empresta dinheiro para pagamento posterior',
        'É igual ao cartão de débito',
        'Só funciona com dinheiro',
        'Empresta dinheiro para pagamento posterior',
        'O cartão de crédito é um empréstimo que você paga depois na fatura.',
        'Finanças do Dia a Dia',
        'easy'
      ]
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_questoes.csv';
    link.click();
  };

  const parseCSV = (text: string): ParsedQuestion[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const question: any = {};
      
      headers.forEach((header, index) => {
        question[header] = values[index] || '';
      });

      return {
        question: question.question,
        options: [
          question.option_a,
          question.option_b,
          question.option_c,
          question.option_d
        ].filter(Boolean),
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        category: question.category,
        difficulty: question.difficulty || 'medium'
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    
    try {
      const text = await file.text();
      const questions = parseCSV(text);
      const total = questions.length;
      let success = 0;
      const errors: string[] = [];

      // Processar em lotes de 100
      const batchSize = 100;
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        
        try {
          const { data, error } = await supabase.functions.invoke('batch-import-questions', {
            body: { questions: batch }
          });

          if (error) throw error;
          
          success += data.success || 0;
          if (data.errors) {
            errors.push(...data.errors);
          }
        } catch (error: any) {
          errors.push(`Lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
        }
        
        setProgress(Math.min(((i + batchSize) / total) * 100, 100));
        
        // Pausa pequena entre lotes para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults({ total, success, errors });
      
      toast({
        title: "Importação concluída",
        description: `${success}/${total} questões importadas com sucesso.`,
        variant: success === total ? "default" : "destructive",
      });
      
    } catch (error: any) {
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Questões via CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Template Download */}
        <div className="p-4 border border-dashed border-muted-foreground rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Baixar Template</h3>
              <p className="text-sm text-muted-foreground">
                Baixe o modelo CSV com a estrutura correta para importação
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="csv-file" className="block text-sm font-medium mb-2">
            Selecionar arquivo CSV
          </label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importing}
          />
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processando...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Import Button */}
        <Button 
          onClick={handleImport} 
          disabled={!file || importing}
          className="w-full"
        >
          {importing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Importando...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Importar Questões
            </>
          )}
        </Button>

        {/* Results */}
        {results && (
          <Alert className={results.errors.length === 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <div className="flex items-center gap-2">
              {results.errors.length === 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <div>
                <h4 className="font-medium">
                  Resultado da Importação
                </h4>
                <AlertDescription>
                  <div className="mt-2">
                    <p>Total: {results.total} questões</p>
                    <p>Sucesso: {results.success} questões</p>
                    {results.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Erros encontrados:</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {results.errors.slice(0, 10).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {results.errors.length > 10 && (
                            <li>... e mais {results.errors.length - 10} erros</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Instructions */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Instruções de uso:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Baixe o template CSV para ver a estrutura correta</li>
                <li>Preencha uma questão por linha</li>
                <li>As opções devem estar nas colunas option_a até option_d</li>
                <li>A resposta correta deve corresponder exatamente a uma das opções</li>
                <li>Use apenas as categorias: "ABC das Finanças", "Cripto", "Finanças do Dia a Dia"</li>
                <li>Suporte para até 50.000 questões por importação</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
