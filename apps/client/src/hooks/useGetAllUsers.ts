/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllUsers() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .neq('role', 'proveedor')
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.rpc('delete_user_completely', { user_id: id });
      if (deleteError) throw deleteError;
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return true;
    } catch (err: any) {
      alert('Error: ' + err.message);
      return false;
    }
  };

  const updateUser = async (id: string, updates: Partial<Profile>) => {
    try {
      const { error: updateError } = await supabase
        .from('profile')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Esto actualiza la tabla automáticamente al instante
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      return true;
    } catch (err: any) {
      alert('Error al actualizar: ' + err.message);
      return false;
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, deleteUser, updateUser, refetch: fetchUsers };
}