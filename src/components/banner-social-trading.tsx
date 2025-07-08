import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BannerSocialTrading() {
  const navigate = useNavigate();

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-r from-background to-cyan-500/5 h-16">
      <CardContent className="p-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-cyan-500" />
          <h3 className="font-semibold text-sm">Rede Social de Trading</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/social-trading')}
          className="text-cyan-500 border-cyan-500/30 hover:bg-cyan-500/10"
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}