import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Copy, Check, QrCode, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { useI18n } from "@/hooks/use-i18n";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from 'qrcode';
import { useP2PNotifications } from "@/hooks/use-p2p-notifications";

export function ReceiveBTZ() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [latestTransfer, setLatestTransfer] = useState<{amount: number, senderNickname: string} | null>(null);
  const { toast } = useToast();
  const { profile } = useProfile();
  const { t } = useI18n();
  
  useP2PNotifications((amount, senderNickname) => {
    console.log('🔔 ReceiveBTZ: Notification callback triggered', { 
      amount, 
      senderNickname,
      timestamp: new Date().toISOString()
    });
    
    setLatestTransfer({ amount, senderNickname });
    setShowNotification(true);
    
    console.log('👁️ ReceiveBTZ: Visual notification state updated', {
      showNotification: true,
      latestTransfer: { amount, senderNickname }
    });
    
    setTimeout(() => {
      console.log('⏰ ReceiveBTZ: Auto-hiding notification after 5 seconds');
      setShowNotification(false);
    }, 5000);
  });

  useEffect(() => {
    if (profile?.id) {
      QRCode.toDataURL(profile.id, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl).catch(console.error);
    }
  }, [profile?.id]);

  const copyUserId = async () => {
    if (!profile?.id) return;
    
    try {
      await navigator.clipboard.writeText(profile.id);
      setCopied(true);
      toast({
        title: t('p2p.receive.copyId'),
        description: t('p2p.receive.copyIdDesc'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('p2p.receive.copyError'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-[#adff2f]" />
            {t('p2p.receive.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {t('p2p.receive.qrInstruction')}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('p2p.receive.yourId')}</label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm break-all">
                {profile?.id}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyUserId}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showNotification && latestTransfer && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="bg-green-50 border-green-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800">
                      {t('p2p.notifications.received.title')}
                    </h3>
                    <p className="text-sm text-green-700">
                      {t('p2p.notifications.received.body', { 
                        amount: latestTransfer.amount, 
                        sender: latestTransfer.senderNickname 
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotification(false)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
