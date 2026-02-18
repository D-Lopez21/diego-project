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

// ✅ Generar ID único para esta pestaña
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const ACTIVE_TAB_KEY = 'active_tab_id';
const TAB_HEARTBEAT_KEY = 'tab_heartbeat';
const TAB_TIMESTAMP_KEY = 'tab_timestamp';
const HEARTBEAT_INTERVAL = 2000; // 2 segundos
const HEARTBEAT_TIMEOUT = 5000; // 5 segundos

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isActiveTab, setIsActiveTab] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  const heartbeatIntervalRef = React.useRef<number | null>(null);
  const checkActiveTabIntervalRef = React.useRef<number | null>(null);
  const hasAttemptedActivation = React.useRef(false);

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

  // ✅ Función para verificar si esta pestaña puede ser activa (SIN recargar automáticamente)
  const canBeActiveTab = React.useCallback((): boolean => {
  const activeTabId = localStorage.getItem(ACTIVE_TAB_KEY);
  const lastHeartbeat = localStorage.getItem(TAB_HEARTBEAT_KEY);
  // ✅ Eliminada la línea de tabTimestamp
  
  // Si no hay pestaña activa, esta puede ser activa
  if (!activeTabId) {
    return true;
  }
  
  // Si esta ES la pestaña activa
  if (activeTabId === TAB_ID) {
    return true;
  }
  
  // Verificar si la pestaña activa anterior está muerta
  if (lastHeartbeat) {
    const timeSinceLastHeartbeat = Date.now() - parseInt(lastHeartbeat);
    if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT) {
      console.log('⚠️ Pestaña anterior está muerta');
      return true;
    }
  }
  
  return false;
}, []);
  // ✅ Función para intentar tomar el control (solo si puede)
  const tryTakeControl = React.useCallback(() => {
    if (canBeActiveTab()) {
      const now = Date.now();
      localStorage.setItem(ACTIVE_TAB_KEY, TAB_ID);
      localStorage.setItem(TAB_HEARTBEAT_KEY, now.toString());
      
      // Solo establecer timestamp si no existe
      if (!localStorage.getItem(TAB_TIMESTAMP_KEY)) {
        localStorage.setItem(TAB_TIMESTAMP_KEY, now.toString());
      }
      
      console.log('✅ Esta pestaña tomó el control:', TAB_ID);
      return true;
    }
    return false;
  }, [canBeActiveTab]);

  // ✅ Función para FORZAR que esta pestaña sea la activa
  const forceBeActiveTab = React.useCallback(() => {
    const now = Date.now();
    localStorage.setItem(ACTIVE_TAB_KEY, TAB_ID);
    localStorage.setItem(TAB_HEARTBEAT_KEY, now.toString());
    localStorage.setItem(TAB_TIMESTAMP_KEY, now.toString());
    
    console.log('🔨 FORZANDO esta pestaña como activa:', TAB_ID);
    
    // No recargar, solo cambiar el estado
    setIsActiveTab(true);
    setIsChecking(false);
    
    // Iniciar heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
  }, []);

  // ✅ Enviar heartbeat
  const sendHeartbeat = React.useCallback(() => {
    const activeTabId = localStorage.getItem(ACTIVE_TAB_KEY);
    if (activeTabId === TAB_ID) {
      localStorage.setItem(TAB_HEARTBEAT_KEY, Date.now().toString());
    }
  }, []);

  // ✅ Validar cambio de usuario
  const validateUserSession = React.useCallback(async (currentUserId: string): Promise<boolean> => {
    const storedUserId = localStorage.getItem('current_user_id');
    
    if (storedUserId && storedUserId !== currentUserId) {
      console.warn('⚠️ Detectado cambio de usuario. Cerrando sesión anterior...');
      
      localStorage.clear();
      sessionStorage.clear();
      
      await supabase.auth.signOut();
      
      window.location.href = '/login';
      
      return false;
    }
    
    localStorage.setItem('current_user_id', currentUserId);
    return true;
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    let authSubscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

    // ✅ Intentar tomar el control SIN recargar
    if (!hasAttemptedActivation.current) {
      hasAttemptedActivation.current = true;
      
      const gotControl = tryTakeControl();
      setIsActiveTab(gotControl);
      setIsChecking(false);

      if (gotControl) {
        console.log('✅ Esta es la pestaña activa:', TAB_ID);
        
        // Iniciar heartbeat
        heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
        
        // Verificar si perdemos el control
        checkActiveTabIntervalRef.current = window.setInterval(() => {
          const activeTabId = localStorage.getItem(ACTIVE_TAB_KEY);
          if (activeTabId !== TAB_ID) {
            console.log('⚠️ Otra pestaña tomó el control');
            setIsActiveTab(false);
            if (heartbeatIntervalRef.current) {
              clearInterval(heartbeatIntervalRef.current);
              heartbeatIntervalRef.current = null;
            }
          }
        }, HEARTBEAT_INTERVAL);
      } else {
        console.warn('⚠️ Esta pestaña NO es activa. Esperando...');
        
        // Verificar periódicamente si la pestaña activa murió
        checkActiveTabIntervalRef.current = window.setInterval(() => {
          if (canBeActiveTab() && !isActiveTab) {
            console.log('✅ La pestaña activa murió. Esta pestaña puede tomar el control.');
            const gotControl = tryTakeControl();
            if (gotControl) {
              setIsActiveTab(true);
              // Iniciar heartbeat
              heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
            }
          }
        }, HEARTBEAT_INTERVAL);
      }
    }

    // ✅ Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVE_TAB_KEY) {
        const newActiveTab = e.newValue;
        if (newActiveTab !== TAB_ID && newActiveTab !== null) {
          console.log('⚠️ Otra pestaña tomó el control vía storage');
          setIsActiveTab(false);
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const initializeAuth = async () => {
      // Esperar a que se determine si es activa
      if (!isActiveTab) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (initialSession?.user) {
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

      // Solo suscribirse en la pestaña activa
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!isMounted) return;

          console.log('🔔 Auth event:', event);

          setSession(currentSession);

          if (currentSession?.user) {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              const isValid = await validateUserSession(currentSession.user.id);
              
              if (!isValid || !isMounted) return;
            }

            if (event === 'SIGNED_IN') {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }

            if (!isMounted) return;

            const userWithProfile = await fetchProfile(currentSession.user);
            
            if (isMounted) {
              setUser(userWithProfile);
            }
          } else {
            if (isMounted) {
              setUser(null);
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

    // Solo inicializar auth si es la pestaña activa
    if (isActiveTab) {
      initializeAuth();
    }

    // Cleanup
    return () => {
      isMounted = false;
      
      if (authSubscription) {
        authSubscription.unsubscribe();
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      if (checkActiveTabIntervalRef.current) {
        clearInterval(checkActiveTabIntervalRef.current);
      }

      window.removeEventListener('storage', handleStorageChange);

      // Si esta era la pestaña activa, limpiar
      const activeTabId = localStorage.getItem(ACTIVE_TAB_KEY);
      if (activeTabId === TAB_ID) {
        localStorage.removeItem(ACTIVE_TAB_KEY);
        localStorage.removeItem(TAB_HEARTBEAT_KEY);
        // NO limpiar TAB_TIMESTAMP_KEY para mantener la referencia
      }
    };
  }, [isActiveTab, fetchProfile, validateUserSession, tryTakeControl, canBeActiveTab, sendHeartbeat]);

  // ✅ Pantalla de carga inicial
  if (isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
        </div>
      </div>
    );
  }

  // ✅ Si no es la pestaña activa, mostrar mensaje (SIN bucle infinito)
  if (!isActiveTab) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800">
                Sesión Activa en Otra Pestaña
              </h2>
              
              <p className="text-slate-600">
                Ya tienes una sesión abierta en otra pestaña del navegador. 
                Cierra la otra pestaña primero, o fuerza el uso de esta.
              </p>

              <div className="flex flex-col gap-3 w-full mt-4">
                <button
                  onClick={forceBeActiveTab}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  🔨 Usar Esta Pestaña (Forzar)
                </button>
                
                <button
                  onClick={() => window.close()}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cerrar Esta Pestaña
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-700">
                  💡 <strong>Consejo:</strong> Cierra las demás pestañas primero. Si usas "Forzar", la otra pestaña se volverá inactiva.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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