import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileLoadingSpinner() {
  const isMobile = useIsMobile();
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`flex flex-col items-center space-y-4 ${isMobile ? 'p-8' : 'p-4'}`}>
        <div className="relative">
          <div className={`animate-spin rounded-full border-4 border-primary/20 border-t-primary ${isMobile ? 'h-12 w-12' : 'h-8 w-8'}`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`animate-ping rounded-full bg-primary/40 ${isMobile ? 'h-6 w-6' : 'h-4 w-4'}`}></div>
          </div>
        </div>
        <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-sm'}`}>
          {isMobile ? 'Carregando...' : 'Loading...'}
        </p>
        {isMobile && (
          <p className="text-xs text-muted-foreground/70 text-center max-w-xs">
            Se demorar muito, tente recarregar a página
          </p>
        )}
      </div>
    </div>
  );
}