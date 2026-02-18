/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllUsers() {
  const { isActiveTab, user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async (signal: AbortSignal) => {
    // 🛡️ Solo intentamos cargar si la sesión ya terminó de cargar
    if (authLoading || !user || !isActiveTab) return;

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('profile')
        .select('*')
        .neq('role', 'proveedor')
        .eq('active', true)
        .order('name', { ascending: true })
        .abortSignal(signal); // ✅ Corregido: signal es obligatorio aquí

      if (err) throw err;
      setUsers(data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, isActiveTab]);

  React.useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  const deleteUser = async (id: string) => {
    try {
      const { error: err } = await supabase.from('profile').update({ active: false }).eq('id', id);
      if (err) throw err;
      setUsers(prev => prev.filter(u => u.id !== id));
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const updateUser = async (id: string, updates: Partial<Profile>) => {
    try {
      const { error: err } = await supabase.from('profile').update(updates).eq('id', id);
      if (err) throw err;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  return { users, loading, error, deleteUser, updateUser, refetch: () => fetchUsers(new AbortController().signal) };
}