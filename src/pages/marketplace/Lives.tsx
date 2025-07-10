import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, ShoppingCart, Clock, Zap } from "lucide-react";
import { useLivesSystem } from "@/hooks/use-lives-system";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LivesMarketplace() {
  const navigate = useNavigate();
  const { lifePackages, userLives, getTimeToNextLife } = useLivesSystem();
  const [processingPackage, setProcessingPackage] = useState<string | null>(null);

  const timeToNext = getTimeToNextLife();

  const handlePurchase = async (packageId: string) => {
    setProcessingPackage(packageId);
    try {
      const { data, error } = await supabase.functions.invoke('create-life-checkout', {
        body: { packageId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setProcessingPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground self-start sm:self-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-lg sm:text-xl font-bold">Loja de Vidas</h1>
            <div className="flex items-center gap-2 self-end sm:self-center">
              {userLives && (
                <>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Heart 
                        key={index}
                        className={`h-4 w-4 ${
                          index < userLives.lives_count 
                            ? "text-red-500 fill-red-500" 
                            : "text-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  {timeToNext && !timeToNext.ready && userLives.lives_count < 3 && (
                    <div className="text-xs text-muted-foreground ml-2">
                      {timeToNext.hours > 0 && `${timeToNext.hours}h `}
                      {timeToNext.minutes}m
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Informações sobre vidas */}
        <Card className="mb-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="flex justify-center">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Sistema de Vidas</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                As vidas permitem continuar sua sequência (streak) mesmo quando errar uma pergunta. 
                Você pode ter até 3 vidas, que se regeneram automaticamente a cada 8 horas.
              </p>
              
              {timeToNext && !timeToNext.ready && userLives && userLives.lives_count < 3 && (
                <div className="flex items-center justify-center gap-2 text-sm bg-muted rounded-lg p-3 mx-auto max-w-xs">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">
                    Próxima vida em: {timeToNext.hours > 0 && `${timeToNext.hours}h `}
                    {timeToNext.minutes}m
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pacotes de vidas */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {lifePackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative ${
                pkg.discount_percentage > 0 
                  ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-orange-500/5" 
                  : ""
              }`}>
                {pkg.discount_percentage > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-yellow-500 text-black"
                  >
                    -{pkg.discount_percentage}%
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pkg.lives_count }).map((_, i) => (
                        <Heart key={i} className="h-6 w-6 text-red-500 fill-red-500" />
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-2xl font-bold text-primary">
                    +{pkg.lives_count} ❤️
                  </div>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <div>
                    {pkg.discount_percentage > 0 ? (
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground line-through">
                          R$ {(pkg.price_cents / 100).toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold text-green-500">
                          R$ {((pkg.price_cents * (100 - pkg.discount_percentage)) / 10000).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">
                        R$ {(pkg.price_cents / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={processingPackage === pkg.id}
                    className="w-full"
                    variant={pkg.discount_percentage > 0 ? "default" : "outline"}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {processingPackage === pkg.id ? "Processando..." : "Comprar"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Dicas */}
        <Card className="mt-6 bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="w-full">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">💡 Dicas importantes:</h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• Vidas só podem ser usadas quando você já tem uma sequência (streak)</li>
                  <li>• Use vidas estrategicamente para manter multiplicadores altos</li>
                  <li>• Vidas se regeneram automaticamente - não precisa comprar sempre</li>
                  <li>• Pacotes promocionais oferecem o melhor custo-benefício</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}