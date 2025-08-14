import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { FOMOTimer } from '@/components/shared/ui/fomo-timer';
import { useFOMOFeatures } from '@/hooks/use-fomo-features';
import { 
  Zap, 
  Crown, 
  Gift, 
  Target, 
  ShoppingCart, 
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export function FOMODashboard() {
  const { 
    fomoEvents, 
    dailyShop, 
    loading, 
    flashSaleActive,
    getTimeRemaining 
  } = useFOMOFeatures();

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const urgentEvents = fomoEvents.filter(event => {
    const timeLeft = getTimeRemaining(event.expires_at);
    return timeLeft && timeLeft.total < 2 * 60 * 60 * 1000; // Less than 2 hours
  });

  const flashSaleItems = dailyShop.filter(item => item.is_flash_sale);
  const regularShopItems = dailyShop.filter(item => !item.is_flash_sale);

  return (
    <div className="p-6 space-y-6">
      {/* Flash Sale Alert */}
      {flashSaleActive && flashSaleItems.length > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden"
        >
          <Card className="border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-6 h-6 text-red-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-red-600">
                    ⚡ FLASH SALE ATIVO!
                  </h2>
                </div>
                <FOMOTimer 
                  expiresAt={flashSaleItems[0].expires_at}
                  variant="flash"
                  size="lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashSaleItems.map((item) => (
                  <div key={item.id} className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <Badge variant="destructive">75% OFF</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          {item.price_btz} BTZ
                        </span>
                        {item.original_price && (
                          <span className="text-sm line-through text-muted-foreground">
                            {item.original_price} BTZ
                          </span>
                        )}
                      </div>
                      <Button size="sm" className="bg-red-500 hover:bg-red-600">
                        COMPRAR AGORA
                      </Button>
                    </div>
                    {item.remaining_stock && (
                      <div className="mt-2 text-xs text-orange-600 font-medium">
                        Apenas {item.remaining_stock} restantes!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Urgent Events */}
      {urgentEvents.length > 0 && (
        <Card className="border-orange-500">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold">🚨 DESAFIOS TERMINANDO!</h2>
            </div>
            
            <div className="space-y-3">
              {urgentEvents.map((event) => (
                <motion.div
                  key={event.id}
                  animate={{ 
                    borderColor: ['rgba(249, 115, 22, 0.5)', 'rgba(249, 115, 22, 1)', 'rgba(249, 115, 22, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="border-2 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">+{event.reward_btz} BTZ</Badge>
                        {event.difficulty && (
                          <Badge variant="outline">Nível {event.difficulty}/10</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <FOMOTimer 
                        expiresAt={event.expires_at}
                        variant="urgent"
                        showUrgentAt={120}
                      />
                      <Button size="sm" variant="outline">
                        PARTICIPAR
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Daily Shop */}
      {regularShopItems.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold">🛒 Loja Diária</h2>
              </div>
              <FOMOTimer 
                expiresAt={regularShopItems[0]?.expires_at}
                variant="default"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularShopItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant={
                      item.rarity === 'legendary' ? 'default' :
                      item.rarity === 'epic' ? 'secondary' :
                      item.rarity === 'rare' ? 'outline' : 'secondary'
                    }>
                      {item.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{item.price_btz} BTZ</span>
                    <Button size="sm" variant="outline">
                      Comprar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Active Challenges */}
      {fomoEvents.filter(e => e.type === 'limited_challenge').length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold">👑 Desafios Ativos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fomoEvents
                .filter(e => e.type === 'limited_challenge')
                .map((challenge) => (
                  <div key={challenge.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <FOMOTimer expiresAt={challenge.expires_at} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">+{challenge.reward_btz} BTZ</Badge>
                        {challenge.difficulty && (
                          <Badge variant="outline">Nível {challenge.difficulty}</Badge>
                        )}
                      </div>
                      <Button size="sm">
                        Começar
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Secret Achievements Hint */}
      <Card className="border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold">✨ Conquistas Secretas</h2>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Há conquistas secretas esperando para serem descobertas... 🕵️‍♂️
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                <div className="font-medium text-purple-600">💡 Dica Misteriosa:</div>
                <div>"Quando a lua está alta e o mundo dorme..."</div>
              </div>
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                <div className="font-medium text-purple-600">⚡ Dica de Velocidade:</div>
                <div>"A velocidade da luz não é páreo para..."</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}