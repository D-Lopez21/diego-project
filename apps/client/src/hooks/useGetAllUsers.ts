/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllUsers() {
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    // 1. FORZAMOS EL LOADING CADA VEZ QUE SE LLAMA A LA FUNCIÓN
    setLoading(true); 
    try {
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .neq('role', 'proveedor')
        .eq('active', true)
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error en useGetAllUsers:", err.message);
      setError(err.message);
    } finally {
      // 2. ASEGURAMOS QUE EL LOADING TERMINE SIEMPRE
      setLoading(false);
    }
  }, []);

  const deleteUser = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('profile')
        .update({ active: false })
        .eq('id', id);
      
      if (updateError) throw updateError;
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

  // 3. MEJORAMOS EL EFFECT CON UNA VARIABLE DE CONTROL
  React.useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchUsers();
    }

    return () => {
      isMounted = false; // Evita fugas de memoria y errores al navegar
    };
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