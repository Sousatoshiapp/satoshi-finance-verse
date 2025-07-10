import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLivesSystem } from "@/hooks/use-lives-system";

interface LifePurchaseBannerProps {
  isVisible: boolean;
  onClose: () => void;
  onPurchase?: () => void;
  onViewStore?: () => void;
}

export function LifePurchaseBanner({ isVisible, onClose, onPurchase, onViewStore }: LifePurchaseBannerProps) {
  const { lifePackages, purchaseLifePackage, loading } = useLivesSystem();
  const [selectedPackage, setSelectedPackage] = useState(lifePackages[0]?.id);

  const promoPackage = lifePackages.find(p => p.discount_percentage > 0) || lifePackages[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <Card className="w-full max-w-md bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30">
            <CardHeader className="relative text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute right-2 top-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center mb-2"
              >
                <Heart className="h-12 w-12 text-red-500" />
              </motion.div>
              
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                💔 Streak Perdido!
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Suas vidas acabaram! Compre um pacote promocional para continuar sua jornada.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Promoção Relâmpago */}
              {promoPackage && (
                <motion.div
                  animate={{ boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 10px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive" className="animate-pulse">
                      ⚡ Promoção Relâmpago
                    </Badge>
                    <Badge variant="outline" className="text-green-400">
                      -{promoPackage.discount_percentage}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{promoPackage.name}</h3>
                    <p className="text-2xl font-black text-primary">
                      +{promoPackage.lives_count} ❤️
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-muted-foreground line-through">
                        R$ {(promoPackage.price_cents / 100).toFixed(2)}
                      </span>
                      <span className="text-xl font-bold text-green-400">
                        R$ {((promoPackage.price_cents * (100 - promoPackage.discount_percentage)) / 10000).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => purchaseLifePackage(promoPackage.id)}
                    disabled={loading}
                    className="w-full mt-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {loading ? "Processando..." : "Comprar Agora"}
                  </Button>
                </motion.div>
              )}
              
              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline" 
                  onClick={onViewStore}
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Ver Loja
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Continuar Sem Vidas
                </Button>
              </div>
              
              <div className="text-center text-xs text-muted-foreground">
                💡 Dica: Vidas se regeneram automaticamente a cada 8 horas
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}