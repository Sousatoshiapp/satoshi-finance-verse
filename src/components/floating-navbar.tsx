import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FloatingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/social', icon: '💬', label: 'Social' },
    { path: '/game-mode', icon: '🎮', label: 'Jogue' },
    { path: '/satoshi-city', icon: '🌃', label: 'Cidade' },
    { path: '/store', icon: '🛒', label: 'Loja' },
    { path: '/profile', icon: '👤', label: 'Perfil' }
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
                      ? "bg-gradient-to-r from-primary to-success text-white shadow-glow scale-110" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="text-lg md:text-xl">{item.icon}</span>
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