import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BannerVIPMentorship() {
  const navigate = useNavigate();

  return (
    <Card className="border-violet-500/20 bg-gradient-to-r from-background to-violet-500/5 h-16">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-violet-500" />
          <h3 className="font-semibold text-sm">Programa VIP de Mentoria</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/vip-mentorship')}
          className="text-violet-500 border-violet-500/30 hover:bg-violet-500/10"
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}