import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BannerAIAssistant() {
  const navigate = useNavigate();

  return (
    <Card className="border-blue-500/20 bg-gradient-to-r from-background to-blue-500/5 h-16">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-blue-500" />
          <h3 className="font-semibold text-sm">Assistente de IA</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/ai-assistant')}
          className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}