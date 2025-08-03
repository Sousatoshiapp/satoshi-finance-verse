import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { SendBTZ } from "@/components/features/p2p-transfer/SendBTZ";
import { ReceiveBTZ } from "@/components/features/p2p-transfer/ReceiveBTZ";
import { useI18n } from "@/hooks/use-i18n";

export default function P2PTransfer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'send';

  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('tab', value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">{t('p2p.title')}</h1>
        <p className="text-muted-foreground">{t('p2p.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">{t('p2p.tabs.send')}</TabsTrigger>
          <TabsTrigger value="receive">{t('p2p.tabs.receive')}</TabsTrigger>
          <TabsTrigger value="history">{t('p2p.tabs.history')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send" className="mt-6">
          <SendBTZ />
        </TabsContent>
        
        <TabsContent value="receive" className="mt-6">
          <ReceiveBTZ />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Histórico de transferências em desenvolvimento</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
