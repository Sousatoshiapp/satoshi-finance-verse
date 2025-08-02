import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Scan, X, AlertCircle } from "lucide-react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { useI18n } from "@/hooks/use-i18n";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const handleScan = (result: any) => {
    if (result) {
      onScan(result[0]?.rawValue || result);
      onClose();
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    setError(t('p2p.qrScanner.cameraError'));
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          {t('p2p.qrScanner.title')}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          {scanning ? (
            <Scanner
              onScan={handleScan}
              onError={handleError}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('p2p.qrScanner.instruction')}</p>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <Button 
          onClick={startScanning} 
          disabled={scanning} 
          className="w-full"
        >
          {scanning ? t('p2p.qrScanner.scanning') : t('p2p.qrScanner.startScan')}
        </Button>
      </CardContent>
    </Card>
  );
}
