import { SmartNotificationContainer } from "@/components/shared/notifications/smart-notification";
import { FloatingNumbersContainer } from "@/components/shared/animations/floating-numbers";
import { MilestoneCelebrationContainer } from "@/components/shared/celebrations/milestone-celebration";
import { ParticleSystemContainer } from "@/components/shared/effects/particle-system";
import { DuelInviteModal } from "@/components/duels/duel-invite-modal";
import { useGlobalDuelInvites } from "@/contexts/GlobalDuelInviteContext";

export function GlobalNotifications() {
  const { currentInvite, dismissCurrentInvite } = useGlobalDuelInvites();

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
    </div>
  );
}
