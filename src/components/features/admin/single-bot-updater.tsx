import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Edit, CheckCircle, AlertCircle } from "lucide-react";

export function SingleBotNicknameUpdater() {
  const [botId, setBotId] = useState("0c418dab-6ec0-43ff-827b-4938c0b61baf");
  const [newNickname, setNewNickname] = useState("CryptoSamurai");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const updateBot = async () => {
    if (!botId || !newNickname) {
      toast({
        title: "Dados incompletos",
        description: "Preencha o ID do bot e o novo nickname",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-single-bot', {
        body: { 
          botId: botId,
          newNickname: newNickname
        }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Bot atualizado!",
        description: `${data.old_nickname} → ${data.new_nickname}`,
      });

    } catch (error: any) {
      console.error('Error updating bot:', error);
      toast({
        title: "Erro ao atualizar bot",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Atualizar Bot Específico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">ID do Bot</label>
          <Input
            value={botId}
            onChange={(e) => setBotId(e.target.value)}
            placeholder="ID do bot"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Novo Nickname</label>
          <Input
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            placeholder="Novo nickname"
          />
        </div>

        <Button 
          onClick={updateBot} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Atualizando...
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Atualizar Bot
            </>
          )}
        </Button>

        {result && (
          <div className={`p-3 rounded-lg border ${
            result.success ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <span className={`font-medium ${result.success ? 'text-success' : 'text-destructive'}`}>
                {result.success ? 'Sucesso!' : 'Erro!'}
              </span>
            </div>
            <p className="text-sm">
              {result.success 
                ? `${result.old_nickname} → ${result.new_nickname}`
                : result.error
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
