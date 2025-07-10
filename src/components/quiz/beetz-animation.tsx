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
          initial={{ opacity: 0, scale: 0.8, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1.2, 1, 0.5],
            y: [0, -20, -30, -100]
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.5, 
            y: -150,
            x: [0, 200]
          }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            times: [0, 0.3, 0.8, 1]
          }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 5, 0]
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeInOut"
            }}
            className="text-center relative"
          >
            <motion.div
              className="text-6xl font-black drop-shadow-2xl"
              style={{
                background: "linear-gradient(45deg, #adff2f, #90ee90, #32cd32)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 30px #adff2f80",
                fontFamily: "Impact, Arial Black, sans-serif"
              }}
            >
              +{amount} BTZ
            </motion.div>
            
            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0.5, 0],
                  opacity: [0, 1, 0.8, 0],
                  rotate: [0, 180, 360],
                  x: [0, (i % 2 === 0 ? 80 : -80) * (Math.random() + 0.5)],
                  y: [0, -120 * (Math.random() + 0.5)]
                }}
                transition={{ 
                  duration: 1.2,
                  delay: i * 0.08,
                  ease: "easeOut"
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: "radial-gradient(circle, #adff2f, #90ee90)",
                  left: "50%",
                  top: "50%",
                  boxShadow: "0 0 15px #adff2f, 0 0 30px #adff2f80"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}