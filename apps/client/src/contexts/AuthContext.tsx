/* eslint-disable react-refresh/only-export-components */
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import React from 'react';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'recepcion' | 'liquidacion' | 'auditoria' | 'programacion' | 'pagos' | 'finiquito' | 'proveedor' | 'user'; 
  rif: string | null;
  suppliers_id: string | null;
  password_change_required: boolean;
  active: boolean;
}

export type AuthUser = User & { profile?: Profile | null };

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async (currentUser: User): Promise<AuthUser> => {
    try {
      const { data, error } = await supabase.from('profile').select('*').eq('id', currentUser.id).single();
      return error ? currentUser : { ...currentUser, profile: data as Profile };
    } catch { return currentUser; }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(s);
          if (s?.user) {
            const fullUser = await fetchProfile(s.user);
            setUser(fullUser);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false); // ✅ Garantiza que el spinner se detenga
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!isMounted) return;
      setSession(s);
      if (s?.user) {
        const fullUser = await fetchProfile(s.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isAdmin: user?.profile?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};