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
      // Play futuristic streak sound effect
      const audio = new Audio("/audio/streak.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {
        // Fallback if audio fails
      });
      setAudioPlayed(true);
      
      // Vibrate if on mobile - futuristic pattern
      if (navigator.vibrate) {
        navigator.vibrate([200, 50, 200, 50, 400]);
      }
      
      // Complete animation after 2.5s for better impact
      setTimeout(() => {
        onComplete();
        setAudioPlayed(false);
      }, 2500);
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
            background: "radial-gradient(circle, rgba(0,255,255,0.4) 0%, rgba(255,0,255,0.3) 30%, rgba(0,0,0,0.8) 70%, transparent 100%)"
          }}
        >
          {/* Neon Grid Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px"
            }} />
          </div>

          {/* Main STREAK text with neon effects */}
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ 
              scale: [0, 1.4, 1.1, 1],
              rotateY: [180, 0, -10, 0]
            }}
            transition={{ 
              duration: 2,
              ease: "easeOut",
              times: [0, 0.4, 0.7, 1]
            }}
            className="text-center relative"
          >
            {/* Glitch effect background */}
            <motion.div
              animate={{
                x: [0, -3, 3, 0],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                repeatDelay: 1.5,
                times: [0, 0.5, 1]
              }}
              className="absolute inset-0 text-9xl font-black text-red-500"
              style={{
                fontFamily: "Impact, Arial Black, sans-serif",
                WebkitTextStroke: "2px #ff0080",
                filter: "blur(1px)"
              }}
            >
              STREAK!
            </motion.div>

            {/* Main neon text */}
            <motion.div
              animate={{ 
                textShadow: [
                  "0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff",
                  "0 0 15px #ff00ff, 0 0 30px #ff00ff, 0 0 60px #ff00ff, 0 0 120px #ff00ff",
                  "0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff"
                ]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-9xl font-black text-white relative z-10"
              style={{
                fontFamily: "Impact, Arial Black, sans-serif",
                WebkitTextStroke: "2px #00ffff",
                filter: "drop-shadow(0 0 20px #00ffff)"
              }}
            >
              STREAK!
            </motion.div>
            
            {/* Neon particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0.8, 0],
                  opacity: [0, 1, 0.8, 0],
                  x: [0, (Math.cos(i * 30 * Math.PI / 180) * 200)],
                  y: [0, (Math.sin(i * 30 * Math.PI / 180) * 200)]
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.3 + i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  background: i % 3 === 0 
                    ? "radial-gradient(circle, #00ffff, transparent)" 
                    : i % 3 === 1
                    ? "radial-gradient(circle, #ff00ff, transparent)"
                    : "radial-gradient(circle, #ffff00, transparent)",
                  boxShadow: `0 0 20px ${i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00'}`
                }}
              />
            ))}
            
            {/* Energy rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ 
                  scale: [0, 2 + i * 0.5],
                  opacity: [0.8, 0]
                }}
                transition={{ 
                  duration: 1.8,
                  delay: 0.2 + i * 0.3,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-full border-2"
                style={{
                  borderColor: i % 2 === 0 ? '#00ffff' : '#ff00ff',
                  filter: `blur(${i}px)`,
                  boxShadow: `0 0 30px ${i % 2 === 0 ? '#00ffff' : '#ff00ff'}`
                }}
              />
            ))}

            {/* Cyberpunk scanlines */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "200%" }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                ease: "linear"
              }}
              className="absolute inset-0 w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
              style={{
                filter: "blur(1px)"
              }}
            />
          </motion.div>
          
          {/* Screen flash effect with neon colors */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 mix-blend-overlay"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}