/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllProviders() {
  const [suppliers, setSuppliers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSuppliers = React.useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .eq('role', 'proveedor')
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setSuppliers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProvider = async (id: string, updates: Partial<Profile>) => {
    try {
      const { error: updateError } = await supabase
        .from('profile')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      // Actualización reactiva local
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      return true;
    } catch (err: any) {
      alert('Error al actualizar: ' + err.message);
      return false;
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      // Usamos la misma función RPC que creamos para borrar de Auth y Profile
      const { error: deleteError } = await supabase.rpc('delete_user_completely', { user_id: id });
      if (deleteError) throw deleteError;
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
      return false;
    }
  };

  React.useEffect(() => {
    fetchSuppliers();
    const channel = supabase
      .channel('supplier-changes')
      .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'profile', 
          filter: 'role=eq.proveedor' 
        }, 
        () => fetchSuppliers()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSuppliers]);

  return { 
    providers: suppliers, 
    loading, 
    error, 
    updateProvider, 
    deleteProvider, 
    refetch: fetchSuppliers 
  };
}