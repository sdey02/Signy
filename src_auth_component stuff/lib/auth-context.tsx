'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createBrowserClient } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false); // Track if initial session check is complete
  const router = useRouter();
  
  // Create a Supabase client for browser use
  const supabase = createBrowserClient();

  useEffect(() => {
    // Initial session check - this is crucial for session persistence
    const getSession = async () => {
      if (initialized) return; // Avoid multiple initializations
      
      setIsLoading(true);
      try {
        console.log('Checking for session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }
        
        if (data.session) {
          console.log('Session found for user:', data.session.user.email);
          console.log('Session expiry:', new Date(data.session.expires_at! * 1000).toISOString());
          
          // Set the session and user state
          setSession(data.session);
          setUser(data.session.user);
          
          // Force a refresh token call to ensure token stays fresh
          await supabase.auth.refreshSession();
        } else {
          console.log('No session found - this is normal for logged out users');
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
      } finally {
        setIsLoading(false);
        setInitialized(true); // Mark initialization as complete
      }
    };

    getSession();

    // Listen for auth changes - this helps with real-time session updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', newSession?.user?.email);
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            router.push('/documents'); // Navigate to documents page
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          router.push('/auth/signin'); // Navigate to sign-in page
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for session');
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful with session expiry:', 
          new Date(data.session.expires_at! * 1000).toISOString());
        // Don't navigate here - let the onAuthStateChange handler do it
      }
      
      return { error };
    } catch (err: any) {
      console.error('Unexpected sign in error:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Signing up user:', email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful');
      }
      
      return { error };
    } catch (err: any) {
      console.error('Unexpected sign up error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut({
        scope: 'local' // Only sign out from this device/browser
      });
      console.log('Sign out successful');
      
      // Don't navigate here - let the onAuthStateChange handler do it
      // Clear local state
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 