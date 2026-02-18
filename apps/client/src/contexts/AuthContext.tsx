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

const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const ACTIVE_TAB_KEY = 'active_tab_id';
const TAB_HEARTBEAT_KEY = 'tab_heartbeat';
const TAB_TIMESTAMP_KEY = 'tab_timestamp';
const HEARTBEAT_INTERVAL = 2000;
const HEARTBEAT_TIMEOUT = 5000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isActiveTab, setIsActiveTab] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);

  const heartbeatIntervalRef = React.useRef<number | null>(null);
  const hasAttemptedActivation = React.useRef(false);

  const fetchProfile = React.useCallback(async (currentUser: User): Promise<AuthUser> => {
    try {
      const { data, error } = await supabase.from('profile').select('*').eq('id', currentUser.id).single();
      if (error) return currentUser;
      return { ...currentUser, profile: data as Profile };
    } catch (e) { return currentUser; }
  }, []);

  const sendHeartbeat = React.useCallback(() => {
    if (localStorage.getItem(ACTIVE_TAB_KEY) === TAB_ID) {
      localStorage.setItem(TAB_HEARTBEAT_KEY, Date.now().toString());
    }
  }, []);

  const forceBeActiveTab = React.useCallback(() => {
    const now = Date.now();
    localStorage.setItem(ACTIVE_TAB_KEY, TAB_ID);
    localStorage.setItem(TAB_HEARTBEAT_KEY, now.toString());
    localStorage.setItem(TAB_TIMESTAMP_KEY, now.toString());
    setIsActiveTab(true);
    setIsChecking(false);
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
  }, [sendHeartbeat]);

  React.useEffect(() => {
    let isMounted = true;
    
    // Validar control de pestaña
    if (!hasAttemptedActivation.current) {
      hasAttemptedActivation.current = true;
      const activeId = localStorage.getItem(ACTIVE_TAB_KEY);
      const lastHeartbeat = parseInt(localStorage.getItem(TAB_HEARTBEAT_KEY) || '0');
      const isDead = Date.now() - lastHeartbeat > HEARTBEAT_TIMEOUT;
      
      if (!activeId || isDead || activeId === TAB_ID) {
        localStorage.setItem(ACTIVE_TAB_KEY, TAB_ID);
        setIsActiveTab(true);
        heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
      }
      setIsChecking(false);
    }

    const initializeAuth = async () => {
      if (!isActiveTab) return;
      const { data: { session: initSession } } = await supabase.auth.getSession();
      if (isMounted && initSession?.user) {
        const fullUser = await fetchProfile(initSession.user);
        setSession(initSession);
        setUser(fullUser);
      }
      setIsLoading(false);
    };

    if (isActiveTab) initializeAuth();

    // Cambiamos 'event' por '_event' para evitar la advertencia de variable no usada
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        const fullUser = await fetchProfile(currentSession.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [isActiveTab, fetchProfile, sendHeartbeat]);

  // Si aún está verificando si esta pestaña es la dueña del localStorage
  if (isChecking) return null; 

  // Pantalla de bloqueo si hay otra pestaña abierta
  if (!isActiveTab) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm border border-amber-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Sesión en otra pestaña</h2>
          <p className="text-slate-600 mb-6 text-sm">Detectamos que tienes el sistema abierto en otra ventana. Cierra la anterior para continuar aquí.</p>
          <button onClick={forceBeActiveTab} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Usar esta pestaña
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isActiveTab, 
      isAdmin: user?.profile?.role === 'admin' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};