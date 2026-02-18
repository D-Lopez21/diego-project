/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllUsers() {
  const { isActiveTab, user } = useAuth();
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ fetchUsers corregido para aceptar el signal obligatoriamente
  const fetchUsers = React.useCallback(async (signal: AbortSignal) => {
    if (!user || !isActiveTab) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .neq('role', 'proveedor')
        .eq('active', true)
        .order('name', { ascending: true })
        .abortSignal(signal); 

      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isActiveTab]);

  // ✅ Efecto para carga inicial y limpieza de peticiones
  React.useEffect(() => {
    const controller = new AbortController();
    
    if (isActiveTab && user) {
      fetchUsers(controller.signal);
    }

    return () => controller.abort();
  }, [fetchUsers, isActiveTab, user]);

  // ✅ Función para desactivar usuario (Borrado lógico)
  const deleteUser = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('profile')
        .update({ active: false })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Actualizar estado local para reflejar el cambio instantáneamente
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return true;
    } catch (err: any) {
      alert('Error al desactivar usuario: ' + err.message);
      return false;
    }
  };

  // ✅ Función para actualizar datos del usuario
  const updateUser = async (id: string, updates: Partial<Profile>) => {
    try {
      const { error: updateError } = await supabase
        .from('profile')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Sincronizar el estado local con los nuevos datos
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      return true;
    } catch (err: any) {
      alert('Error al actualizar usuario: ' + err.message);
      return false;
    }
  };

  return { 
    users, 
    loading, 
    error, 
    deleteUser, // Restaurado
    updateUser, // Restaurado
    refetch: () => {
      const controller = new AbortController();
      fetchUsers(controller.signal);
    } 
  };
}