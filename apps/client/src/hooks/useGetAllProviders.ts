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
        .eq('role', 'proveedor') // ✅ Filtrar solo proveedores
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setSuppliers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // 1. Carga inicial
    fetchSuppliers();

    // 2. Suscripción en tiempo real
    const channel = supabase
      .channel('supplier-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile',
          filter: 'role=eq.proveedor', // ✅ Solo escuchar cambios en proveedores
        },
        () => {
          fetchSuppliers();
        },
      )
      .subscribe();

    // 3. Limpiar suscripción al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSuppliers]);

  return { providers: suppliers, loading, error, refetch: fetchSuppliers };
}