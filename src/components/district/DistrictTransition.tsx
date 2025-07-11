import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DistrictTransitionProps {
  isTransitioning: boolean;
  fromLocation: string;
  toLocation: string;
  onComplete: () => void;
}

export const DistrictTransition: React.FC<DistrictTransitionProps> = ({
  isTransitioning,
  fromLocation,
  toLocation,
  onComplete
}) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!isTransitioning) return;

    const timeline = [
      { delay: 0, stage: 1 },      // Zoom out
      { delay: 800, stage: 2 },    // Travel effect
      { delay: 1600, stage: 3 },   // Zoom in
      { delay: 2400, stage: 0 },   // Complete
    ];

    const timers = timeline.map(({ delay, stage }) =>
      setTimeout(() => {
        if (stage === 0) {
          onComplete();
        } else {
          setStage(stage);
        }
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isTransitioning, onComplete]);

  if (!isTransitioning) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Stage 1: Zoom out overlay */}
        {stage === 1 && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1 }}
              animate={{ scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="text-white text-center">
                <motion.div
                  className="text-lg font-medium mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Saindo de {fromLocation}
                </motion.div>
                <motion.div
                  className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 2: Travel effect */}
        {stage === 2 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-900 via-blue-800 to-cyan-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Particle effects */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, -1000],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: Math.random() * 0.4,
                  }}
                />
              ))}
            </div>

            {/* Speed lines */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  style={{
                    top: `${20 + i * 10}%`,
                    left: '100%',
                    width: '200px',
                  }}
                  animate={{
                    x: [-200, -window.innerWidth - 200],
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center text-white text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <motion.div
                  className="text-2xl font-bold mb-4"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Viajando para
                </motion.div>
                <motion.div
                  className="text-3xl font-bold text-cyan-300"
                  initial={{ letterSpacing: '0.1em' }}
                  animate={{ letterSpacing: '0.2em' }}
                  transition={{ duration: 0.8 }}
                >
                  {toLocation}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 3: Zoom in */}
        {stage === 3 && (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="text-white text-center">
                <motion.div
                  className="text-xl font-medium"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Chegando em {toLocation}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};