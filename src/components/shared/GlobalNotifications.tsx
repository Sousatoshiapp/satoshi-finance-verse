import { SmartNotificationContainer } from "@/components/shared/notifications/smart-notification";
import { FloatingNumbersContainer } from "@/components/shared/animations/floating-numbers";
import { MilestoneCelebrationContainer } from "@/components/shared/celebrations/milestone-celebration";
import { ParticleSystemContainer } from "@/components/shared/effects/particle-system";
import { DuelInviteModal } from "@/components/duels/duel-invite-modal";
import { P2PReceiveModal } from "@/components/features/p2p/P2PReceiveModal";
import { P2PTestButton } from "@/components/features/p2p-transfer/P2PTestButton";
import { useGlobalDuelInvites } from "@/contexts/GlobalDuelInviteContext";
import { useP2PNotifications } from "@/hooks/use-p2p-notifications";

export function GlobalNotifications() {
  const { currentInvite, dismissCurrentInvite } = useGlobalDuelInvites();
  const { currentNotification, dismissP2PModal } = useP2PNotifications();

  console.log('🌐 GlobalNotifications: Rendering with P2P notification:', !!currentNotification);

  return (
    <div data-global-invites="true">
      <SmartNotificationContainer />
      <FloatingNumbersContainer />
      <MilestoneCelebrationContainer />
      <ParticleSystemContainer />
      
      {/* Global Duel Invite Modal */}
      <DuelInviteModal
        invite={currentInvite}
        open={!!currentInvite}
        onClose={dismissCurrentInvite}
        onResponse={(accepted) => {
          console.log(`🎯 Invite ${accepted ? 'accepted' : 'rejected'}`);
          dismissCurrentInvite();
        }}
      />
      
      {/* Global P2P Receive Modal */}
      <P2PReceiveModal
        open={!!currentNotification}
        onClose={dismissP2PModal}
        amount={currentNotification?.amount || 0}
        senderNickname={currentNotification?.senderNickname || ''}
      />
      
      {/* Test Button - commented out for security
      {process.env.NODE_ENV === 'development' && <P2PTestButton />} */}
    </div>
  );
}
