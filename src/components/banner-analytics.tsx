import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BannerAnalytics() {
  const navigate = useNavigate();

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-r from-background to-indigo-500/5 h-16">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-indigo-500" />
          <h3 className="font-semibold text-sm">Analytics Avançado</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/analytics')}
          className="text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/10"
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}