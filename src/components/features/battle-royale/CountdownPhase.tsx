import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap } from 'lucide-react';

interface CountdownPhaseProps {
  onCountdownComplete: () => void;
}

export function CountdownPhase({ onCountdownComplete }: CountdownPhaseProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onCountdownComplete, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCountdownComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[400px] flex items-center justify-center"
    >
      <div className="text-center">
        {/* Background Effects */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-96 h-96 border-4 border-destructive/30 rounded-full"
          />
        </div>

        {/* Main Countdown */}
        <motion.div
          key={count}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
          className="relative z-10"
        >
          {count > 0 ? (
            <div className="text-9xl font-bold text-gradient bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
              {count}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2
                }}
                className="text-6xl font-bold text-gradient bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent flex items-center justify-center gap-4"
              >
                <Swords className="w-16 h-16 text-destructive" />
                LUTE!
                <Swords className="w-16 h-16 text-destructive" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 space-y-2"
        >
          {count > 0 ? (
            <p className="text-xl text-muted-foreground">
              Prepare-se para a batalha...
            </p>
          ) : (
            <motion.p
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-lg text-muted-foreground flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-warning" />
              A batalha começou!
              <Zap className="w-5 h-5 text-warning" />
            </motion.p>
          )}
        </motion.div>

        {/* Particle Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-destructive rounded-full"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}