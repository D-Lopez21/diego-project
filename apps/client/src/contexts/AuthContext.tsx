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

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async (currentUser: User): Promise<AuthUser> => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.warn('Perfil no encontrado (puede ser un usuario nuevo):', error.message);
        return currentUser;
      }

      return { ...currentUser, profile: data as Profile };
    } catch (e) {
      console.error('Error cargando perfil:', e);
      return currentUser;
    }
  }, []);

  React.useEffect(() => {
    // 🔥 FLAG para evitar actualizaciones después del desmontaje
    let isMounted = true;
    let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

    const initializeAuth = async () => {
      try {
        // 1. Verificar sesión inicial
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!isMounted) return; // 🛡️ Salir si el componente se desmontó

        if (initialSession?.user) {
          const userWithProfile = await fetchProfile(initialSession.user);
          
          if (isMounted) {
            setSession(initialSession);
            setUser(userWithProfile);
          }
        }
      } catch (error) {
        console.error('Error inicializando auth:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // 2. Escuchar cambios de autenticación
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!isMounted) return; // 🛡️ Ignorar eventos si el componente se desmontó

          console.log('🔔 Auth event:', event);

          // 🔥 Actualizar sesión inmediatamente
          setSession(currentSession);

          if (currentSession?.user) {
            // Solo hacer delay en eventos específicos
            if (event === 'SIGNED_IN') {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }

            if (!isMounted) return; // 🛡️ Verificar de nuevo después del delay

            const userWithProfile = await fetchProfile(currentSession.user);
            
            if (isMounted) {
              setUser(userWithProfile);
            }
          } else {
            // Usuario cerró sesión
            if (isMounted) {
              setUser(null);
            }
          }

          if (isMounted) {
            setIsLoading(false);
          }
        }
      );

      authSubscription = subscription;
    };

    initializeAuth();

    // 🔥 CLEANUP: Limpiar suscripción cuando el componente se desmonte
    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchProfile]); // ✅ fetchProfile es estable gracias a useCallback

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