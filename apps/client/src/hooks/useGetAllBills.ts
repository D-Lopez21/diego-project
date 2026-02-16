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

  // --- FUNCIÓN DE REFETCH (Definida arriba para que useEffect pueda usarla) ---
  const refetch = React.useCallback(async () => {
    // Solo ponemos loading si no hay datos previos para evitar parpadeos molestos
    if (bills.length === 0) setLoading(true); 
    setError(null);
    
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
  }, [bills.length]);

  React.useEffect(() => {
    let isMounted = true;

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
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
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
        if (isMounted) setProviders(data || []);
      } catch (err: any) {
        console.error('Error fetching providers:', err.message);
      }
    };

    // 1. Carga inicial
    fetchBills();
    fetchProviders();

    // 2. Lógica para cuando el usuario vuelve de YouTube/Otras pestañas
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Sincronizando facturas por cambio de pestaña...');
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Suscripción Realtime (WebSockets)
    const billsChannel = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
          if (!isMounted) return;

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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(billsChannel);
    };
  }, [refetch]); // Agregado refetch como dependencia

  // Función de eliminación
  const deleteBill = React.useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setBills((prev) => prev.filter((bill) => bill.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting bill:', err.message);
      return false;
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