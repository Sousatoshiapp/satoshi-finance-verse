import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalDuelInvites } from "@/contexts/GlobalDuelInviteContext";
import { DuelInviteModal } from "./duel-invite-modal";

export function GlobalDuelInviteHandler() {
  const { currentInvite, queueCount, dismissCurrentInvite } = useGlobalDuelInvites();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (currentInvite && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentInvite, countdown]);

  useEffect(() => {
    if (currentInvite) {
      setCountdown(30);
    }
  }, [currentInvite?.id]);

  useEffect(() => {
    if (currentInvite && countdown <= 0) {
      dismissCurrentInvite();
    }
  }, [countdown, currentInvite, dismissCurrentInvite]);

  if (!currentInvite || !currentInvite.challenger) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <DuelInviteModal
          invite={currentInvite}
          open={true}
          onClose={dismissCurrentInvite}
          onResponse={(accepted) => {
            dismissCurrentInvite();
          }}
          isGlobalPopup={true}
          countdown={countdown}
          queueCount={queueCount}
        />
      </motion.div>
    </AnimatePresence>
  );
}
