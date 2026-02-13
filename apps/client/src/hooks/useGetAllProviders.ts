import React from 'react';
import { supabase } from '../lib/supabase';

export function useGetAllProviders() {
  const [suppliers, setSuppliers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchSuppliers = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('role', 'proveedor')
        .order('name', { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err: any) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return { providers: suppliers, loading };
}