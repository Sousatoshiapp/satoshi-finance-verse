import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FloatingNavbar } from '@/components/floating-navbar';

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
  const content = requiresAuth ? (
    <ProtectedRoute>
      {children}
      {showNavbar && <FloatingNavbar />}
    </ProtectedRoute>
  ) : (
    <>
      {children}
      {showNavbar && <FloatingNavbar />}
    </>
  );

  return content;
}
