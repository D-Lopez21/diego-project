import React from 'react';
import { supabase } from '../lib/supabase';
import type { Bill } from '../components/bills-details/interfaces';

interface Provider {
  id: string;
  name: string;
  rif?: string;
  role: string;
  active: boolean;
}

export function useGetAllBills() {
  const [bills, setBills] = React.useState<Bill[]>([]);
  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBills = React.useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('bills')
        .select('*')
        // CAMBIO: Usamos arrival_date porque created_at no existe en tu tabla
        .order('arrival_date', { ascending: false }); 

      if (supabaseError) throw supabaseError;
      setBills(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProviders = React.useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('profile')
        .select('*')
        .eq('role', 'proveedor') // Asegúrate que en la tabla profile el rol sea exacto
        .eq('active', true)
        .order('name', { ascending: true });

      if (supabaseError) throw supabaseError;
      setProviders(data || []);
    } catch (err: any) {
      console.error('Error fetching providers:', err.message);
    }
  }, []);

  React.useEffect(() => {
    fetchBills();
    fetchProviders();

    const billsChannel = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
        },
        () => {
          fetchBills();
        },
      )
      .subscribe();

    const providersChannel = supabase
      .channel('providers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile',
          // Filtro corregido para la suscripción real-time
          filter: 'role=eq.proveedor',
        },
        () => {
          fetchProviders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(billsChannel);
      supabase.removeChannel(providersChannel);
    };
  }, [fetchBills, fetchProviders]);

  const getProviderName = React.useCallback(
    (providerId?: string) => {
      if (!providerId) return 'Sin proveedor';
      const provider = providers.find((p) => p.id === providerId);
      return provider
        ? `${provider.name}${provider.rif ? ` - ${provider.rif}` : ''}`
        : providerId;
    },
    [providers],
  );

  const deleteBill = React.useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('bills')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        return true;
      } catch (err: any) {
        console.error('Error deleting bill:', err.message);
        return false;
      }
    },
    [],
  );

  return {
    bills,
    providers,
    loading,
    error,
    getProviderName,
    deleteBill,
    refetch: fetchBills,
  };
}