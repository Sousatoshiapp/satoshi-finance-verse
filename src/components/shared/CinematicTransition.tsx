import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientSounds } from '@/hooks/use-ambient-sounds';
import { useSensoryFeedback } from '@/hooks/use-sensory-feedback';

interface CinematicTransitionProps {
  children: React.ReactNode;
}

const TRANSITION_VARIANTS = {
  // Sliding transitions
  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },
  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  },
  
  // Wipe transitions
  wipeDown: {
    initial: { y: '-100%', scaleY: 0, opacity: 0 },
    animate: { y: 0, scaleY: 1, opacity: 1 },
    exit: { y: '100%', scaleY: 0, opacity: 0 }
  },
  wipeUp: {
    initial: { y: '100%', scaleY: 0, opacity: 0 },
    animate: { y: 0, scaleY: 1, opacity: 1 },
    exit: { y: '-100%', scaleY: 0, opacity: 0 }
  },
  
  // Scale transitions
  zoomIn: {
    initial: { scale: 0.8, opacity: 0, rotateZ: -5 },
    animate: { scale: 1, opacity: 1, rotateZ: 0 },
    exit: { scale: 1.2, opacity: 0, rotateZ: 5 }
  },
  zoomOut: {
    initial: { scale: 1.2, opacity: 0, rotateZ: 5 },
    animate: { scale: 1, opacity: 1, rotateZ: 0 },
    exit: { scale: 0.8, opacity: 0, rotateZ: -5 }
  },
  
  // Morphing transitions
  morph: {
    initial: { 
      scale: 0.5, 
      opacity: 0, 
      borderRadius: '50%',
      rotateX: -90
    },
    animate: { 
      scale: 1, 
      opacity: 1, 
      borderRadius: '0%',
      rotateX: 0
    },
    exit: { 
      scale: 0.5, 
      opacity: 0, 
      borderRadius: '50%',
      rotateX: 90
    }
  },
  
  // Parallax transitions
  parallax: {
    initial: { x: '100%', y: '-20%', scale: 0.9, opacity: 0 },
    animate: { x: 0, y: 0, scale: 1, opacity: 1 },
    exit: { x: '-100%', y: '20%', scale: 0.9, opacity: 0 }
  }
};

const ROUTE_TRANSITIONS: Record<string, keyof typeof TRANSITION_VARIANTS> = {
  '/dashboard': 'zoomIn',
  '/quiz': 'slideLeft',
  '/profile': 'wipeDown',
  '/ranking': 'parallax',
  '/settings': 'wipeUp',
  '/districts': 'morph',
  default: 'slideLeft'
};

export function CinematicTransition({ children }: CinematicTransitionProps) {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState<string>('');
  const [transitionKey, setTransitionKey] = useState(0);
  const ambientSounds = useAmbientSounds();
  const sensoryFeedback = useSensoryFeedback();

  const getTransitionType = (fromPath: string, toPath: string): keyof typeof TRANSITION_VARIANTS => {
    // Context-aware transition selection
    if (fromPath.includes('quiz') && toPath === '/dashboard') {
      return 'zoomOut'; // Victory zoom out
    }
    
    if (toPath.includes('quiz')) {
      return 'slideLeft'; // Enter quiz with energy
    }
    
    if (fromPath === '/dashboard' && toPath.includes('profile')) {
      return 'wipeDown'; // Personal space
    }
    
    if (toPath.includes('ranking')) {
      return 'parallax'; // Competitive energy
    }
    
    return ROUTE_TRANSITIONS[toPath] || ROUTE_TRANSITIONS.default;
  };

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (previousPath && previousPath !== currentPath) {
      // Trigger transition effects
      sensoryFeedback.triggerClick(document.body, 0.5);
      ambientSounds.playTransitionSound(previousPath, currentPath);
      
      // Generate unique key for transition
      setTransitionKey(prev => prev + 1);
    }
    
    setPreviousPath(currentPath);
  }, [location.pathname, previousPath, ambientSounds, sensoryFeedback]);

  const transitionType = getTransitionType(previousPath, location.pathname);
  const variant = TRANSITION_VARIANTS[transitionType];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${location.pathname}-${transitionKey}`}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoothness
          staggerChildren: 0.1
        }}
        className="relative min-h-screen w-full overflow-hidden"
        style={{ 
          transformOrigin: 'center center',
          perspective: '1000px'
        }}
      >
        {/* Background overlay for smooth transitions */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content container */}
        <motion.div
          className="relative z-10 h-full w-full"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { 
              opacity: 1, 
              y: 0,
              transition: {
                delay: 0.2,
                staggerChildren: 0.1
              }
            },
            exit: { opacity: 0, y: -20 }
          }}
        >
          {children}
        </motion.div>
        
        {/* Particle overlay for epic transitions */}
        {(transitionType === 'morph' || transitionType === 'parallax') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/30 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: 2
                }}
              />
            ))}
          </motion.div>
        )}
        
        {/* Scanline effect for cyber transitions */}
        {transitionType === 'slideLeft' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <div className="h-full w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-50" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}