import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface FOMOTimerProps {
  expiresAt: string;
  onExpired?: () => void;
  showUrgentAt?: number; // Minutes remaining to show urgent state
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'urgent' | 'flash';
}

export function FOMOTimer({ 
  expiresAt, 
  onExpired, 
  showUrgentAt = 30,
  size = 'md',
  variant = 'default'
}: FOMOTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  const [isUrgent, setIsUrgent] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining(null);
        onExpired?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const totalMinutes = Math.floor(diff / (1000 * 60));

      setTimeRemaining({ hours, minutes, seconds, total: diff });
      
      // Set urgent state
      const shouldBeUrgent = totalMinutes <= showUrgentAt;
      setIsUrgent(shouldBeUrgent);
      
      // Flash in last 5 minutes
      setIsFlashing(totalMinutes <= 5);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired, showUrgentAt]);

  if (!timeRemaining) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-2 py-1';
      case 'lg':
        return 'text-lg px-4 py-2';
      default:
        return 'text-base px-3 py-1.5';
    }
  };

  const getVariantClasses = () => {
    if (variant === 'flash' || isFlashing) {
      return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-400';
    }
    if (variant === 'urgent' || isUrgent) {
      return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-400';
    }
    return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-400';
  };

  const formatTime = () => {
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
    if (timeRemaining.minutes > 0) {
      return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    }
    return `${timeRemaining.seconds}s`;
  };

  return (
    <motion.div
      animate={isFlashing ? {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      } : {}}
      transition={isFlashing ? {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
      className={`
        inline-flex items-center gap-2 rounded-full border-2 font-bold
        ${getSizeClasses()}
        ${getVariantClasses()}
      `}
    >
      {isUrgent ? (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <AlertTriangle className="w-4 h-4" />
        </motion.div>
      ) : (
        <Clock className="w-4 h-4" />
      )}
      
      <span className="tabular-nums">
        {formatTime()}
      </span>
      
      {isUrgent && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-xs font-normal"
        >
          {isFlashing ? 'ENDING!' : 'HURRY!'}
        </motion.span>
      )}
    </motion.div>
  );
}