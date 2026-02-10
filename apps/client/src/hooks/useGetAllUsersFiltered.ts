/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

type SimulatedRolesEnum = 'admin' | 'recepcion' | 'liquidacion' | 'auditoria' | 'pagos' | 'finiquito' | 'programacion' | 'proveedor';

export function useGetAllUsersFiltered(filterRole: SimulatedRolesEnum) {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .eq('role', filterRole)
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterRole]); // ← FIX CRÍTICO: Incluir filterRole aquí

  React.useEffect(() => {
    // 1. Carga inicial
    fetchUsers();

    // 2. Suscripción en tiempo real
    const channel = supabase
      .channel(`profile-changes-${filterRole}`) // ← Canal único por rol
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile',
          filter: `role=eq.${filterRole}`, // ← Solo escuchar cambios de este rol
        },
        () => {
          fetchUsers();
        },
      )
      .subscribe();

    // 3. Limpiar suscripción
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers, filterRole]); // ← Incluir filterRole también aquí

  return { users, loading, error, refetch: fetchUsers };
}