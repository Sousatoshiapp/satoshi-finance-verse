import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { debugNavigation } from "@/utils/navigation-debug";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        debugNavigation.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth initialization error:', error);
          // Try to recover with localStorage fallback
          const savedUser = localStorage.getItem('satoshi_user');
          if (savedUser && mounted) {
            debugNavigation.log('Using localStorage fallback for auth');
            // Allow app to continue with localStorage data
          }
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          debugNavigation.logAuthState(session?.user, session, false);
          
          // Critical debug info
          console.log('🔄 AUTH INITIALIZATION COMPLETE:', {
            hasUser: !!session?.user,
            hasSession: !!session,
            sessionExpiry: session?.expires_at,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          debugNavigation.log('Auth initialization complete');
        }
      }
    };

    // Set up auth state listener with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        debugNavigation.log(`Auth event: ${event}`, { hasSession: !!session });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          debugNavigation.logAuthState(session?.user, session, false);
          
          // Detailed event logging
          console.log('🔄 AUTH STATE CHANGE:', {
            event,
            hasUser: !!session?.user,
            hasSession: !!session,
            userId: session?.user?.id,
            sessionExpiry: session?.expires_at,
            timestamp: new Date().toISOString()
          });
          
          // Handle specific auth events
          if (event === 'SIGNED_OUT') {
            debugNavigation.log('User signed out, clearing cache');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('satoshi_user');
          } else if (event === 'TOKEN_REFRESHED') {
            debugNavigation.log('Token refreshed successfully');
          } else if (event === 'SIGNED_IN') {
            debugNavigation.log('User signed in successfully');
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      debugNavigation.log('Auth provider cleanup');
    };
  }, []);

  const signOut = async () => {
    try {
      debugNavigation.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
      }
      // Clear localStorage data
      localStorage.removeItem('satoshi_user');
      debugNavigation.log('Sign out complete');
    } catch (error) {
      console.error('❌ Failed to sign out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}