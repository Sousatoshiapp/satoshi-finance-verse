import { RealtimeDuelInvitePopup } from "@/components/duels/RealtimeDuelInvitePopup";
import { GlobalBTZNotification } from "@/components/shared/GlobalBTZNotification";
import { SmartNotificationContainer } from "@/components/shared/notifications/smart-notification";
import { FloatingNumbersContainer } from "@/components/shared/animations/floating-numbers";
import { MilestoneCelebrationContainer } from "@/components/shared/celebrations/milestone-celebration";
import { ParticleSystemContainer } from "@/components/shared/effects/particle-system";

export function GlobalNotifications() {
  return (
    <>
      <RealtimeDuelInvitePopup />
      <GlobalBTZNotification />
      <SmartNotificationContainer />
      <FloatingNumbersContainer />
      <MilestoneCelebrationContainer />
      <ParticleSystemContainer />
    </>
  );
}
