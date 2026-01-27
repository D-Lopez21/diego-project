import { supabase } from '../lib/supabase';

export function useSignOut() {
  const signOutFunction = async () => {
    try {
      console.log('Iniciando cierre de sesión...');
      // 1. Intentamos cerrar sesión en Supabase
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Error silencioso en signOut:', err);
    } finally {
      // 2. PASE LO QUE PASE, limpiamos el rastro local
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/sign-in';
    }
  };
  return signOutFunction;
}
