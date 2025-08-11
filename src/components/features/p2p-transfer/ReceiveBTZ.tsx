import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Copy, Check, QrCode, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { useI18n } from "@/hooks/use-i18n";
import { OptimizedImage } from "@/components/shared/ui/optimized-image";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from 'qrcode';
import { supabase } from "@/integrations/supabase/client";

export function ReceiveBTZ() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { profile } = useProfile();
  const { t } = useI18n();

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
                <OptimizedImage 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  width={192} 
                  height={192} 
                  className="w-48 h-48" 
                  priority={true}
                />
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


    </div>
  );
}
