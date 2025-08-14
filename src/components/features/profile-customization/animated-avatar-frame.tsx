import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedAvatarFrameProps {
  children: React.ReactNode;
  frameType?: 'bronze' | 'silver' | 'golden' | 'diamond' | 'rainbow' | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AnimatedAvatarFrame({ 
  children, 
  frameType = null, 
  size = 'md',
  className 
}: AnimatedAvatarFrameProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const getFrameStyles = () => {
    if (!frameType || !mounted) return {};

    switch (frameType) {
      case 'bronze':
        return {
          border: '3px solid #CD7F32',
          boxShadow: '0 0 15px rgba(205, 127, 50, 0.5)',
          animation: 'avatarPulse 2s ease-in-out infinite'
        };
      
      case 'silver':
        return {
          border: '3px solid #C0C0C0',
          boxShadow: '0 0 20px rgba(192, 192, 192, 0.6)',
          animation: 'avatarGlow 1.5s ease-in-out infinite alternate'
        };
      
      case 'golden':
        return {
          border: '3px solid #FFD700',
          boxShadow: '0 0 25px rgba(255, 215, 0, 0.7)',
          animation: 'avatarGoldenPulse 1s ease-in-out infinite'
        };
      
      case 'diamond':
        return {
          border: '3px solid #B9F2FF',
          boxShadow: '0 0 30px rgba(185, 242, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)',
          animation: 'avatarDiamondSparkle 2s linear infinite'
        };
      
      case 'rainbow':
        return {
          border: '3px solid transparent',
          background: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080) border-box',
          backgroundClip: 'padding-box, border-box',
          animation: 'avatarRainbow 3s linear infinite'
        };
      
      default:
        return {};
    }
  };

  return (
    <>
      {/* CSS Animations */}
      {mounted && (
        <style jsx>{`
          @keyframes avatarPulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 0 15px rgba(205, 127, 50, 0.5);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 0 25px rgba(205, 127, 50, 0.8);
            }
          }

          @keyframes avatarGlow {
            from { 
              box-shadow: 0 0 20px rgba(192, 192, 192, 0.6);
            }
            to { 
              box-shadow: 0 0 35px rgba(192, 192, 192, 1);
            }
          }

          @keyframes avatarGoldenPulse {
            0%, 100% { 
              box-shadow: 0 0 25px rgba(255, 215, 0, 0.7);
              filter: brightness(1);
            }
            50% { 
              box-shadow: 0 0 40px rgba(255, 215, 0, 1);
              filter: brightness(1.2);
            }
          }

          @keyframes avatarDiamondSparkle {
            0% { 
              box-shadow: 0 0 30px rgba(185, 242, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3);
            }
            25% { 
              box-shadow: 0 0 40px rgba(185, 242, 255, 1), inset 0 0 30px rgba(255, 255, 255, 0.5);
            }
            50% { 
              box-shadow: 0 0 35px rgba(255, 255, 255, 0.9), inset 0 0 25px rgba(185, 242, 255, 0.4);
            }
            75% { 
              box-shadow: 0 0 45px rgba(185, 242, 255, 1), inset 0 0 35px rgba(255, 255, 255, 0.6);
            }
            100% { 
              box-shadow: 0 0 30px rgba(185, 242, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3);
            }
          }

          @keyframes avatarRainbow {
            0% { 
              filter: hue-rotate(0deg) brightness(1);
            }
            25% { 
              filter: hue-rotate(90deg) brightness(1.1);
            }
            50% { 
              filter: hue-rotate(180deg) brightness(1.2);
            }
            75% { 
              filter: hue-rotate(270deg) brightness(1.1);
            }
            100% { 
              filter: hue-rotate(360deg) brightness(1);
            }
          }

          .avatar-frame-container {
            position: relative;
            display: inline-block;
          }

          .avatar-frame-particles::before {
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
            background-size: 10px 10px;
            border-radius: 50%;
            animation: particleFloat 3s ease-in-out infinite;
            pointer-events: none;
          }

          @keyframes particleFloat {
            0%, 100% { 
              opacity: 0.6;
              transform: rotate(0deg) scale(1);
            }
            50% { 
              opacity: 1;
              transform: rotate(180deg) scale(1.1);
            }
          }
        `}</style>
      )}

      <div 
        className={cn(
          'avatar-frame-container rounded-full overflow-hidden relative',
          sizeClasses[size],
          frameType === 'diamond' && 'avatar-frame-particles',
          className
        )}
        style={getFrameStyles()}
      >
        {children}
      </div>
    </>
  );
}