import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Alert, AlertDescription } from "@/components/shared/ui/alert";
import { Loader2, Users, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function BotNicknameUpdater() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; count: number } | null>(null);
  const { toast } = useToast();

  const updateBotNicknames = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('update-bot-nicknames');

      if (error) {
        throw error;
      }

      setResult({
        message: data.message,
        count: data.updated_count
      });
      
      toast({
        title: "Sucesso",
        description: `${data.updated_count} bots atualizados com nomes reais`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error updating bot nicknames:', error);
      setResult({
        message: 'Erro ao atualizar nicknames dos bots',
        count: 0
      });
      toast({
        title: "Erro",
        description: "Falha ao atualizar nicknames dos bots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Atualizar Nicknames dos Bots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-4">
            Esta função substitui todos os nicknames que começam com "Bot_" por nomes brasileiros realistas.
          </p>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs">
              <strong>Atualmente:</strong> 896 bots ainda possuem nicknames com formato "Bot_"
            </p>
          </div>
        </div>

        <Button 
          onClick={updateBotNicknames} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Atualizando Nicknames...' : 'Atualizar Nicknames dos Bots'}
        </Button>

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {result.message}
              {result.count > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Total de bots atualizados: {result.count}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Nota:</strong> Esta operação substitui nicknames como "Bot_abc123" por 
          nomes como "Carlos Silva", "Ana Santos", etc. Apenas bots com prefixo "Bot_" 
          serão atualizados.
        </div>
      </CardContent>
    </Card>
  );
}
