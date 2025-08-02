import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { ReceiveBTZ } from "@/components/features/p2p-transfer/ReceiveBTZ";
import { SendBTZ } from "@/components/features/p2p-transfer/SendBTZ";
import { TransferHistory } from "@/components/features/p2p-transfer/TransferHistory";

export default function P2PTransfer() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'send';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Transferências P2P</h1>
        <p className="text-muted-foreground">Envie e receba BTZ com outros usuários</p>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Enviar</TabsTrigger>
          <TabsTrigger value="receive">Receber</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send" className="mt-6">
          <SendBTZ />
        </TabsContent>
        
        <TabsContent value="receive" className="mt-6">
          <ReceiveBTZ />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <TransferHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
