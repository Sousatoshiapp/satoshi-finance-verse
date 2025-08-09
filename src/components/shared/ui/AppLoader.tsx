import React from 'react';
import { cn } from '@/lib/utils';

interface AppLoaderProps {
  className?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ className }) => {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm",
      className
    )}>
      <div className="relative flex flex-col items-center space-y-4">
        {/* Logo animado */}
        <div className="relative">
          <div className="app-loader-logo">
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 100 100" 
              className="text-primary"
              fill="currentColor"
            >
              {/* Logo "+" verde */}
              <rect x="40" y="20" width="20" height="60" rx="10" />
              <rect x="20" y="40" width="60" height="20" rx="10" />
            </svg>
          </div>
          
          {/* Círculo de loading ao redor */}
          <div className="app-loader-ring"></div>
        </div>
        
        {/* Texto opcional */}
        <div className="app-loader-text">
          <div className="h-2 w-16 bg-muted/30 rounded-full overflow-hidden">
            <div className="app-loader-progress"></div>
          </div>
        </div>
      </div>
      
      <style>{`
        .app-loader-logo {
          animation: logoSpin 2s linear infinite, logoPulse 1.5s ease-in-out infinite alternate;
          transform-origin: center;
        }
        
        .app-loader-ring {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 80px;
          height: 80px;
          border: 2px solid transparent;
          border-top: 2px solid hsl(var(--primary));
          border-radius: 50%;
          animation: ringRotate 1s linear infinite;
        }
        
        .app-loader-progress {
          height: 100%;
          background: linear-gradient(90deg, transparent, hsl(var(--primary)), transparent);
          animation: progressSlide 2s ease-in-out infinite;
        }
        
        .app-loader-text {
          animation: fadeInOut 2s ease-in-out infinite;
        }
        
        @keyframes logoSpin {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes logoPulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes progressSlide {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};