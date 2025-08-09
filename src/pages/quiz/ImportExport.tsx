import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Upload, Download, FileText, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Exportação concluída",
        description: "Seus dados de quiz foram exportados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // Simular importação
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Importação concluída",
        description: "Dados importados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Importar e Exportar</h1>
          <p className="text-muted-foreground">
            Gerencie seus dados de quiz, perguntas e progresso
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Baixe seus dados de quiz, progresso e estatísticas em formato JSON.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Perguntas e respostas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  <span>Histórico e estatísticas</span>
                </div>
              </div>

              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? "Exportando..." : "Exportar Dados"}
              </Button>
            </CardContent>
          </Card>

          {/* Import Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importar Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Importe dados de quiz de um arquivo JSON previamente exportado.
              </p>
              
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Formatos suportados: JSON
                </div>
                <div className="text-sm text-amber-600">
                  ⚠️ A importação substituirá dados existentes
                </div>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button 
                  disabled={isImporting}
                  className="w-full"
                  variant="outline"
                >
                  {isImporting ? "Importando..." : "Selecionar Arquivo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p>• Os dados são exportados em formato JSON padrão</p>
              <p>• Mantenha backups regulares do seu progresso</p>
              <p>• A importação pode demorar alguns minutos para arquivos grandes</p>
              <p>• Certifique-se de que o arquivo importado seja compatível com esta versão</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}