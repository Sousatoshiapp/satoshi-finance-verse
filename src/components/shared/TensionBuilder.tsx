import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useSensoryFeedback } from '@/hooks/use-sensory-feedback';
import { useAddictiveAnimations } from '@/hooks/use-addictive-animations';

interface TensionBuilderProps {
  isActive: boolean;
  intensity: number; // 0-1
  onPeak?: () => void;
  onRelease?: () => void;
  children: React.ReactNode;
  type?: 'anticipation' | 'near-miss' | 'combo-building' | 'streak-jeopardy';
}

const TENSION_CONFIGS = {
  anticipation: {
    color: 'rgba(255, 215, 0, 0.3)', // Gold
    pulseSpeed: 2,
    shakeIntensity: 0.3,
    buildup: 3000 // 3 seconds
  },
  'near-miss': {
    color: 'rgba(255, 165, 0, 0.4)', // Orange
    pulseSpeed: 3,
    shakeIntensity: 0.5,
    buildup: 1500 // 1.5 seconds
  },
  'combo-building': {
    color: 'rgba(138, 43, 226, 0.4)', // Purple
    pulseSpeed: 4,
    shakeIntensity: 0.2,
    buildup: 2000 // 2 seconds
  },
  'streak-jeopardy': {
    color: 'rgba(255, 0, 0, 0.5)', // Red
    pulseSpeed: 5,
    shakeIntensity: 0.8,
    buildup: 4000 // 4 seconds
  }
};

export function TensionBuilder({ 
  isActive, 
  intensity, 
  onPeak, 
  onRelease, 
  children, 
  type = 'anticipation' 
}: TensionBuilderProps) {
  const [currentPhase, setCurrentPhase] = useState<'building' | 'peak' | 'release'>('building');
  const [tensionLevel, setTensionLevel] = useState(0);
  const sensoryFeedback = useSensoryFeedback();
  const animations = useAddictiveAnimations();
  const controls = useAnimation();
  const buildupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tensionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const config = TENSION_CONFIGS[type];

  useEffect(() => {
    if (isActive && currentPhase === 'building') {
      // Start building tension
      const startTime = Date.now();
      const buildupDuration = config.buildup;
      
      const updateTension = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / buildupDuration, 1);
        
        // Exponential tension buildup
        const newTensionLevel = Math.pow(progress, 2) * intensity;
        setTensionLevel(newTensionLevel);
        
        // Trigger progressive feedback
        if (progress > 0.3) {
          sensoryFeedback.triggerTension(newTensionLevel * 10);
        }
        
        if (progress >= 1) {
          // Peak reached
          setCurrentPhase('peak');
          onPeak?.();
          
          // Auto-release after peak
          setTimeout(() => {
            setCurrentPhase('release');
            setTensionLevel(0);
            sensoryFeedback.triggerRelease();
            onRelease?.();
            
            // Reset after release
            setTimeout(() => {
              if (isActive) {
                setCurrentPhase('building');
              }
            }, 1000);
          }, 500);
        } else {
          tensionTimerRef.current = setTimeout(updateTension, 50);
        }
      };
      
      updateTension();
    } else if (!isActive) {
      // Immediate release
      setCurrentPhase('release');
      setTensionLevel(0);
      sensoryFeedback.triggerRelease();
      onRelease?.();
      
      setTimeout(() => {
        setCurrentPhase('building');
      }, 500);
    }
    
    return () => {
      if (buildupTimerRef.current) {
        clearTimeout(buildupTimerRef.current);
      }
      if (tensionTimerRef.current) {
        clearTimeout(tensionTimerRef.current);
      }
    };
  }, [isActive, currentPhase, intensity, config.buildup, sensoryFeedback, onPeak, onRelease]);

  // Animate based on tension level and phase
  useEffect(() => {
    const shakeAmount = tensionLevel * config.shakeIntensity;
    const pulseSpeed = config.pulseSpeed * (1 + tensionLevel);
    
    controls.start({
      scale: 1 + (tensionLevel * 0.1),
      rotateZ: [-shakeAmount, shakeAmount, -shakeAmount, 0],
      filter: `brightness(${1 + tensionLevel * 0.3}) saturate(${1 + tensionLevel * 0.5})`,
      transition: {
        scale: { duration: 0.2 },
        rotateZ: { 
          duration: 0.1,
          repeat: currentPhase === 'building' ? Infinity : 0,
          repeatType: 'loop'
        },
        filter: { duration: 0.3 }
      }
    });
  }, [tensionLevel, currentPhase, controls, config]);

  return (
    <motion.div
      className="relative"
      animate={controls}
      style={{ transformOrigin: 'center center' }}
    >
      {/* Tension overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
          mixBlendMode: 'overlay'
        }}
        animate={{
          opacity: tensionLevel,
          scale: 1 + (tensionLevel * 0.2)
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Pulsing ring effect */}
      {currentPhase === 'building' && tensionLevel > 0.3 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `2px solid ${config.color.replace('0.3', '0.8').replace('0.4', '0.8').replace('0.5', '0.8')}`,
            borderRadius: '50%'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8]
          }}
          transition={{
            duration: 2 / config.pulseSpeed,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Particle burst at peak */}
      {currentPhase === 'peak' && (
        <motion.div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: config.color.replace(/0\.[3-5]/, '1'),
                top: '50%',
                left: '50%'
              }}
              initial={{
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i / 12) * Math.PI * 2) * 100,
                y: Math.sin((i / 12) * Math.PI * 2) * 100,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut'
              }}
            />
          ))}
        </motion.div>
      )}
      
      {/* Energy bars */}
      {tensionLevel > 0.2 && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center pointer-events-none">
          <div className="flex space-x-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-2 bg-gradient-to-t from-transparent to-current rounded-full"
                style={{
                  color: config.color.replace(/0\.[3-5]/, '1')
                }}
                animate={{
                  scaleY: tensionLevel * 10 > i ? 1 : 0.2,
                  opacity: tensionLevel * 10 > i ? 1 : 0.3
                }}
                transition={{ duration: 0.1, delay: i * 0.02 }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Screen distortion effect for high tension */}
      {tensionLevel > 0.7 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 49%, ${config.color} 49.5%, ${config.color} 50.5%, transparent 51%)`,
            backgroundSize: '20px 20px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '20px 20px'],
            opacity: [0, tensionLevel - 0.7, 0]
          }}
          transition={{
            backgroundPosition: {
              duration: 0.5,
              repeat: Infinity,
              ease: 'linear'
            },
            opacity: {
              duration: 0.3,
              repeat: Infinity,
              repeatType: 'reverse'
            }
          }}
        />
      )}
      
      {/* Content */}
      <motion.div
        animate={{
          filter: `hue-rotate(${tensionLevel * 30}deg)`
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}