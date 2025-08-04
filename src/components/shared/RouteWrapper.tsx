import React from 'react';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';
import { FloatingNavbar } from '@/components/shared/floating-navbar';

interface RouteWrapperProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  showNavbar?: boolean;
  adminOnly?: boolean;
}

export function RouteWrapper({
  children,
  requiresAuth = true,
  showNavbar = true,
  adminOnly = false
}: RouteWrapperProps) {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  
  console.log('🎯 RouteWrapper:', {
    currentPath,
    currentHash,
    requiresAuth,
    showNavbar,
    adminOnly,
    fullUrl: window.location.href
  });

  return (
    <AuthMiddleware requiresAuth={requiresAuth} adminOnly={adminOnly}>
      {children}
      {showNavbar && <FloatingNavbar />}
    </AuthMiddleware>
  );
}
