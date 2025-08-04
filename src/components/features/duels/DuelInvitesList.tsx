import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Input } from '@/components/shared/ui/input';
import { Badge } from '@/components/shared/ui/badge';
import { Sword, Coins, User, X, Clock } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { useProfile } from '@/hooks/use-profile';
import { useDuels } from '@/hooks/use-duels';
import { useDuelInvites, type DuelInvite } from '@/hooks/use-duel-invites';

export function DuelInvitesList() {
  const { invites, loading } = useDuelInvites();
  const { respondToDuel } = useDuels();
  const { t } = useI18n();
  const { profile } = useProfile();
  const [showCounterOffer, setShowCounterOffer] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState('');

  const handleAccept = async (inviteId: string) => {
    await respondToDuel(inviteId, 'accept');
  };

  const handleReject = async (inviteId: string) => {
    await respondToDuel(inviteId, 'reject');
  };

  const handleCounterOffer = async (inviteId: string) => {
    const amount = parseInt(counterAmount) || 0;
    if (amount > (profile?.points || 0)) return;
    
    await respondToDuel(inviteId, 'counter', amount);
    setShowCounterOffer(null);
    setCounterAmount('');
  };

  const maxBet = profile?.points || 0;

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sword className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            {t('duel.invites.none')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {invites.map((invite) => (
          <motion.div
            key={invite.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {invite.challenger_profile?.nickname || 'Unknown Player'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('duel.challenge.challengedYou')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {invite.quiz_topic}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(invite.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <AnimatePresence mode="wait">
                  {showCounterOffer !== invite.id ? (
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
                          onClick={() => handleAccept(invite.id)}
                          className="flex-1"
                        >
                          {t('duel.challenge.accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(invite.id)}
                          className="flex-1"
                        >
                          {t('duel.challenge.reject')}
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowCounterOffer(invite.id)}
                        className="w-full"
                      >
                        {t('duel.counterOffer.make')}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="counter-offer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('duel.bet.amount')}
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            min="0"
                            max={maxBet}
                            className="pr-16"
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
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleCounterOffer(invite.id)}
                          disabled={parseInt(counterAmount) > maxBet}
                          className="flex-1"
                        >
                          {t('duel.counterOffer.send')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowCounterOffer(null);
                            setCounterAmount('');
                          }}
                          className="flex-1"
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
        ))}
      </AnimatePresence>
    </div>
  );
}