import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { ArrowLeft, Palette, Sparkles } from "lucide-react";

// Mock data - replace with actual API call when skins table exists
const mockSkin = {
  id: "1",
  name: "Skin Neon Cyberpunk",
  description: "Uma skin futurística com efeitos neon brilhantes",
  image_url: "/placeholder-skin.jpg",
  rarity: "Epic",
  category: "Interface",
  effects: {
    "neon_glow": "Efeito neon em botões",
    "particle_effects": "Partículas flutuantes",
    "color_theme": "Tema roxo e azul"
  },
  price: 150,
  unlock_requirement: "Nível 25"
};

export default function SkinDetail() {
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
          {/* Skin Preview */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  <div className="text-8xl">🎨</div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">{mockSkin.name}</h1>
                  <div className="flex gap-2">
                    <Badge className={getRarityColor(mockSkin.rarity)}>
                      {mockSkin.rarity}
                    </Badge>
                    <Badge variant="outline">
                      {mockSkin.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{mockSkin.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Skin Details */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personalização
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da sua interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🚧</div>
                  <p className="text-lg font-semibold mb-2">Em Desenvolvimento</p>
                  <p className="text-muted-foreground text-sm">
                    O sistema de skins está sendo desenvolvido e estará disponível em breve!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Recursos Visuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(mockSkin.effects).map(([key, value]) => (
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
                    <span className="font-bold">{mockSkin.price} BTZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Requisito:</span>
                    <span className="font-semibold">{mockSkin.unlock_requirement}</span>
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
