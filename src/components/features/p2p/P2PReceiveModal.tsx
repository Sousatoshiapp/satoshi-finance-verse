import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import confetti from 'canvas-confetti';

interface P2PReceiveModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  senderNickname: string;
}

export function P2PReceiveModal({ open, onClose, amount, senderNickname }: P2PReceiveModalProps) {
  
  useEffect(() => {
    if (open) {
      console.log('🎉 P2P Modal: Showing receive modal for', amount, 'BTZ from', senderNickname);
      
      // Trigger additional confetti when modal opens
      const colors = ['#adff2f', '#32cd32', '#00ff00', '#90EE90', '#98FB98'];
      
      confetti({
        particleCount: 300,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
        scalar: 0.4
      });
    }
  }, [open, amount, senderNickname]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-600">
            🎉 BTZ Received!
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <div className="text-2xl font-bold text-green-500">
              +{amount} BTZ
            </div>
            <div className="text-muted-foreground">
              Received from <span className="font-semibold">{senderNickname}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Your wallet has been updated successfully!
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
            Awesome! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}