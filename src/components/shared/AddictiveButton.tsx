import React, { useRef, useEffect } from 'react';
import { Button, ButtonProps } from '@/components/shared/ui/button';
import { useSensoryFeedback } from '@/hooks/use-sensory-feedback';
import { cn } from '@/lib/utils';

interface AddictiveButtonProps extends ButtonProps {
  intensity?: number;
  breathe?: boolean;
  magnetic?: boolean;
  epic?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function AddictiveButton({ 
  children, 
  className,
  intensity = 1,
  breathe = false,
  magnetic = false,
  epic = false,
  onClick,
  ...props 
}: AddictiveButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sensoryFeedback = useSensoryFeedback();

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Add breathing animation if enabled
    if (breathe) {
      button.style.animation = 'addictive-button-breathe 3s ease-in-out infinite';
    }

    // Add magnetic effect if enabled
    if (magnetic) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < 100) {
          const force = Math.max(0, 1 - distance / 100);
          const moveX = deltaX * force * 0.1;
          const moveY = deltaY * force * 0.1;
          
          button.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + force * 0.05})`;
        } else {
          button.style.transform = '';
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [breathe, magnetic]);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      sensoryFeedback.triggerHover(buttonRef.current);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      sensoryFeedback.triggerClick(buttonRef.current, intensity);
      
      if (epic) {
        // Epic effects for important buttons
        sensoryFeedback.triggerSuccess(
          { x: e.clientX, y: e.clientY }, 
          intensity
        );
      }
    }
    
    onClick?.(e);
  };

  const addictiveClasses = cn(
    // Base addictive styles
    'relative overflow-hidden',
    'transition-all duration-300 ease-out',
    'hover:shadow-lg hover:shadow-primary/25',
    'active:scale-95',
    
    // Breathing effect base
    breathe && 'animate-pulse',
    
    // Epic button styles
    epic && [
      'bg-gradient-to-r from-primary via-primary-glow to-primary',
      'hover:from-primary-glow hover:via-primary hover:to-primary-glow',
      'text-primary-foreground font-bold',
      'border-2 border-primary-glow/50',
      'shadow-lg shadow-primary/30'
    ],
    
    className
  );

  useEffect(() => {
    // Add CSS animations for breathing and epic effects
    const style = document.createElement('style');
    style.textContent = `
      @keyframes addictive-button-breathe {
        0%, 100% { 
          transform: scale(1);
          filter: brightness(1);
        }
        50% { 
          transform: scale(1.02);
          filter: brightness(1.1);
        }
      }
      
      @keyframes addictive-button-glow {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(var(--primary), 0.3);
        }
        50% { 
          box-shadow: 0 0 30px rgba(var(--primary), 0.6);
        }
      }
      
      .addictive-button-epic::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
        transform: translateX(-100%);
        transition: transform 0.6s ease;
        pointer-events: none;
      }
      
      .addictive-button-epic:hover::before {
        transform: translateX(100%);
      }
    `;
    
    if (!document.querySelector('[data-addictive-button-styles]')) {
      style.setAttribute('data-addictive-button-styles', 'true');
      document.head.appendChild(style);
    }
  }, []);

  return (
    <Button
      ref={buttonRef}
      className={cn(
        addictiveClasses,
        epic && 'addictive-button-epic'
      )}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Ripple effect overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 scale-0 rounded-full bg-white/20 animate-pulse" />
      </div>
    </Button>
  );
}