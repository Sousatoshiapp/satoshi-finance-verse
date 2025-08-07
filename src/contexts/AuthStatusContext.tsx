import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthStatusContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthStatusContext = createContext<AuthStatusContextType | undefined>(undefined);

export function AuthStatusProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    try {
      // Clear localStorage before signing out
      localStorage.removeItem('satoshi_user');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }, []);

  const value = React.useMemo(() => ({
    loading,
    setLoading,
    signOut,
  }), [loading, signOut]);

  return (
    <AuthStatusContext.Provider value={value}>
      {children}
    </AuthStatusContext.Provider>
  );
}

export function useAuthStatus() {
  const context = useContext(AuthStatusContext);
  if (context === undefined) {
    throw new Error("useAuthStatus must be used within an AuthStatusProvider");
  }
  return context;
}