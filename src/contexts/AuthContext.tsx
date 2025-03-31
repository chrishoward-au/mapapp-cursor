import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient'; // Import your initialized client

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until session is checked

  // Fetch initial session and set up auth state listener
  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component

    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSession();

    // Listen for changes in authentication state (login, logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted) {
           console.log('Supabase auth event:', event, session); // Debug log
           setSession(session);
           setUser(session?.user ?? null);
           setIsLoading(false); // No longer loading once state change is processed
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      // Handle error appropriately (e.g., show notification)
    }
    // State will update via onAuthStateChange listener
  }, []);

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until loading is complete */}
      {!isLoading ? children : <div>Loading Authentication...</div> /* Or a spinner */}
    </AuthContext.Provider>
  );
}; 