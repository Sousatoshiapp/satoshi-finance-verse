import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeetzAnimationProps {
  isVisible: boolean;
  amount: number;
  onComplete: () => void;
}

export function BeetzAnimation({ isVisible, amount, onComplete }: BeetzAnimationProps) {
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    if (isVisible && !audioPlayed) {
      // Play sound effect
      const audio = new Audio("/audio/cash-register.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback if audio fails
      });
      setAudioPlayed(true);
      
      // Vibrate if on mobile
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      
      // Complete animation after 1.5s
      setTimeout(() => {
        onComplete();
        setAudioPlayed(false);
      }, 1500);
    }
  }, [isVisible, audioPlayed, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.8,
              repeat: 1,
              ease: "easeInOut"
            }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 0.8, repeat: 1 }}
              className="text-8xl font-black text-[#adff2f] drop-shadow-2xl"
              style={{
                textShadow: "0 0 20px #adff2f, 0 0 40px #adff2f, 0 0 60px #adff2f",
                fontFamily: "Impact, Arial Black, sans-serif"
              }}
            >
              +{amount} BTZ
            </motion.div>
            
            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 50 : -50) * Math.random()],
                  y: [0, -80 * Math.random()]
                }}
                transition={{ 
                  duration: 1.2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute w-4 h-4 bg-[#adff2f] rounded-full"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 200}%`,
                  top: `${50 + (Math.random() - 0.5) * 100}%`,
                  filter: "blur(1px)",
                  boxShadow: "0 0 10px #adff2f"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}