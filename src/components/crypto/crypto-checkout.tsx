import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Copy, Check, ArrowLeft, Timer, Wallet, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/shared/ui/optimized-image";
import { motion } from "framer-motion";
import QRCode from 'qrcode';

interface CryptoCheckoutProps {
  paymentData: {
    payment_id: string;
    payment_url: string;
    crypto_amount: number;
    crypto_currency: string;
    address?: string;
    expires_at?: string;
  };
  productName: string;
  originalAmount: number;
  onBack: () => void;
  onSuccess?: () => void;
}

export function CryptoCheckout({ 
  paymentData, 
  productName, 
  originalAmount, 
  onBack,
  onSuccess 
}: CryptoCheckoutProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { toast } = useToast();

  // Generate QR Code
  useEffect(() => {
    if (paymentData.address && paymentData.crypto_amount) {
      const cryptoUri = `${paymentData.crypto_currency.toLowerCase()}:${paymentData.address}?amount=${paymentData.crypto_amount}`;
      
      QRCode.toDataURL(cryptoUri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl).catch(console.error);
    }
  }, [paymentData]);

  // Timer countdown
  useEffect(() => {
    if (!paymentData.expires_at) return;

    const updateTimer = () => {
      const expiresAt = new Date(paymentData.expires_at!).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [paymentData.expires_at]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Copiado!",
        description: `${type} copiado para a área de transferência`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-auto">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            {timeLeft > 0 && (
              <Badge variant="outline" className="ml-auto">
                <Timer className="h-3 w-3 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
            )}
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Pagamento em Criptomoeda
          </CardTitle>
          <CardDescription>
            {productName} • {formatPrice(originalAmount)}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              {paymentData.crypto_amount} {paymentData.crypto_currency}
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ {formatPrice(Math.round(originalAmount * 0.95))} (5% desconto aplicado)
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <OptimizedImage 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  width={192} 
                  height={192} 
                  className="w-48 h-48" 
                  priority={true}
                />
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                  <QrCode className="h-4 w-4" />
                  Escaneie com sua carteira
                </div>
                <p className="text-xs text-muted-foreground">
                  Aponte a câmera da sua carteira de cripto para o QR Code
                </p>
              </div>
            </motion.div>
          )}

          {/* Address */}
          {paymentData.address && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Endereço da Carteira:</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm break-all">
                  {paymentData.address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(paymentData.address!, 'Endereço')}
                >
                  {copied === 'Endereço' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Amount to send */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor a Enviar:</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono">
                {paymentData.crypto_amount} {paymentData.crypto_currency}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(paymentData.crypto_amount.toString(), 'Valor')}
              >
                {copied === 'Valor' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Como completar o pagamento:
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Abra sua carteira de {paymentData.crypto_currency}</li>
              <li>Escaneie o QR Code ou copie o endereço</li>
              <li>Envie exatamente {paymentData.crypto_amount} {paymentData.crypto_currency}</li>
              <li>Aguarde a confirmação da transação</li>
            </ol>
          </div>

          {/* Payment Status Link */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(paymentData.payment_url, '_blank')}
            >
              Ver Status do Pagamento
            </Button>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={onSuccess}
            >
              Já Enviei
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-amber-100 dark:bg-amber-900 rounded-full">
              <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Importante:
              </p>
              <ul className="text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Envie apenas {paymentData.crypto_currency} para este endereço</li>
                <li>• O pagamento expira em {timeLeft > 0 ? formatTime(timeLeft) : 'breve'}</li>
                <li>• Não envie de exchanges que não suportam contratos inteligentes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
