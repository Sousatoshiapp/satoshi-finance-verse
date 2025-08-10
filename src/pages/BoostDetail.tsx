import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { ArrowLeft, Zap, Clock, Coins, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Boost {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  category: string;
  rarity: string;
  effects: any;
  duration_minutes?: number;
  cooldown_minutes?: number;
  max_uses_per_day?: number;
  is_active: boolean;
}

export default function BoostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [boost, setBoost] = useState<Boost | null>(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [usesLeft, setUsesLeft] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBoostDetails();
      if (user) {
        checkOwnership();
      }
    }
  }, [id, user]);

  const fetchBoostDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('advanced_powerups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBoost(data);
    } catch (error) {
      console.error('Error fetching boost:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do boost.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    // For now, user doesn't own any power-ups since table doesn't exist yet
    setOwned(false);
    setUsesLeft(0);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'learning': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'bonus': return <Coins className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!boost) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Boost não encontrado</h1>
          <Button onClick={() => navigate('/powerups')}>
            Voltar aos Power-ups
          </Button>
        </div>
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
            onClick={() => navigate('/store')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Boost Image */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  {boost.image_url ? (
                    <img
                      src={boost.image_url}
                      alt={boost.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">
                      {getCategoryIcon(boost.category)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">{boost.name}</h1>
                  <div className="flex gap-2">
                    <Badge className={getRarityColor(boost.rarity)}>
                      {boost.rarity}
                    </Badge>
                    <Badge variant="outline">
                      {boost.category}
                    </Badge>
                  </div>
                </div>
                
                {boost.description && (
                  <p className="text-muted-foreground mb-4">{boost.description}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Boost Details */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {owned ? 'Power-up Ativo' : 'Power-up Disponível'}
                </CardTitle>
                {owned && (
                  <CardDescription>
                    Você possui este power-up
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {owned ? (
                  <div className="space-y-3">
                    <div className="text-center py-2">
                      <div className="text-3xl mb-2">⚡</div>
                      <p className="text-lg font-semibold text-primary">Power-up Ativo</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Usos restantes:</span>
                      <span className="font-bold">{usesLeft}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Este power-up estará disponível em breve na loja
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Propriedades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {boost.duration_minutes && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Duração:
                      </span>
                      <span className="font-semibold">{boost.duration_minutes} min</span>
                    </div>
                  )}
                  
                  {boost.cooldown_minutes && boost.cooldown_minutes > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Cooldown:
                      </span>
                      <span className="font-semibold">{boost.cooldown_minutes} min</span>
                    </div>
                  )}
                  
                  {boost.max_uses_per_day && (
                    <div className="flex items-center justify-between">
                      <span>Usos por dia:</span>
                      <span className="font-semibold">{boost.max_uses_per_day}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Effects */}
            {boost.effects && Object.keys(boost.effects).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Efeitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(boost.effects).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-semibold text-primary">
                          {typeof value === 'number' && value > 1 ? `+${Math.round((value - 1) * 100)}%` : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={() => navigate('/powerups')}
                  variant="outline"
                  className="w-full"
                >
                  Ver Todos os Power-ups
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
