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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (location.pathname === '/' && item.path === '/dashboard');
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive 
                    ? "bg-gradient-to-r from-primary to-success text-white shadow-glow scale-110" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}