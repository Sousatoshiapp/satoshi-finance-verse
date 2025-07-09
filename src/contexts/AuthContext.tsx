import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

  // Debug logging for mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔄 AuthProvider mounted:', {
        windowWidth: window.innerWidth,
        userAgent: navigator.userAgent.substring(0, 100),
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Add timeout to prevent hanging on mobile
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Auth timeout')), 10000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
        const { data: { session }, error } = result;
        
        if (error) {
          console.error('❌ Auth initialization error:', error);
          // Try to recover with localStorage fallback
          const savedUser = localStorage.getItem('satoshi_user');
          if (savedUser && mounted) {
            console.log('🔄 Using localStorage fallback for auth');
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
            } catch (parseError) {
              console.error('❌ Failed to parse saved user data:', parseError);
            }
          }
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Critical debug info
          console.log('🔄 AUTH INITIALIZATION COMPLETE:', {
            hasUser: !!session?.user,
            hasSession: !!session,
            sessionExpiry: session?.expires_at,
            timestamp: new Date().toISOString(),
            isMobile: window.innerWidth < 768
          });
        }
      } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
        // Allow app to continue even if auth fails
        if (mounted) {
          console.log('🔄 Continuing without auth due to error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('🔄 Auth initialization complete');
        }
      }
    };

    // Set up auth state listener with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔄 Auth event: ${event}`, { hasSession: !!session });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
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
            console.log('🔄 User signed out, clearing cache');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('satoshi_user');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refreshed successfully');
          } else if (event === 'SIGNED_IN') {
            console.log('🔄 User signed in successfully');
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      console.log('🔄 Auth provider cleanup');
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🔄 Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
      }
      // Clear localStorage data
      localStorage.removeItem('satoshi_user');
      console.log('🔄 Sign out complete');
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