import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Input } from '@/components/shared/ui/input';
import { Badge } from '@/components/shared/ui/badge';
import { Sword, Coins, User, X } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { useProfile } from '@/hooks/use-profile';
import { useDuels, type Duel } from '@/hooks/use-duels';

interface DuelInviteNotificationProps {
  duel: Duel;
  onClose: () => void;
}

export function DuelInviteNotification({ duel, onClose }: DuelInviteNotificationProps) {
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const { t } = useI18n();
  const { profile } = useProfile();
  const { respondToDuel, loading } = useDuels();

  const challengerName = duel.challenger_profile?.nickname || 'Unknown';
  const betAmount = duel.final_bet_amount;
  const hasCounterOffer = duel.status === 'counter_offered';
  const counterOfferAmount = duel.counter_offer_amount || 0;

  const handleAccept = async () => {
    await respondToDuel(duel.id, 'accept');
    onClose();
  };

  const handleReject = async () => {
    await respondToDuel(duel.id, 'reject');
    onClose();
  };

  const handleCounterOffer = async () => {
    const amount = parseInt(counterAmount) || 0;
    if (amount > (profile?.points || 0)) return;
    
    await respondToDuel(duel.id, 'counter', amount);
    onClose();
  };

  const maxBet = profile?.points || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <Card className="border-primary shadow-xl bg-gradient-to-br from-background to-muted">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sword className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {hasCounterOffer ? t('duel.counterOffer.received') : t('duel.challenge.received')}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t('duel.challenge.from')} {challengerName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Bet Info */}
            {(betAmount > 0 || counterOfferAmount > 0) && (
              <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <div className="flex items-center gap-1 text-xs">
                  <Coins className="h-3 w-3 text-yellow-600" />
                  <span className="font-medium">
                    {hasCounterOffer 
                      ? t('duel.counterOffer.amount', { amount: counterOfferAmount })
                      : t('duel.bet.amount', { amount: betAmount })
                    }
                  </span>
                </div>
                {(hasCounterOffer ? counterOfferAmount : betAmount) > 0 && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {t('duel.bet.winnerTakes', { 
                      total: (hasCounterOffer ? counterOfferAmount : betAmount) * 2 
                    })}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <AnimatePresence mode="wait">
              {!showCounterOffer ? (
                <motion.div
                  key="main-actions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAccept}
                      disabled={loading}
                      className="flex-1 h-8"
                    >
                      {t('duel.challenge.accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReject}
                      disabled={loading}
                      className="flex-1 h-8"
                    >
                      {t('duel.challenge.reject')}
                    </Button>
                  </div>
                  
                  {!hasCounterOffer && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowCounterOffer(true)}
                      className="w-full h-7 text-xs"
                    >
                      {t('duel.counterOffer.make')}
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="counter-offer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2"
                >
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(e.target.value)}
                        min="0"
                        max={maxBet}
                        className="h-8 text-xs pr-12"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Coins className="h-3 w-3 text-primary" />
                        <span className="text-xs">BTZ</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('duel.bet.available', { amount: maxBet })}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCounterOffer}
                      disabled={loading || parseInt(counterAmount) > maxBet}
                      className="flex-1 h-7 text-xs"
                    >
                      {t('duel.counterOffer.send')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCounterOffer(false)}
                      className="flex-1 h-7 text-xs"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}