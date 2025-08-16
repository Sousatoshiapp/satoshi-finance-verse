import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Button } from "@/components/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import { SendBTZ } from "@/components/features/p2p-transfer/SendBTZ";
import { ReceiveBTZ } from "@/components/features/p2p-transfer/ReceiveBTZ";
import { TransferHistory } from "@/components/features/p2p-transfer/TransferHistory";
import { KYCRequiredOverlay } from "@/components/features/p2p-transfer/KYCRequiredOverlay";
import { KYCVerification } from "@/components/features/kyc/KYCVerification";
import { ProximityDetection } from "@/components/proximity/ProximityDetection";
import { useI18n } from "@/hooks/use-i18n";
import { useKYCStatus } from "@/hooks/use-kyc-status";
export default function P2PTransfer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { checkKYCRequired } = useKYCStatus();
  const [showKYCVerification, setShowKYCVerification] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'send';

  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const isKYCRequired = false; // checkKYCRequired();

  if (showKYCVerification) {
    return (
      <KYCVerification 
        onComplete={() => setShowKYCVerification(false)}
        onCancel={() => setShowKYCVerification(false)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">{t('p2p.title')}</h1>
        <p className="text-muted-foreground">{t('p2p.subtitle')}</p>
      </div>

      {isKYCRequired ? (
        <div className="max-w-md mx-auto text-center p-8">
          <h3 className="text-lg font-semibold mb-2">P2P Transfer em breve!</h3>
          <p className="text-muted-foreground">Esta funcionalidade será lançada em uma próxima versão.</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">{t('p2p.tabs.send')}</TabsTrigger>
            <TabsTrigger value="receive">{t('p2p.tabs.receive')}</TabsTrigger>
            <TabsTrigger value="history">{t('p2p.tabs.history')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="send" className="mt-6 space-y-6">
            <SendBTZ />
            <ProximityDetection />
          </TabsContent>
          
          <TabsContent value="receive" className="mt-6">
            <ReceiveBTZ />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <TransferHistory />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
