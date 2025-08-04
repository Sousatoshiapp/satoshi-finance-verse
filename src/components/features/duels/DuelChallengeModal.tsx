import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Badge } from '@/components/shared/ui/badge';
import { Coins, Sword, User } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { useProfile } from '@/hooks/use-profile';
import { motion } from 'framer-motion';

interface DuelChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallenge: (betAmount: number) => void;
  challengedUser: {
    id: string;
    nickname: string;
    avatar_url?: string;
    level?: number;
  };
  loading?: boolean;
}

export function DuelChallengeModal({ 
  isOpen, 
  onClose, 
  onChallenge, 
  challengedUser, 
  loading = false 
}: DuelChallengeModalProps) {
  const [betAmount, setBetAmount] = useState('0');
  const { t } = useI18n();
  const { profile } = useProfile();

  const handleChallenge = () => {
    const amount = parseInt(betAmount) || 0;
    if (amount > (profile?.points || 0)) {
      return;
    }
    onChallenge(amount);
  };

  const maxBet = profile?.points || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-primary" />
            {t('duel.challenge.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenged User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-muted rounded-lg"
          >
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              {challengedUser.avatar_url ? (
                <img 
                  src={challengedUser.avatar_url} 
                  alt={challengedUser.nickname}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{challengedUser.nickname}</h3>
              {challengedUser.level && (
                <Badge variant="secondary" className="text-xs">
                  {t('common.level')} {challengedUser.level}
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Bet Amount Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="betAmount">{t('duel.bet.amount')}</Label>
              <div className="relative">
                <Input
                  id="betAmount"
                  type="number"
                  placeholder="0"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0"
                  max={maxBet}
                  className="pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">BTZ</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('duel.bet.available', { amount: maxBet })}
              </p>
            </div>

            {/* Quick Bet Buttons */}
            <div className="flex gap-2">
              {[0, 10, 50, 100].filter(amount => amount <= maxBet).map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(amount.toString())}
                  className="flex-1"
                >
                  {amount === 0 ? t('duel.bet.noBet') : `${amount} BTZ`}
                </Button>
              ))}
            </div>

            {/* Bet Info */}
            {parseInt(betAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    {t('duel.bet.info', { 
                      bet: betAmount, 
                      total: parseInt(betAmount) * 2 
                    })}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleChallenge}
              disabled={loading || (parseInt(betAmount) > maxBet)}
              className="flex-1"
            >
              {loading ? t('duel.challenge.sending') : t('duel.challenge.send')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}