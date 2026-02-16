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
        .eq('active', true) // 🔥 SOLO OBTENER USUARIOS ACTIVOS
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

  // 🔥 CAMBIO PRINCIPAL: En lugar de borrado físico, hacer borrado lógico
  const deleteUser = async (id: string) => {
    try {
      // Cambiamos de borrado físico a borrado lógico
      const { error: updateError } = await supabase
        .from('profile')
        .update({ active: false }) // Marcar como inactivo
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Remover del estado local para que desaparezca de la UI
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return true;
    } catch (err: any) {
      alert('Error al desactivar usuario: ' + err.message);
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

      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      return true;
    } catch (err: any) {
      alert('Error al actualizar usuario: ' + err.message);
      return false;
    }
  };

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