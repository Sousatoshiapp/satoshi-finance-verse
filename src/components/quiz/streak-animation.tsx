import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StreakAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function StreakAnimation({ isVisible, onComplete }: StreakAnimationProps) {
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    if (isVisible && !audioPlayed) {
      // Play streak sound effect
      const audio = new Audio("/audio/streak-achievement.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {
        // Fallback if audio fails
      });
      setAudioPlayed(true);
      
      // Vibrate if on mobile - longer vibration for streak
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
      }
      
      // Complete animation after 2s
      setTimeout(() => {
        onComplete();
        setAudioPlayed(false);
      }, 2000);
    }
  }, [isVisible, audioPlayed, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,140,0,0.2) 50%, transparent 100%)"
          }}
        >
          {/* Main STREAK text */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ 
              scale: [0, 1.3, 1],
              rotate: [0, 10, -5, 0]
            }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut",
              times: [0, 0.6, 1]
            }}
            className="text-center relative"
          >
            <motion.div
              animate={{ 
                textShadow: [
                  "0 0 20px #ffd700, 0 0 40px #ffd700",
                  "0 0 30px #ff8c00, 0 0 60px #ff8c00",
                  "0 0 20px #ffd700, 0 0 40px #ffd700"
                ]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-9xl font-black text-[#ffd700] drop-shadow-2xl"
              style={{
                fontFamily: "Impact, Arial Black, sans-serif",
                WebkitTextStroke: "3px #ff8c00"
              }}
            >
              STREAK!
            </motion.div>
            
            {/* Fire effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0.8, 0],
                  opacity: [0, 1, 0.8, 0],
                  y: [0, -60, -80, -100],
                  x: [(Math.random() - 0.5) * 100]
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute w-6 h-6 rounded-full"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 300}%`,
                  bottom: "10%",
                  background: i % 2 === 0 
                    ? "linear-gradient(45deg, #ff4500, #ffd700)" 
                    : "linear-gradient(45deg, #ffd700, #ff8c00)",
                  filter: "blur(2px)",
                  boxShadow: "0 0 15px currentColor"
                }}
              />
            ))}
            
            {/* Lightning effects */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`lightning-${i}`}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scaleY: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 100 : -100)]
                }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.5 + i * 0.2,
                  ease: "easeInOut"
                }}
                className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-[#ffd700] to-transparent"
                style={{
                  left: `${50 + (i % 2 === 0 ? 150 : -150)}%`,
                  top: "20%",
                  transform: `rotate(${(i % 2 === 0 ? 15 : -15)}deg)`,
                  filter: "blur(1px)",
                  boxShadow: "0 0 10px #ffd700"
                }}
              />
            ))}
          </motion.div>
          
          {/* Screen flash effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute inset-0 bg-[#ffd700] mix-blend-overlay"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}