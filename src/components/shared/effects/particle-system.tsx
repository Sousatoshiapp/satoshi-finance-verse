import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleSystemProps {
  type: 'coins' | 'stars' | 'fire' | 'lightning' | 'hearts';
  intensity: number;
  duration: number;
  sourcePosition: { x: number, y: number };
  targetPosition?: { x: number, y: number };
  trigger: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  emoji?: string;
}

export function ParticleSystem({
  type,
  intensity,
  duration,
  sourcePosition,
  targetPosition,
  trigger,
  onComplete
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const getTypeConfig = () => {
    switch (type) {
      case 'coins':
        return {
          emoji: '🪙',
          colors: ['#FFD700', '#FFA500', '#FF6347'],
          gravity: 0.3,
          spread: 60,
          speed: 8
        };
      case 'stars':
        return {
          emoji: '⭐',
          colors: ['#FFD700', '#FFFF00', '#FFA500'],
          gravity: 0.1,
          spread: 90,
          speed: 6
        };
      case 'fire':
        return {
          emoji: '🔥',
          colors: ['#FF4500', '#FF6347', '#FFD700'],
          gravity: -0.2,
          spread: 45,
          speed: 5
        };
      case 'lightning':
        return {
          emoji: '⚡',
          colors: ['#00FFFF', '#0080FF', '#FFFF00'],
          gravity: 0.1,
          spread: 30,
          speed: 12
        };
      case 'hearts':
        return {
          emoji: '💖',
          colors: ['#FF69B4', '#FF1493', '#FFB6C1'],
          gravity: 0.2,
          spread: 75,
          speed: 4
        };
      default:
        return {
          emoji: '✨',
          colors: ['#FFD700', '#FFA500'],
          gravity: 0.2,
          spread: 60,
          speed: 6
        };
    }
  };

  const createParticle = (config: ReturnType<typeof getTypeConfig>): Particle => {
    const angle = (Math.random() - 0.5) * config.spread * (Math.PI / 180);
    const speed = config.speed * (0.5 + Math.random() * 0.5);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: sourcePosition.x,
      y: sourcePosition.y,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      life: 1,
      maxLife: 1,
      size: 16 + Math.random() * 8,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      emoji: config.emoji
    };
  };

  useEffect(() => {
    if (!trigger) return;

    setIsActive(true);
    startTimeRef.current = Date.now();
    
    const config = getTypeConfig();
    const particleCount = Math.floor(intensity * 50);
    
    const initialParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        setParticles(prev => [...prev, createParticle(config)]);
      }, i * 50); // Stagger particle creation
    }

    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      
      if (elapsed >= duration) {
        setIsActive(false);
        setParticles([]);
        onComplete?.();
        return;
      }

      setParticles(prev => prev.map(particle => {
        const newParticle = {
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + config.gravity,
          life: particle.life - (1 / (duration / 16)) // Assuming 60fps
        };

        if (targetPosition) {
          const dx = targetPosition.x - newParticle.x;
          const dy = targetPosition.y - newParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 10) {
            const force = 0.1;
            newParticle.vx += (dx / distance) * force;
            newParticle.vy += (dy / distance) * force;
          }
        }

        return newParticle;
      }).filter(particle => particle.life > 0));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, intensity, duration, sourcePosition, targetPosition, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute text-2xl"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              fontSize: particle.size,
              filter: `drop-shadow(0 0 4px ${particle.color})`
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ 
              opacity: particle.life,
              scale: 1,
              rotate: Math.random() * 360
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ParticleSystemContainer() {
  const [activeSystems, setActiveSystems] = useState<Array<{
    id: string;
    props: Omit<ParticleSystemProps, 'onComplete'>;
  }>>([]);

  useEffect(() => {
    const handleShowParticleSystem = (event: CustomEvent) => {
      const particleData = event.detail;
      const id = Math.random().toString(36).substr(2, 9);
      
      setActiveSystems(prev => [...prev, {
        id,
        props: {
          ...particleData,
          trigger: true
        }
      }]);
    };

    window.addEventListener('showParticleSystem', handleShowParticleSystem as EventListener);
    
    return () => {
      window.removeEventListener('showParticleSystem', handleShowParticleSystem as EventListener);
    };
  }, []);

  const handleComplete = (id: string) => {
    setActiveSystems(prev => prev.filter(system => system.id !== id));
  };

  return (
    <>
      {activeSystems.map(({ id, props }) => (
        <ParticleSystem
          key={id}
          {...props}
          onComplete={() => handleComplete(id)}
        />
      ))}
    </>
  );
}
