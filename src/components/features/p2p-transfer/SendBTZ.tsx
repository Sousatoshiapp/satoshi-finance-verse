import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Send, Scan } from "lucide-react";
import { useP2PTransfer } from "@/hooks/use-p2p-transfer";
import { useProfile } from "@/hooks/use-profile";
import { useI18n } from "@/hooks/use-i18n";
import { useKYCStatus } from "@/hooks/use-kyc-status";
import { useAdvancedQuizAudio } from "@/hooks/use-advanced-quiz-audio";
import { KYCVerification } from "../kyc/KYCVerification";
import { QRScanner } from "./QRScanner";
import { BeetzAnimation } from "../quiz/beetz-animation";

export function SendBTZ() {
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showKYCVerification, setShowKYCVerification] = useState(false);
  const [showBeetzAnimation, setShowBeetzAnimation] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const { transferBTZ, transferring } = useP2PTransfer();
  const { profile } = useProfile();
  const { t } = useI18n();
  const { checkKYCRequired } = useKYCStatus();
  const { playCashRegisterSound } = useAdvancedQuizAudio();

  const handleTransfer = async () => {
    if (!receiverId || !amount) return;
    
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    // if (checkKYCRequired()) {
    //   setShowKYCVerification(true);
    //   return;
    // }
    
    const result = await transferBTZ(receiverId, numAmount);
    if (result.success) {
      setTransferAmount(numAmount);
      setShowBeetzAnimation(true);
      playCashRegisterSound();
      
      setReceiverId('');
      setAmount('');
    }
  };

  if (showKYCVerification) {
    return (
      <KYCVerification 
        onComplete={() => {
          setShowKYCVerification(false);
          handleTransfer();
        }}
        onCancel={() => setShowKYCVerification(false)}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {showScanner ? (
        <QRScanner 
          onScan={(result) => setReceiverId(result)}
          onClose={() => setShowScanner(false)}
        />
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Send className="h-5 w-5 text-[#adff2f]" />
              {t('p2p.send.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiver">{t('p2p.send.receiverLabel')}</Label>
              <div className="flex gap-2">
                <Input
                  id="receiver"
                  placeholder={t('p2p.send.receiverPlaceholder')}
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowScanner(true)}
                >
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('p2p.send.amountLabel')}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={t('p2p.send.amountPlaceholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={profile?.points || 0}
              />
              <p className="text-xs text-muted-foreground">
                {t('p2p.send.availableBalance', { balance: profile?.points || 0 })}
              </p>
            </div>

            <Button
              onClick={handleTransfer}
              disabled={!receiverId || !amount || transferring || (amount && parseInt(amount) <= 0)}
              className="w-full"
            >
              {transferring ? t('p2p.send.sending') : t('p2p.send.sendButton')}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <BeetzAnimation
        isVisible={showBeetzAnimation}
        amount={transferAmount}
        onComplete={() => setShowBeetzAnimation(false)}
      />
    </div>
  );
}
