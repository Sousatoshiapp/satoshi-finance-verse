import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { ArrowLeft, Crown, Star } from "lucide-react";

// Mock data - replace with actual API call when accessories table exists
const mockAccessory = {
  id: "1",
  name: "Coroa Dourada",
  description: "Uma coroa majestosa que brilha com poder",
  image_url: "/placeholder-accessory.jpg",
  rarity: "Legendary",
  category: "Head",
  stats: {
    "prestige": "+25",
    "xp_bonus": "+15%",
    "beetz_bonus": "+10%"
  },
  price: 500,
  unlock_requirement: "100 quizzes completos"
};

export default function AccessoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Accessory Preview */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  <div className="text-8xl">👑</div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">{mockAccessory.name}</h1>
                  <div className="flex gap-2">
                    <Badge className={getRarityColor(mockAccessory.rarity)}>
                      {mockAccessory.rarity}
                    </Badge>
                    <Badge variant="outline">
                      {mockAccessory.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{mockAccessory.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Accessory Details */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Acessório Exclusivo
                </CardTitle>
                <CardDescription>
                  Demonstre seu status com este acessório único
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🚧</div>
                  <p className="text-lg font-semibold mb-2">Em Desenvolvimento</p>
                  <p className="text-muted-foreground text-sm">
                    O sistema de acessórios está sendo desenvolvido e estará disponível em breve!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Bônus e Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(mockAccessory.stats).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-semibold text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Preço:</span>
                    <span className="font-bold">{mockAccessory.price} BTZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requisito:</span>
                    <span className="font-semibold">{mockAccessory.unlock_requirement}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button disabled className="w-full">
                  🚧 Em Desenvolvimento
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/store')}
                  className="w-full"
                >
                  Voltar à Loja
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
