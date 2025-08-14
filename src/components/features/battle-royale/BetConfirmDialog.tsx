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
      <DialogContent className="casino-glass-card border-casino-gold/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-casino-gold flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5" />
            Confirmar Entrada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Entry Fee Highlight */}
          <div className="text-center p-4 bg-casino-gold/10 border border-casino-gold/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Valor da Aposta</div>
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-6 h-6 text-casino-gold" />
              <span className="text-3xl font-bold text-casino-gold">{entryFee}</span>
              <span className="text-lg text-casino-gold">BTZ</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1 capitalize">Modo: {mode}</div>
          </div>

          {/* Balance Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo atual:</span>
              <span className="font-medium">{userBTZ.toFixed(1)} BTZ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo após entrada:</span>
              <span className="font-medium text-casino-purple">{remainingBTZ.toFixed(1)} BTZ</span>
            </div>
          </div>

          {/* Compact Warning */}
          <div className="text-xs text-muted-foreground text-center p-2 bg-amber-500/5 border border-amber-500/20 rounded">
            <AlertCircle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            Valor debitado imediatamente. Reembolso automático se cancelado.
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
            className="bg-[#adff2f] hover:bg-[#adff2f]/90 text-black"
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