import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Coins, Trophy } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Card } from '@/components/shared/ui/card';

interface BetConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: string;
  entryFee: number;
  userBTZ: number;
  isLoading?: boolean;
}

export const BetConfirmDialog: React.FC<BetConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  mode,
  entryFee,
  userBTZ,
  isLoading = false
}) => {
  const remainingBTZ = userBTZ - entryFee;
  const maxPrize = entryFee * 100; // Assumindo 100 jogadores máximo

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="casino-glass-card border-casino-gold/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-casino-gold flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Confirmar Entrada na Batalha
          </DialogTitle>
          <DialogDescription>
            Confirme os detalhes da sua entrada no Battle Royale
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bet Summary */}
          <Card className="p-4 bg-background/50">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Modo:</span>
                <span className="font-bold text-casino-gold capitalize">{mode}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Entry Fee:</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-casino-gold" />
                  <span className="font-bold text-casino-gold">{entryFee} BTZ</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Seu saldo atual:</span>
                <span className="font-bold">{userBTZ.toFixed(1)} BTZ</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Saldo após entrada:</span>
                <span className="font-bold text-casino-purple">{remainingBTZ.toFixed(1)} BTZ</span>
              </div>
            </div>
          </Card>

          {/* Prize Info */}
          <Card className="p-4 bg-casino-gold/10 border-casino-gold/30">
            <div className="text-center space-y-2">
              <Trophy className="w-8 h-8 text-casino-gold mx-auto" />
              <h3 className="font-bold text-casino-gold">Prêmios Possíveis</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="font-bold text-casino-gold">1º Lugar</div>
                  <div className="text-muted-foreground">70% do prize pool</div>
                </div>
                <div>
                  <div className="font-bold text-casino-purple">2º Lugar</div>
                  <div className="text-muted-foreground">20% do prize pool</div>
                </div>
                <div>
                  <div className="font-bold text-green-400">3º Lugar</div>
                  <div className="text-muted-foreground">10% do prize pool</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-500">Importante:</p>
              <p className="text-muted-foreground">
                O valor da aposta será debitado imediatamente. Se a batalha for cancelada 
                por falta de jogadores, você será reembolsado automaticamente.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading || remainingBTZ < 0}
            className="bg-casino-gold hover:bg-casino-gold/90 text-casino-dark"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Coins className="w-4 h-4" />
              </motion.div>
            ) : (
              'Confirmar Entrada'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};