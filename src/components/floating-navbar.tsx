import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IconSystem } from "@/components/icons/icon-system";

export function FloatingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠' as const, label: 'Home' },
    { path: '/social', icon: '💬' as const, label: 'Social' },
    { path: '/game-mode', icon: '🎮' as const, label: 'Jogue' },
    { path: '/satoshi-city', icon: '🌃' as const, label: 'Cidade' },
    { path: '/store', icon: '🛒' as const, label: 'Loja' },
    { path: '/profile', icon: '👤' as const, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50">
      <div className="flex items-center justify-center px-4">
        <div className="bg-card/50 backdrop-blur-md border border-border rounded-full shadow-lg px-1 py-1 md:px-2">
          <div className="flex items-center justify-center gap-0.5 md:gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (location.pathname === '/' && item.path === '/dashboard');
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                    className={cn(
                     "flex flex-col items-center gap-0.5 p-1.5 md:p-2 rounded-full transition-all duration-200",
                     isActive 
                       ? "bg-gray-900 text-white scale-110" 
                       : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                   )}
                 >
                   <IconSystem 
                     emoji={item.icon} 
                     size="lg" 
                     animated={isActive}
                     variant={isActive ? "glow" : "default"}
                   />
                   <span className="text-[10px] md:text-xs font-medium leading-none">{item.label}</span>
                 </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}