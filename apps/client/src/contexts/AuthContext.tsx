/* eslint-disable react-refresh/only-export-components */
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import React from 'react';

export interface Profile {
  name: string;
  id: string;
  role: 'admin' | 'user' | 'auditoria' | 'proveedor'; // 👈 Agrega todos tus roles
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

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProfile = async (currentUser: User): Promise<AuthUser> => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        // Si el perfil no existe aún, no es un error crítico
        console.warn(
          'Perfil no encontrado (puede ser un usuario nuevo):',
          error.message,
        );
        return currentUser;
      }

      return { ...currentUser, profile: data as Profile };
    } catch (e) {
      console.error('Error cargando perfil:', e);
      return currentUser;
    }
  };

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Verificar sesión inicial
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession?.user) {
          const userWithProfile = await fetchProfile(initialSession.user);
          setSession(initialSession);
          setUser(userWithProfile);
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
      } finally {
        setIsLoading(false);
      }

      // 2. Escuchar cambios
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log('🔔 Auth event en Context:', event);

        setSession(currentSession);

        if (currentSession?.user) {
          // 👇 Pequeño delay para dar tiempo a que se cree el perfil
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          const userWithProfile = await fetchProfile(currentSession.user);
          setUser(userWithProfile);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      });

      return subscription;
    };

    const authSub = initializeAuth();

    return () => {
      authSub.then((sub) => sub.unsubscribe());
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin:
          user?.profile?.role === 'admin' ||
          user?.user_metadata?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
