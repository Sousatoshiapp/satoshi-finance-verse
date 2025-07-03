import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FloatingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Início' },
    { path: '/quiz', icon: '🧠', label: 'Quiz' },
    { path: '/leaderboard', icon: '🏆', label: 'Ranking' },
    { path: '/store', icon: '🛒', label: 'Loja' },
    { path: '/profile', icon: '👤', label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/90 backdrop-blur-md border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (location.pathname === '/' && item.path === '/dashboard');
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 min-w-[48px]",
                  isActive 
                    ? "bg-primary text-primary-foreground scale-110" 
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