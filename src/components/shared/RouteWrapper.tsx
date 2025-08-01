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
  return (
    <AuthMiddleware requiresAuth={requiresAuth} adminOnly={adminOnly}>
      {children}
      {showNavbar && <FloatingNavbar />}
    </AuthMiddleware>
  );
}
