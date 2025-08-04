import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Bluetooth, Users, Send, QrCode, ArrowLeft, Zap } from "lucide-react";
import { useP2PTransfer } from "@/hooks/use-p2p-transfer";
import { useProfile } from "@/hooks/use-profile";
import { useI18n } from "@/hooks/use-i18n";
import { useKYCStatus } from "@/hooks/use-kyc-status";
import { useBluetoothProximityTransfer } from "@/hooks/useBluetoothProximityTransfer";
import { useToast } from "@/hooks/use-toast";

interface NearbyUser {
  id: string;
  nickname: string;
  avatar_url?: string;
  deviceId: string;
  rssi?: number;
}

export default function ProximityTransferBluetooth() {
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [detectionTimeout, setDetectionTimeout] = useState(30);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  
  const { t } = useI18n();
  const { profile } = useProfile();
  const { transferBTZ, transferring } = useP2PTransfer();
  const { checkKYCRequired } = useKYCStatus();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    isScanning,
    isAdvertising,
    startProximityDetection,
    stopProximityDetection,
    sendTransferRequest,
    error: proximityError
  } = useBluetoothProximityTransfer({
    onUserDetected: (user: NearbyUser) => {
      setNearbyUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (!exists) {
          return [...prev, user];
        }
        return prev;
      });
    },
    onUserLost: (userId: string) => {
      setNearbyUsers(prev => prev.filter(u => u.id !== userId));
    }
  });

  useEffect(() => {
    startProximityDetection();
    
    const timer = setInterval(() => {
      setDetectionTimeout(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopProximityDetection();
    };
  }, [startProximityDetection, stopProximityDetection]);

  const handleSendBTZ = async () => {
    if (!selectedUser || !transferAmount) return;
    
    if (checkKYCRequired()) {
      toast({
        title: t('kyc.required'),
        description: t('kyc.subtitle'),
        variant: "destructive"
      });
      return;
    }

    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('p2p.errors.invalidAmount'),
        description: t('p2p.errors.invalidAmountDesc'),
        variant: "destructive"
      });
      return;
    }

    // Send Bluetooth notification first
    await sendTransferRequest(selectedUser.deviceId, amount);
    
    // Then execute the actual transfer via Supabase
    const result = await transferBTZ(selectedUser.id, amount);
    if (result.success) {
      setSelectedUser(null);
      setTransferAmount('');
      setShowAmountInput(false);
      toast({
        title: t('p2p.success.transferComplete'),
        description: t('p2p.success.transferCompleteDesc', { 
          amount, 
          user: selectedUser.nickname 
        }),
      });
    }
  };

  const handleFallbackToQR = () => {
    navigate('/p2p-transfer');
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return 'medium';
    if (rssi > -50) return 'strong';
    if (rssi > -70) return 'medium';
    return 'weak';
  };

  const getDistanceEstimate = (rssi?: number) => {
    if (!rssi) return '~5m';
    if (rssi > -50) return '<2m';
    if (rssi > -70) return '~5m';
    return '>10m';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/p2p-transfer')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Bluetooth className="h-5 w-5 text-primary" />
            {t('bluetooth.title')}
          </CardTitle>
          <p className="text-muted-foreground">{t('bluetooth.subtitle')}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status da detecção */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`flex items-center gap-2 ${isScanning ? 'text-primary' : 'text-muted-foreground'}`}>
                <Users className={`h-4 w-4 ${isScanning ? 'animate-pulse' : ''}`} />
                <span className="text-sm">{t('bluetooth.scanning')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isAdvertising ? 'text-primary' : 'text-muted-foreground'}`}>
                <Zap className={`h-4 w-4 ${isAdvertising ? 'animate-pulse' : ''}`} />
                <span className="text-sm">{t('bluetooth.advertising')}</span>
              </div>
            </div>
            
            {detectionTimeout > 0 && nearbyUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('bluetooth.searchingTimeout', { seconds: detectionTimeout })}
              </p>
            )}
          </div>

          {/* Lista de usuários próximos */}
          {nearbyUsers.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('bluetooth.nearbyUsers')} ({nearbyUsers.length})
              </h3>
              
              <div className="space-y-2">
                {nearbyUsers.map(user => (
                  <Card 
                    key={user.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-muted to-card flex items-center justify-center">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.nickname} 
                                className="w-full h-full rounded-full object-cover" 
                              />
                            ) : (
                              <span className="text-lg">👤</span>
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium">{user.nickname}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{getDistanceEstimate(user.rssi)}</span>
                              <span className={`h-2 w-2 rounded-full ${
                                getSignalStrength(user.rssi) === 'strong' ? 'bg-green-500' :
                                getSignalStrength(user.rssi) === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowAmountInput(true);
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {t('bluetooth.send')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Input de valor para transferência */}
          {showAmountInput && selectedUser && (
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">
                  {t('bluetooth.sendTo', { user: selectedUser.nickname })}
                </h3>
                
                <Input
                  type="number"
                  placeholder={t('p2p.send.amountPlaceholder')}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  max={profile?.points || 0}
                  className="text-center text-lg"
                />
                
                <p className="text-xs text-muted-foreground text-center">
                  {t('p2p.send.availableBalance', { balance: profile?.points || 0 })}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendBTZ} 
                    disabled={transferring || !transferAmount} 
                    className="flex-1"
                  >
                    {transferring ? t('p2p.send.sending') : t('p2p.send.sendButton')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAmountInput(false);
                      setTransferAmount('');
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fallback para QR Code */}
          {detectionTimeout === 0 && nearbyUsers.length === 0 && (
            <Card>
              <CardContent className="p-4 text-center space-y-4">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium">{t('bluetooth.noUsersFound')}</h3>
                  <p className="text-sm text-muted-foreground">{t('bluetooth.fallbackMessage')}</p>
                </div>
                <Button onClick={handleFallbackToQR} variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  {t('bluetooth.useQRCode')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Erro de proximidade */}
          {proximityError && (
            <Card className="border-destructive/20">
              <CardContent className="p-4 text-center">
                <p className="text-destructive text-sm">{proximityError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startProximityDetection}
                  className="mt-2"
                >
                  {t('bluetooth.tryAgain')}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}