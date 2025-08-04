import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Copy, Check, QrCode, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { useI18n } from "@/hooks/use-i18n";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from 'qrcode';
import { useP2PNotifications } from "@/hooks/use-p2p-notifications";
import { supabase } from "@/integrations/supabase/client";

export function ReceiveBTZ() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [latestTransfer, setLatestTransfer] = useState<{amount: number, senderNickname: string} | null>(null);
  const [debugAlerts, setDebugAlerts] = useState<Array<{id: string, message: string, type: 'info' | 'success' | 'error', timestamp: Date}>>([]);
  const { toast } = useToast();
  const { profile } = useProfile();
  const { t } = useI18n();

  const addDebugAlert = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const alert = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setDebugAlerts(prev => [...prev.slice(-4), alert]);
    
    toast({
      title: `🔍 Debug: ${type.toUpperCase()}`,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
      duration: 5000
    });
    
    setTimeout(() => {
      setDebugAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 10000);
  };
  
  useP2PNotifications((amount, senderNickname) => {
    addDebugAlert(`✅ TRANSFER RECEIVED! From ${senderNickname}: ${amount} BTZ`, 'success');
    
    setLatestTransfer({ amount, senderNickname });
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  }, addDebugAlert);

  useEffect(() => {
    if (profile?.id) {
      addDebugAlert(`🔍 Profile loaded: ${profile.id}`, 'info');
      addDebugAlert(`📡 P2P subscription should be active for receiver_id: ${profile.id}`, 'info');
      
      QRCode.toDataURL(profile.id, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl).catch(console.error);
    } else {
      addDebugAlert('❌ No profile.id available - subscription cannot be created', 'error');
    }
  }, [profile?.id]);

  useEffect(() => {
    let transferCheckCount = 0;
    const interval = setInterval(() => {
      if (profile?.id) {
        transferCheckCount++;
        if (transferCheckCount % 2 === 0) {
          addDebugAlert(`⏰ Still listening... No transfers received yet (${transferCheckCount * 30}s)`, 'info');
        } else {
          addDebugAlert(`📡 Subscription active for: ${profile.id.slice(0, 8)}...`, 'info');
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      const checkForMissedTransfers = async () => {
        try {
          const { data: recentTransfers, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('receiver_id', profile.id)
            .eq('transfer_type', 'p2p')
            .gte('created_at', new Date(Date.now() - 60000).toISOString())
            .order('created_at', { ascending: false });

          if (error) {
            addDebugAlert(`❌ Error checking for missed transfers: ${error.message}`, 'error');
          } else if (recentTransfers && recentTransfers.length > 0) {
            addDebugAlert(`🔍 Found ${recentTransfers.length} recent transfer(s) in database`, 'info');
          }
        } catch (error) {
        }
      };

      const missedTransferInterval = setInterval(checkForMissedTransfers, 15000);
      return () => clearInterval(missedTransferInterval);
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

      {debugAlerts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Debug Status (Mobile Testing)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {debugAlerts.map((alert) => (
              <div key={alert.id} className={`p-2 rounded text-xs ${
                alert.type === 'success' ? 'bg-green-100 text-green-800' :
                alert.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                <div className="flex items-center gap-2">
                  {alert.type === 'success' ? <CheckCircle className="h-3 w-3" /> :
                   alert.type === 'error' ? <AlertCircle className="h-3 w-3" /> :
                   <Clock className="h-3 w-3" />}
                  <span className="flex-1">{alert.message}</span>
                  <span className="text-xs opacity-70">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
