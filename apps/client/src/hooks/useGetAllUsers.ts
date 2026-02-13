/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllUsers() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Usamos useCallback para que la referencia de la función sea estable
  const fetchUsers = React.useCallback(async () => {
    try {
      // No forzamos setLoading(true) aquí para evitar que la UI 
      // parpadee innecesariamente en re-consultas de fondo.
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .neq('role', 'proveedor') // Filtramos para obtener solo analistas/admins
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Error en useGetAllUsers:", err.message);
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
      alert('Error al eliminar usuario: ' + err.message);
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

      // Actualización optimista del estado local
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      return true;
    } catch (err: any) {
      alert('Error al actualizar usuario: ' + err.message);
      return false;
    }
  };

  // Solo se ejecuta una vez al montar el componente
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { 
    users, 
    loading, 
    error, 
    deleteUser, 
    updateUser, 
    refetch: fetchUsers 
  };
}