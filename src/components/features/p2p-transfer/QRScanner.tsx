import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Scan, X } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      onScan('demo-user-id-12345');
      setScanning(false);
      onClose();
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Scanner QR Code
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          {scanning ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Escaneando...</p>
            </div>
          ) : (
            <div className="text-center">
              <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Posicione o QR code aqui</p>
            </div>
          )}
        </div>
        <Button onClick={handleScan} disabled={scanning} className="w-full">
          {scanning ? 'Escaneando...' : 'Simular Scan (Demo)'}
        </Button>
      </CardContent>
    </Card>
  );
}
