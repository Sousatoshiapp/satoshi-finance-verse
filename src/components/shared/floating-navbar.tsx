import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IconSystem } from "@/components/icons/icon-system";
import { useI18n } from "@/hooks/use-i18n";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

export function FloatingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useI18n();
  const { unreadCount } = useUnreadMessages();
  const isArabic = language === 'ar-SA';

  const navItems = [
    { path: '/dashboard', icon: '🏠' as const, label: t('navigation.home') },
    { 
      path: unreadCount > 0 ? '/messages' : '/social', 
      icon: '💬' as const, 
      label: t('navigation.social'),
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { path: '/game-mode', icon: '🎮' as const, label: t('navigation.game') },
    { path: '/satoshi-city', icon: '🌃' as const, label: t('navigation.city') },
    { path: '/store', icon: '🛒' as const, label: t('navigation.store') },
    { path: '/profile', icon: '👤' as const, label: t('navigation.profile') }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="flex items-center justify-center p-mobile-2 px-8">
        <div className="bg-card/70 backdrop-blur-md border border-border rounded-3xl shadow-lg p-mobile-1">
          <div className="flex items-center justify-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (location.pathname === '/' && item.path === '/dashboard');
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "touch-target flex flex-col items-center gap-1 p-mobile-2 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground scale-105" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                    <div className="relative">
                      <IconSystem 
                        emoji={item.icon} 
                        size="lg" 
                        animated={isActive}
                        variant={isActive ? "glow" : "default"}
                      />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-mobile-xs font-medium leading-none",
                      isArabic && "hidden md:block"
                    )}>{item.label}</span>
                  </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}