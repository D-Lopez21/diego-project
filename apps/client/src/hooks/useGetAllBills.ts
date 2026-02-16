/* eslint-disable @typescript-eslint/no-explicit-any */
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

  React.useEffect(() => {
    let isMounted = true;

    // 🔥 Funciones dentro del useEffect para evitar dependencias circulares
    const fetchBills = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('bills')
          .select('*')
          .order('arrival_date', { ascending: false });

        if (supabaseError) throw supabaseError;
        
        if (isMounted) {
          setBills(data || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchProviders = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('profile')
          .select('*')
          .eq('role', 'proveedor')
          .eq('active', true);

        if (supabaseError) throw supabaseError;
        
        if (isMounted) {
          setProviders(data || []);
        }
      } catch (err: any) {
        console.error('Error fetching providers:', err.message);
      }
    };

    // Carga inicial
    fetchBills();
    fetchProviders();

    // Suscripción realtime
    const billsChannel = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
          if (!isMounted) return;

          console.log('📊 Bill changed:', payload.eventType);

          // Actualización optimista del estado
          if (payload.eventType === 'INSERT') {
            setBills((prev) => [payload.new as Bill, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBills((prev) =>
              prev.map((bill) =>
                bill.id === payload.new.id ? (payload.new as Bill) : bill
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setBills((prev) => prev.filter((bill) => bill.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      isMounted = false;
      supabase.removeChannel(billsChannel);
    };
  }, []); // ← Sin dependencias

  // 🔥 Función de eliminación separada (no afecta useEffect)
  const deleteBill = React.useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Actualización optimista
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting bill:', err.message);
      return false;
    }
  }, []);

  // 🔥 Función de refetch manual
  const refetch = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from('bills')
        .select('*')
        .order('arrival_date', { ascending: false });

      if (supabaseError) throw supabaseError;
      setBills(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProviderName = React.useCallback(
    (providerId?: string) => {
      if (!providerId) return 'Sin proveedor';
      const provider = providers.find((p) => p.id === providerId);
      return provider
        ? `${provider.name}${provider.rif ? ` - ${provider.rif}` : ''}`
        : 'Cargando...';
    },
    [providers]
  );

  return { bills, loading, error, getProviderName, deleteBill, refetch };
}