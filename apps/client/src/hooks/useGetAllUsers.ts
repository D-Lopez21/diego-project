/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllUsers() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    // Solo ponemos loading true la primera vez para no parpadear en cada update
    try {
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .order('name', { ascending: true }); // Opcional: ordenar por nombre

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // 1. Carga inicial
    fetchUsers();

    // 2. Suscripción en tiempo real
    const channel = supabase
      .channel('profile-changes') // Nombre del canal
      .on(
        'postgres_changes',
        {
          event: '*', // Escucha INSERT, UPDATE y DELETE
          schema: 'public',
          table: 'profile',
        },
        () => {
          // Cuando algo cambie, volvemos a pedir los datos
          fetchUsers();
        },
      )
      .subscribe();

    // 3. Limpiar suscripción al desmontar el componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
