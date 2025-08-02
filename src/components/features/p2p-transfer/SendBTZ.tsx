import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Send, Scan } from "lucide-react";
import { useP2PTransfer } from "@/hooks/use-p2p-transfer";
import { useProfile } from "@/hooks/use-profile";
import { QRScanner } from "./QRScanner";

export function SendBTZ() {
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const { transferBTZ, transferring } = useP2PTransfer();
  const { profile } = useProfile();

  const handleTransfer = async () => {
    if (!receiverId || !amount) return;
    
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }
    
    const result = await transferBTZ(receiverId, numAmount);
    if (result.success) {
      setReceiverId('');
      setAmount('');
    }
  };

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
              Enviar BTZ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiver">ID do Destinatário</Label>
              <div className="flex gap-2">
                <Input
                  id="receiver"
                  placeholder="Cole o ID ou escaneie QR code"
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
              <Label htmlFor="amount">Valor (BTZ)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={profile?.points || 0}
              />
              <p className="text-xs text-muted-foreground">
                Saldo disponível: {profile?.points || 0} BTZ
              </p>
            </div>

            <Button
              onClick={handleTransfer}
              disabled={!receiverId || !amount || transferring || (amount && parseInt(amount) <= 0)}
              className="w-full"
            >
              {transferring ? 'Transferindo...' : 'Enviar BTZ'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
