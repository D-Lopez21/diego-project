/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../contexts/AuthContext';

export function useGetAllProviders() {
  const [providers, setProviders] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Función para obtener todos los proveedores
  const fetchProviders = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .eq('role', 'proveedor')
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setProviders(data || []);
    } catch (err: any) {
      console.error("Error en useGetAllProviders:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un proveedor (Actualización Optimista)
  const updateProvider = React.useCallback(async (id: string, updates: Partial<Profile>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('profile')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Actualizamos el estado local inmediatamente
      setProviders(prev => 
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      );
      
      return true;
    } catch (err: any) {
      console.error("Error updating provider:", err.message);
      throw err;
    }
  }, []);

  // Función para eliminar un proveedor (Eliminación Optimista)
  const deleteProvider = React.useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('profile')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // LA CLAVE: Filtramos el estado local para que desaparezca de la UI al instante
      setProviders(prev => prev.filter(p => p.id !== id));
      
      return true;
    } catch (err: any) {
      console.error("Error deleting provider:", err.message);
      throw err;
    }
  }, []);

  // Función para refrescar manualmente
  const refetch = React.useCallback(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Carga inicial
  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return { 
    providers, 
    loading, 
    error,
    updateProvider,
    deleteProvider,
    refetch 
  };
}