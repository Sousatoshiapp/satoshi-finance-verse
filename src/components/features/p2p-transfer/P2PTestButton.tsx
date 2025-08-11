import { Button } from "@/components/shared/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { useP2PNotifications } from "@/hooks/use-p2p-notifications";

export function P2PTestButton() {
  const { profile } = useProfile();
  const { triggerReceiveNotification } = useP2PNotifications();

  const simulateReceive = async () => {
    if (!profile?.id) {
      console.error('❌ P2P Test: No profile found');
      return;
    }

    console.log('🧪 P2P Test: Simulating receive notification');
    console.log('🧪 P2P Test: Current profile:', profile.nickname, 'ID:', profile.id);
    
    await triggerReceiveNotification(500, 'Test Sender');
  };

  if (!profile) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={simulateReceive}
        variant="outline"
        size="sm"
        className="bg-primary/10 backdrop-blur-sm"
      >
        🧪 Test P2P Receive
      </Button>
    </div>
  );
}