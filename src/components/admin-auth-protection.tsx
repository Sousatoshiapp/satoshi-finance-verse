import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/shared/ui/card';

interface AdminAuthProtectionProps {
  children: ReactNode;
}

export function AdminAuthProtection({ children }: AdminAuthProtectionProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Acesso negado. Faça login para continuar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}