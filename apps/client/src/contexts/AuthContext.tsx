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
  isActiveTab: boolean; 
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const TAB_ID = `tab_${Date.now()}`;
const ACTIVE_TAB_KEY = 'active_tab_id';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isActiveTab, setIsActiveTab] = React.useState(false);

  const fetchProfile = React.useCallback(async (currentUser: User): Promise<AuthUser> => {
    try {
      const { data, error } = await supabase.from('profile').select('*').eq('id', currentUser.id).single();
      return error ? currentUser : { ...currentUser, profile: data as Profile };
    } catch { return currentUser; }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    // 1. Lógica simple de pestaña única
    const currentActive = localStorage.getItem(ACTIVE_TAB_KEY);
    if (!currentActive || currentActive === TAB_ID) {
      localStorage.setItem(ACTIVE_TAB_KEY, TAB_ID);
      setIsActiveTab(true);
    }

    // 2. Inicialización de Auth
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(s);
          if (s?.user) {
            const u = await fetchProfile(s.user);
            setUser(u);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false); // ✅ Garantiza que el spinner se detenga
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!isMounted) return;
      setSession(s);
      if (s?.user) {
        const u = await fetchProfile(s.user);
        setUser(u);
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

  // Si no es la pestaña activa, mostramos el botón de rescate inmediatamente
  if (!isActiveTab && !isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white p-4">
        <button 
          onClick={() => { localStorage.setItem(ACTIVE_TAB_KEY, TAB_ID); window.location.reload(); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg font-bold"
        >
          Usar esta pestaña (Desbloquear)
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isActiveTab, isAdmin: user?.profile?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};