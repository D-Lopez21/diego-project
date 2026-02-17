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

  // ✅ Nueva función para validar cambio de usuario
  const validateUserSession = React.useCallback(async (currentUserId: string): Promise<boolean> => {
    const storedUserId = localStorage.getItem('current_user_id');
    
    // Si hay un usuario diferente almacenado, cerrar sesión
    if (storedUserId && storedUserId !== currentUserId) {
      console.warn('⚠️ Detectado cambio de usuario. Cerrando sesión anterior...');
      
      // Limpiar todo
      localStorage.clear();
      sessionStorage.clear();
      
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Recargar la página para limpiar el estado
      window.location.href = '/login';
      
      return false;
    }
    
    // Guardar el ID del usuario actual
    localStorage.setItem('current_user_id', currentUserId);
    return true;
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

    const initializeAuth = async () => {
      try {
        // 1. Verificar sesión inicial
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (initialSession?.user) {
          // ✅ Validar que no haya cambio de usuario
          const isValid = await validateUserSession(initialSession.user.id);
          
          if (!isValid || !isMounted) return;

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
          if (!isMounted) return;

          console.log('🔔 Auth event:', event);

          // 🔥 Actualizar sesión inmediatamente
          setSession(currentSession);

          if (currentSession?.user) {
            // ✅ Validar cambio de usuario en cada evento de autenticación
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              const isValid = await validateUserSession(currentSession.user.id);
              
              if (!isValid || !isMounted) return;
            }

            // Solo hacer delay en eventos específicos
            if (event === 'SIGNED_IN') {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }

            if (!isMounted) return;

            const userWithProfile = await fetchProfile(currentSession.user);
            
            if (isMounted) {
              setUser(userWithProfile);
            }
          } else {
            // Usuario cerró sesión
            if (isMounted) {
              setUser(null);
              // ✅ Limpiar el ID almacenado
              localStorage.removeItem('current_user_id');
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

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchProfile, validateUserSession]);

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