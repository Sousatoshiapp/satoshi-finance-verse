import { RealtimeDuelInvitePopup } from "@/components/duels/RealtimeDuelInvitePopup";
import { GlobalBTZNotification } from "@/components/shared/GlobalBTZNotification";

export function GlobalNotifications() {
  return (
    <>
      <RealtimeDuelInvitePopup />
      <GlobalBTZNotification />
    </>
  );
}
